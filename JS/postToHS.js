// JavaScript Document
/* eslint-env es6 */

// This loops through the events that the Candiate registered for and returns them in a ";" seperated list.
function getRegOptions() {
	const regOptions = '#attendee-options div:first-child #registration-option-list > label'; // full list of candidate registration options.
	const regOptionsCount = $(regOptions).length; // checks the number of available options.
	const selectedEvents = []; // this will be the final l ist of selected events.

	// loop through and get the ones that have been checked off.
	for (let i = 0; i < regOptionsCount; i++) {
		// first check to see if the box is checked
		if ($(`${regOptions}:nth-child(${i + 1}) input[checked="checked"]`).length > 0) {
			const eventElement = $(`${regOptions}:nth-child(${i + 1}) > .ml-5`); // if it is checked get the element that has the name of the event.
			selectedEvents.push($(eventElement).html().trim()); // push the name of the event to the array.
		}
	}

	return selectedEvents.join(';'); // semi-colon sepeate everything before returning it.
}

// this collects the Blackbaud Form fields and organizes them such that they can be submitted to the Hubspot Form correctly.  Throughout this form you'll see references to [data-ordinalid="1"] - this just specifies that we want the first instance of each piece of data. ONLY THE FIRST THING WILL BE SUBMITTED TO HUBSPOT.  ONLY THE FIRST CANDIDATE, ONLY THE FIRST PARENT, ONLY THE FIRST ADDRESS, ETC...
function formFieldsToHSJSON() {
	const allFields = [];

	let formattedAddress = `${$('#field2091[data-ordinalid="1"]').val()}`; // first address field

	if ($('#field2092').val()) {
		formattedAddress += `, ${$('#field2092[data-ordinalid="1"]').val()}`; // second address field, if exists.
	}

	if ($('#field2093').val()) {
		formattedAddress += `, ${$('#field2093[data-ordinalid="1"]').val()}`; // third address field, if exists.
	}

	const regOptions = getRegOptions(); // get the list of events the candidate registered for.

	// this is the list of contact properties present on the hubspot form.
	const fields = [
		'email',
		'firstname',
		'lastname',
		'date_of_birth',
		'child_s_name',
		'child_s_last_name',
		'phone',
		'address',
		'city',
		'state',
		'zip',
		'grade_interested_in',
		'entering_year',
		'registered_for_open_house',
	];

	// this is the data returned from the Blackbaud form organized such that the index of each piece of data corrisponds with the index of each of the contact properties listed in the [fields] array above.
	const responses = [
		$('#field2051[data-ordinalid="1"]').val(), // email
		$('#field2044[data-ordinalid="1"]').val(), // first name
		$('#field2046[data-ordinalid="1"]').val(), // last name
		$('#field2007[data-ordinalid="1"]').val(), // date of birth
		$('#field2001[data-ordinalid="1"]').val(), // child's name
		$('#field2003[data-ordinalid="1"]').val(), // child's last name
		$('#field2028[data-ordinalid="1"]').val(), // phone
		formattedAddress, // address
		$('#field2094[data-ordinalid="1"]').val(), // city
		$('#field2095[data-ordinalid="1"]').val(), // state
		$('#field2097[data-ordinalid="1"]').val(), // zip
		$('#field2035[data-ordinalid="1"] option:selected').html(), // grade interested in
		$('#field2033[data-ordinalid="1"]').val(), // interested in year
		regOptions, // registered for open house
	];

	// format everything the way the Hubspot API expects.
	for (let i = 0; i < fields.length; i++) {
		allFields.push({ name: fields[i], value: responses[i] });
	}

	return allFields;
}

// queries ipify.org in order to return the users Public IP address (required for tracking form submission)
async function getIP() {
	const response = await fetch('https://api.ipify.org?format=json');

	if (!response.ok) {
		throw new Error('Error while fetching resources.');
	}

	const data = await response.json();

	return data;
}

// pulls the Hubspot Tracking Cookie to link users more directly.
function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);

	if (parts.length === 2) {
		return parts.pop().split(';').shift();
	}

	return null;
}

// collects the contextual data required to submit the form and track the user correctly.
function buildHSContext(ip) {
	const hsContext = {};
	hsContext.hutk = getCookie('hubspotutk'); // get hubspot cookie
	hsContext.pageUri = window.location.href; // get source URL.
	hsContext.pageName = document.title; // get page name.
	hsContext.ipAddress = ip; // returned from getIP();

	return hsContext;
}

// marry the reformatted blackbaud data with the hubspot contextual data so that everything is fully packaged into a single object for form submission.  IP has to be passed discreetly because it needs to be gathered by querying an external API.
function prepareHSFormSubmission(ip) {
	const submissionData = {};
	submissionData.submittedAt = Date.now();
	submissionData.fields = formFieldsToHSJSON(); // fields from blackbaud form.
	submissionData.context = buildHSContext(ip); // fields for hubspot.
	return submissionData;
}

// actually post the data to hubspot with the correct options.
async function postData(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'same-origin',
		headers: {
			'Content-Type': 'application/json',
		},
		redirect: 'follow',
		referrerPolicy: 'no-referrer',
		body: JSON.stringify(data), // body data type must match "Content-Type" header
	});

	return response.json(); // parses JSON response into native JS objects
}

// triggers the post function above and provides the response to the div with the ID #thankyou
function submitHSForm(hsFormURL, data) {
	postData(hsFormURL, data)
		.then((res) => {
			$('#form-formbuttons button.btn-approve.submitreview:not(#rpsSubmitButton)').click(); // after submitting to hubspot, submit to ArgoNet.

			// This will take the return message from HubSpot (definable in the form) and print it to a div with the ID #thankyou.
			/*
			if (res.inlineMessage) {
				// Set an inline thank you message
				// document.querySelector('#thankyou').innerHTML = res.inlineMessage;
			}
			*/
		})
		.catch((err) => {
			console.log(err);
		});
}

// trigger everything above, providing the correct form ID / GUID to the API URI and then packaging everything together for form submission.
function submitData() {
	const baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit'; // The form submission api URI.
	const portalId = '6011012'; // Add the HubSpot portalID where the form should submit
	const formGuid = 'dc798e1c-0fd4-4494-aa44-79a58f114bf2'; // Add the HubSpot form GUID from your HubSpot portal
	const submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`;

	// run getIP() before anything else so that API can finish before trying to add it to the context object for parsing by the Hubspot API.
	getIP()
		.then((res) => {
			const formData = prepareHSFormSubmission(res.ip); // get form data
			submitHSForm(submitURL, formData); // submit form.
		})
		.catch((err) => {
			console.log(err);
		});
}
