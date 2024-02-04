import { arrayBufferToString, concatenateArrayBuffers } from './lib/buffer.js';

browser.webRequest.onBeforeSendHeaders.addListener(
	(details) => {
		console.log('init');
		if (!details.url.includes('/inventory/json/')) {
			return;
		}

		const filter = browser.webRequest.filterResponseData(details.requestId);
		let chunks = [];

		filter.onstart = (event) => {
			console.log('started', { event });
		};

		filter.onerror = (err) => console.error(err);

		filter.ondata = (event) => {
			if (!event.data) return;
			chunks.push(event.data);
			filter.write(event.data);
		};

		filter.onstop = (event) => {
			console.log('stopped', { event });
			filter.close();
			const buffer = concatenateArrayBuffers(chunks);
			const string = arrayBufferToString(buffer);
			try {
				let inventoryResponse = JSON.parse(string);

				browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					const activeTab = tabs[0];
					if (activeTab) {
						browser.tabs.sendMessage(activeTab.id, {
							action: 'requestData',
							data: inventoryResponse,
						});
					}
				});
			} catch (error) {
				console.error(error);
			}
		};
	},
	{
		urls: ['https://steamcommunity.com/*'],
		types: ['xmlhttprequest'],
	},
	['blocking'],
);
