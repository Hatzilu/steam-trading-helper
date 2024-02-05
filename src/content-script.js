/**
 *
 * @param {HTMLAnchorElement} element
 */
const isAdded = (element) => element.hasAttribute('data-is-added');

/**
 *
 * @param {HTMLAnchorElement[]} elements
 * @param {(a: HTMLAnchorElement) => void} callback - this runs before the element is clicked
 * @param {(a: HTMLAnchorElement) => boolean} ignoreFn - determines if should skip element in loop
 * @param {number} delay - delay in ms
 * @param {number} max - max iterations
 */
function clickElementsWithDelay(elements, callback, ignoreFn, delay, max) {
	for (let i = 0; i < max; i++) {
		const element = elements[i];
		if (ignoreFn(element)) continue;

		callback(element);
		const event = new Event('dblclick', { bubbles: true });
		setTimeout(() => element.dispatchEvent(event), i * delay);
	}
}
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
	const action = e.submitter?.value;
	if (!action) {
		throw new Error('Invalid form action');
	}
	const delay = Number(e.target.elements['click-delay'].value);

	console.log({ delay });
	// Exit early if clearing, since we don't need any other variables for this action.
	if (action === 'clear') {
		const elementsToClear = document.querySelectorAll("a[data-is-added='true']");

		clickElementsWithDelay(
			elementsToClear,
			(element) => element.removeAttribute('data-is-added'),
			() => {},
			delay,
			elementsToClear.length,
		);

		console.log('Cleared', elementsToClear.length, 'items');
		return;
	}
	const [select, numberInput] = e.target;
	const itemName = select.value;

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
		action === 'remove' ? mapElements.filter(isAdded) : mapElements.filter((a) => isAdded(a) === false);

	const amount = calculateAmount(elements, numberInput.value);
	const date = new Date(Date.now()).toLocaleTimeString(navigator.language, {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

	console.log(`[${date}] ${action} %c${itemName} %cx${amount}`, 'color: wheat', 'color: white');

	e.target.action = '';
	switch (action) {
		case 'add': {
			clickElementsWithDelay(
				elements,
				(e) => e.setAttribute('data-is-added', true),
				isAdded,
				delay,
				amount,
			);

			break;
		}
		case 'remove': {
			clickElementsWithDelay(
				elements,
				(e) => e.removeAttribute('data-is-added'),
				(e) => isAdded(e) === false,
				delay,
				amount,
			);
			break;
		}
		default:
			throw new Error(`Unhandled action ${action}`);
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
		select.style.minHeight = '35px';

		const itemNames = [...map.keys()];
		// options
		itemNames
			.sort((a, b) => {
				const arrayA = map.get(a);
				const arrayB = map.get(b);
				return arrayB.length - arrayA.length;
			})
			.forEach((itemName) => {
				const opt = document.createElement('option');
				opt.text = `${itemName} (x${map.get(itemName).length})`;
				opt.value = itemName;
				select.appendChild(opt);
			});
		form.appendChild(select);

		// number of items input
		const numberofItemsInput = document.createElement('input');
		numberofItemsInput.type = 'number';
		numberofItemsInput.style.minHeight = '35px';
		numberofItemsInput.placeholder = `${map.get(select.value).length} or leave empty for all of them`;
		numberofItemsInput.name = 'item-quantity';
		numberofItemsInput.max = map.get(select.value).length;
		form.appendChild(numberofItemsInput);

		// click delay input
		const delayInput = document.createElement('input');
		delayInput.type = 'number';
		delayInput.style.minHeight = '35px';
		delayInput.style.minWidth = '45px';
		delayInput.style.maxWidth = '65px';
		delayInput.placeholder = '100';
		delayInput.defaultValue = 100;
		delayInput.name = 'click-delay';
		delayInput.min = 80;
		delayInput.max = 2000;

		form.appendChild(delayInput);

		// submit button
		const addButton = document.createElement('button');
		addButton.style.minWidth = '75px';
		addButton.style.minHeight = '35px';
		addButton.type = 'submit';
		addButton.value = 'add';
		addButton.textContent = 'Add items';

		const removeButton = document.createElement('button');
		removeButton.style.minWidth = '75px';
		removeButton.style.minHeight = '35px';
		removeButton.type = 'submit';
		removeButton.value = 'remove';
		removeButton.textContent = 'Remove items';

		const clearButton = document.createElement('button');
		clearButton.style.minWidth = '75px';
		clearButton.style.minHeight = '35px';
		clearButton.type = 'submit';
		clearButton.value = 'clear';
		clearButton.textContent = 'Clear all items';

		form.onsubmit = (e) => onSubmitItemsToTrade(e, map);
		select.onchange = (e) => onSelectItemsToTrade(e, map, numberofItemsInput);
		document.body.appendChild(form);

		form.appendChild(addButton);
		form.appendChild(removeButton);
		form.appendChild(clearButton);
		console.log('Received shared data');
	}
});
