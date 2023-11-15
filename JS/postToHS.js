// JavaScript Document
/* eslint-env es6 */

// this collects the Blackbaud Form fields and organizes them such that they can be submitted to the Hubspot Form correctly.
function formFieldsToHSJSON() {
	const allFields = [];

	let formattedAddress = `${$('#field2091').val()}`;

	if ($('#field2092').val()) {
		formattedAddress += `, ${$('#field2092').val()}`;
	}

	if ($('#field2093').val()) {
		formattedAddress += `, ${$('#field2093').val()}`;
	}

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
		$('#field2051').val(),
		$('#field2044').val(),
		$('#field2046').val(),
		$('#field2007').val(),
		$('#field2001').val(),
		$('#field2003').val(),
		$('#field2028').val(),
		formattedAddress,
		$('#field2094').val(),
		$('#field2095').val(),
		$('#field2097').val(),
		$('#field2035').val(),
		$('#field2033').val(),
		'Lower School Open House', // TBD
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
	hsContext.hutk = getCookie('hubspotutk');
	hsContext.pageUri = window.location.href;
	hsContext.pageName = document.title;
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
	console.log('submitting...')
	const baseSubmitURL = 'https://api.hsforms.com/submissions/v3/integration/submit';
	// Add the HubSpot portalID where the form should submit
	const portalId = '6011012';
	// Add the HubSpot form GUID from your HubSpot portal
	const formGuid = 'dc798e1c-0fd4-4494-aa44-79a58f114bf2';
	const submitURL = `${baseSubmitURL}/${portalId}/${formGuid}`;

	// run getIP() before anything else so that API can finish before trying to add it to the context object for parsing by the Hubspot API.
	getIP()
		.then((res) => {
			const formData = prepareHSFormSubmission(res.ip);
			submitHSForm(submitURL, formData);
		})
		.catch((err) => {
			console.log(err);
		});
}
