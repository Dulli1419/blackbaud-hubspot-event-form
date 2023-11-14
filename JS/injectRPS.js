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

	document.getElementsByTagName('head')[0].appendChild(hubLinkScript);
}

function addSubmitButton() {
	const newSubmitButton = document.createElement('button');
	newSubmitButton.id = 'rpsSubmitButton';
	newSubmitButton.className = 'btn btn-approve active btn-sm pull-left';

	const textnode = document.createTextNode('AcceptRPS');
	newSubmitButton.appendChild(textnode);

	$('#form-formbuttons').prepend(newSubmitButton);
}

function injectAll() {
	if ($('li.active > a[data-id="489469"]').length === 1) {
		console.log('RPS Code Ready');
		addCSS(); // inject the CSS file.
		addLinkJS(); // inject the Hubspot Link code JS file.
		addSubmitButton(); // inject new submit button.
	}
}

injectAll();
