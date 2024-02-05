/**
 *
 * @param {HTMLAnchorElement} element
 */
const isAdded = (element) => element.hasAttribute('data-is-added');

/**
 *
 * @param {HTMLAnchorElement[]} elements
 * @param {string} value
 * @returns {number}
 */
function calculateAmount(elements, value) {
	if (value === '') {
		return elements.length;
	}
	if (elements.length === 0) {
		return 0;
	}
	const num = Number(value);
	if (num > elements.length) {
		return elements.length;
	}
	return num;
}
/**
 *
 * @param {Steam.InventoryResponse} response
 * @returns {Map<string, HTMLAnchorElement[]>}
 */
function generateItemElementMap(response) {
	const { userProfileId, rgInventory, rgDescriptions } = response;
	const inventoryItems = Object.values(rgInventory);
	const descriptions = new Map(Object.entries(rgDescriptions));
	/**
	 * maps how many a tag instances of a given item are in the inventory
	 * @type {Map<string, HTMLLinkElement[]>}
	 */
	const map = new Map();
	inventoryItems.forEach((item) => {
		const id = `${item.classid}_${item.instanceid}`;

		if (!descriptions.has(id)) {
			console.log('no item for id', id);
			return;
		}

		const detailedItem = descriptions.get(id);

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
	e.preventDefault();
	const [select, numberInput] = e.target;
	const button = e.submitter;
	const itemName = select.value;

	console.log(button.value);

	if (!map.has(itemName)) {
		throw new Error('Invalid item selected');
	}
	const mapElements = map.get(itemName);

	/**
	 * @type {HTMLOptionElement[]}
	 */
	const opts = [...select.options];
	const selectedOption = opts.find((option) => option.value === itemName);

	const elements =
		button.value === 'remove'
			? mapElements.filter(isAdded)
			: mapElements.filter((a) => isAdded(a) === false);

	const amount = calculateAmount(elements, numberInput.value);

	e.target.action = '';
	switch (button.value) {
		case 'add': {
			for (let i = 0; i < amount; i++) {
				const element = elements[i];
				if (isAdded(element)) continue;

				element.setAttribute('data-is-added', true);
				const event = new Event('dblclick', { bubbles: true });
				element.dispatchEvent(event);
			}
			break;
		}
		case 'remove': {
			for (let i = 0; i < amount; i++) {
				const element = elements[i];
				if (isAdded(element) === false) continue;

				element.removeAttribute('data-is-added');
				const event = new Event('dblclick', { bubbles: true });
				element.dispatchEvent(event);
			}
			break;
		}
		default:
			throw new Error(`Unhandled button type ${button.type}`);
	}

	// filteredElements.length should be <= amount due to html form validation

	// console.log(element.attributes);

	// after modifying filteredElements, set the key to the new array
	// map.set(itemName, elements);

	if (length !== elements.length) {
		// update form validations and stuff
		numberInput.max = elements.length;

		selectedOption.text = `${itemName} (x${elements.length})`;
	}
	// if (elements.length === 0) {
	// if no filteredElements, remove this element/disable it because all the items are in trade box

	// selectedOption.disabled = 'true';

	// While we're at it, auto-select the next option for better UX
	// const nextOption = opts[opts.indexOf(selectedOption) + 1];
	// if (map.has(nextOption.value)) {
	// 	const nextOptionAmount = map.get(nextOption.value).length;
	// 	numberInput.value = '';
	// 	numberInput.max = nextOptionAmount;
	// }
	// select.value = nextOption.value;
	// }
}
/**
 *
 * @param {Event<HTMLSelectElement>} e
 * @param {Map<string,HTMLAnchorElement[]>} map
 * @param {HTMLInputElement} numberofItemsInput
 */
function onSelectItemsToTrade(e, map, numberofItemsInput) {
	const select = e.target;
	const selected = select.value;

	if (!selected) {
		throw new Error('invalid option selected');
	}
	if (!map.has(selected)) {
		throw new Error('selection out of bounds');
	}
	const max = map.get(selected).length;
	numberofItemsInput.max = max;
	numberofItemsInput.placeholder = `${max} or leave empty for all of them`;
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

		// Generate HTML elements for the user
		// form
		const form = document.createElement('form');
		form.style.position = 'absolute';
		form.style.top = '1%';
		form.style.display = 'flex';
		form.style.gap = '5px';
		form.action = 'add';
		form.name = 'submit-items-to-trade';

		// select
		const select = document.createElement('select');
		select.style.background = 'darkgreen';
		select.style.color = 'white';
		select.name = 'items';
		select.style.minHeight = '45px';

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
		numberofItemsInput.style.minHeight = '45px';
		numberofItemsInput.placeholder = `${map.get(select.value).length} or leave empty for all of them`;
		numberofItemsInput.name = 'item-quantity';
		numberofItemsInput.max = map.get(select.value).length;

		form.appendChild(numberofItemsInput);

		// submit button
		const addButton = document.createElement('button');
		addButton.style.minWidth = '75px';
		addButton.style.minHeight = '45px';
		addButton.type = 'submit';
		addButton.value = 'add';
		addButton.textContent = 'Add items';

		const removeButton = document.createElement('button');
		removeButton.style.minWidth = '75px';
		removeButton.style.minHeight = '45px';
		removeButton.type = 'submit';
		removeButton.value = 'remove';
		removeButton.textContent = 'Remove items';

		form.onsubmit = (e) => onSubmitItemsToTrade(e, map);
		select.onchange = (e) => onSelectItemsToTrade(e, map, numberofItemsInput);
		document.body.appendChild(form);

		form.appendChild(addButton);
		form.appendChild(removeButton);
		console.log('Received shared data');
	}
});

// function init() {
// 	console.log('init index.js');
// }

// init();
