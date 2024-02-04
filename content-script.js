browser.runtime.onMessage.addListener((request, sender) => {
	console.log('registered onMessage', { request, sender });

	// Check the action property in the request object
	if (request.action === 'requestData') {
		/**
		 * @type {Steam.InventoryResponse}
		 */
		const response = request.data;
		console.log({ response });
		const entries = Object.entries(response.rgInventory);
		const decriptions = new Map(Object.entries(response.rgDescriptions));
		const itemToCountMap = new Map();
		console.log({ entries, decriptions });
		let items = [];
		decriptions.forEach((curr, i) => {
			// const [key, item] = curr;
			// const id = `${item.classid}_${item.instanceid}`;
			if (curr.tradable === 0) {
				return;
			}
			if (itemToCountMap.has(curr.market_name)) {
				const n = itemToCountMap.get(curr.market_name);
				itemToCountMap.set(curr.market_name, n + 1);
				return;
			}

			itemToCountMap.set(curr.market_name, 1);
			// if (counterMap.has())
			items.push(curr);

			// item.instanceid;
			// console.log({ acc, curr });
			// return curr;
		}, {});
		console.log({ items, itemToCountMap });
		console.log('Received shared data:', response);
	}
});

function init() {
	console.log('init index.js');
}

init();
