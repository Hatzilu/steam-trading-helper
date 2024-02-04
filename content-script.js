/**
 *
 * @param {Steam.InventoryResponse} response
 * @returns {Map<string, HTMLAnchorElement[]>}
 */
function generateItemElementMap(response) {
	const { userProfileId, rgInventory, rgDescriptions } = response;
	const inventoryItems = Object.values(rgInventory);
	const decriptions = new Map(Object.entries(rgDescriptions));
	/**
	 * maps how many a tag instances of a given item are in the inventory
	 * @type {Map<string, HTMLLinkElement[]>}
	 */
	const map = new Map();
	inventoryItems.forEach((item) => {
		const id = `${item.classid}_${item.instanceid}`;

		if (!decriptions.has(id)) {
			console.log('no item for id', id);
			return;
		}

		const detailedItem = decriptions.get(id);

		if (detailedItem.tradable === 0) {
			console.log(`untradable item`, detailedItem.market_name);
			return;
		}
		const elem = document.querySelector(
			`a[href^='https://steamcommunity.com/id/${userProfileId}/inventory/#440_2_${item.id}']`,
		);
		if (map.has(detailedItem.market_name)) {
			const elems = map.get(detailedItem.market_name);
			map.set(detailedItem.market_name, [...elems, elem]);
			return;
		}

		map.set(detailedItem.market_name, [elem]);
	});
	return map;
}

browser.runtime.onMessage.addListener((request, sender) => {
	console.log('registered onMessage', { request, sender });

	// Check the action property in the request object
	if (request.action === 'requestData') {
		/**
		 * @type {Steam.InventoryResponse}
		 */
		const response = request.data;

		const map = generateItemElementMap(response);
		console.log(map);
		console.log({ itemToIDsMap });
		console.log('Received shared data:', response);
	}
});

function init() {
	console.log('init index.js');
}

init();
