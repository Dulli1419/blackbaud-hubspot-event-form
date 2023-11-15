// JavaScript Document
/* eslint-env es6 */

// This block injects  custom CSS into the ArgoNet form.
function addCSS() {
	const uriAddressCSS = '//www.rutgersprep.org/uploaded/Tech_Office/ArgoNet_Stylesheets/event_registration/new_form/hsStyle.css?';
	const timeNow = Date.now();
	const finalAddress = uriAddressCSS + timeNow;

	// construct the link
	const hubLinkCSS = document.createElement('link');
	hubLinkCSS.defer = true;
	hubLinkCSS.rel = 'stylesheet';
	hubLinkCSS.type = 'text/css';
	hubLinkCSS.href = finalAddress;
	hubLinkCSS.id = 'rpsCSS';

	document.getElementsByTagName('head')[0].appendChild(hubLinkCSS);
}

// This block inject the Hubspot Link code into the ArgoNet form.

function addLinkJS() {
	const uriAddressLinkJS = '//www.rutgersprep.org/uploaded/Tech_Office/ArgoNet_Stylesheets/event_registration/new_form/postToHS.js?';
	const timeNow = Date.now();
	const finalAddress = uriAddressLinkJS + timeNow;

	const hubLinkScript = document.createElement('script');
	hubLinkScript.defer = true;
	hubLinkScript.type = 'text/javascript';
	hubLinkScript.src = finalAddress;
	hubLinkScript.id = 'rpsJS';

	document.getElementsByTagName('head')[0].appendChild(hubLinkScript);
}

function addSubmitButton() {
	const newSubmitButton = document.createElement('button');
	newSubmitButton.id = 'rpsSubmitButton';
	newSubmitButton.className = 'btn btn-approve active btn-sm pull-left';

	newSubmitButton.addEventListener('click', () => {
		submitData();
	}); // attach function to submit everything.

	const textnode = document.createTextNode('AcceptRPS');
	newSubmitButton.appendChild(textnode);

	$('#form-formbuttons').prepend(newSubmitButton);
}

if ($('#rpsJS').length < 1) {
	addLinkJS(); // inject the Hubspot Link code JS file.
}

if ($('#rpsCSS').length < 1) {
	addCSS(); // inject the CSS file.
}

function reTrigger() {
	// make sure this block only fires on the "Review" page.
	if ($('#rpsSubmitButton').length < 1 && $('li.tab.active > a[data-id="489469"]').length > 0) {
		$('#form-formbuttons button.btn-approve.submitreview:not(#rpsSubmitButton)').hide();
		addSubmitButton(); // inject new submit button.
	}
}
