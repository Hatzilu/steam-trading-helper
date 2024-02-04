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

/**
 *
 * @param {SubmitEvent<HTMLFormElement>} e
 * @param {Map<string,HTMLAnchorElement[]>} map
 */
function onSubmitItemsToTrade(e, map) {
	const [select, input, button] = e.target;
	e.preventDefault();
	console.log({ e });
}
/**
 *
 * @param {MouseEvent<HTMLButtonElement>} e
 * @param {HTMLSelectElement} select
 * @param {Map<string,HTMLAnchorElement[]>} map
 */
function onSelectItemsToTrade(e, select, map) {
	const selected = select.value;
	if (!selected) {
		throw new Error('invalid option selected');
	}
	if (!map.has(selected)) {
		throw new Error('selection out of bounds');
	}
	const elements = map.get(selected);
	elements.forEach((element) => {
		element.dispatchEvent(new Event('dblclick', { bubbles: true }));
	});
	select.options.remove(select.options.selectedIndex);
	console.log({ e, select, map, opt: select.options });
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

		// Generate HTML elements for the user
		// form
		const form = document.createElement('form');
		form.style.position = 'absolute';
		form.style.top = '1%';
		form.style.display = 'flex';
		form.style.gap = '5px';
		form.name = 'submit-items-to-trade';

		// select
		const select = document.createElement('select');
		select.id = 'item-names-select';
		select.style.background = 'darkgreen';
		select.style.color = 'white';
		select.name = 'items';

		const itemNames = [...map.keys()];
		// options
		itemNames.forEach((itemName) => {
			const opt = document.createElement('option');
			opt.text = `${itemName} (x${map.get(itemName).length})`;
			opt.value = itemName;
			select.appendChild(opt);
		});
		form.appendChild(select);

		// number of items input
		const numberofItemsInput = document.createElement('input');
		numberofItemsInput.type = 'number';
		numberofItemsInput.placeholder = itemNames.length;
		numberofItemsInput.name = 'item-quantity';

		form.appendChild(numberofItemsInput);

		// submit button
		const button = document.createElement('button');
		button.style.minWidth = '75px';
		button.style.minHeight = '45px';
		button.type = 'submit';
		button.textContent = 'Add items';

		form.onsubmit = (e) => onSubmitItemsToTrade(e);
		document.body.appendChild(form);

		form.appendChild(button);
		console.log('Received shared data:', response);
	}
});

function init() {
	console.log('init index.js');
}

init();
