import { arrayBufferToString, concatenateArrayBuffers } from './lib/buffer.js';

function logURL(details) {
	console.log({ details });
	if (!details.url.includes('/inventory/json/')) return;
	document.body.style.border = '5px solid red';

	let filter = browser.webRequest.filterResponseData(details.requestId);
	console.log({ filter });

	let chunks = [];

	filter.onstart = (event) => {
		console.log('started', { event });
	};

	filter.ondata = (event) => {
		if (!event.data) return;
		chunks.push(event.data);
		filter.write(event.data);
	};

	filter.onstop = (event) => {
		filter.close();
		console.log('stopped', { event });
		const buffer = concatenateArrayBuffers(chunks);
		const string = arrayBufferToString(buffer);
		try {
			let inventoryResponse = JSON.parse(string);
			browser.runtime.sendMessage(undefined, { action: 'getSharedData', message: inventoryResponse });
			browser.webRequest.onBeforeRequest.removeListener(logURL);

			// .then(() => console.log('sent')).catch(console.error);
		} catch (error) {
			console.error('failed to turn inventory response to string', { error, string: buffer, chunks });
		}
	};
}

browser.webRequest.onBeforeSendHeaders.addListener(
	logURL,
	{
		urls: ['https://steamcommunity.com/*'],
		types: ['xmlhttprequest'],
	},
	['blocking'],
);
