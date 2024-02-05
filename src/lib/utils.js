/**
 *
 * @param {HTMLAnchorElement} element
 */
export const isAdded = (element) => element.hasAttribute('data-is-added');

/**
 *
 * @param {HTMLAnchorElement[]} elements
 * @param {(a: HTMLAnchorElement) => void} callback - this runs before the element is clicked
 * @param {(a: HTMLAnchorElement) => boolean} ignoreFn - determines if should skip element in loop
 * @param {number} delay - delay in ms
 * @param {number} max - max iterations
 */
export function clickElementsWithDelay(elements, callback, ignoreFn, delay, max) {
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
export function calculateAmount(elements, value) {
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
export function generateItemElementMap(response) {
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
