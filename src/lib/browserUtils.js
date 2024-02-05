/**
 *
 * @param {Element} elem
 */
export function doubleClick(elem) {
	elem.dispatchEvent(new Event('dblclick', { bubbles: true }));
}
