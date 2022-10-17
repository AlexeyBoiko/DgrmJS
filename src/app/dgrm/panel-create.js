export const pnlSymbol = Symbol(0);

/** @typedef { any & {[pnlSymbol]?: HTMLDivElement} } panelHost */

/**
 * Show panel with del button
 * @param {panelHost} parent
 * @param {number} x
 * @param {number} y
 * @param {Function} onclick
*/
export function pnlDelShow(parent, x, y, onclick) {
	pnlCreate(parent, x, y, null, 10);
	parent[pnlSymbol].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>';
	parent[pnlSymbol].onclick = function() {
		pnlDel(parent);
		onclick();
	};
}

/**
 * @param {panelHost} parent
 * @param {number} bottomX positon of the bottom left corner of the panel
 * @param {number} bottomY positon of the bottom left corner of the panel
 */
export function pnlMove(parent, bottomX, bottomY) {
	parent[pnlSymbol].style.left = `${bottomX}px`;
	parent[pnlSymbol].style.top = `${window.scrollY + bottomY - parent[pnlSymbol].getBoundingClientRect().height}px`; // window.scrollY fix IPhone keyboard
}

/** @param {panelHost} parent */
export function pnlDel(parent) {
	if (parent[pnlSymbol]) {
		parent[pnlSymbol].remove();
		parent[pnlSymbol] = null;
	}
}

/**
 * @param {panelHost} parent
 * @param {number} x
 * @param {number} y
 * @param {HTMLElement} htmlElem
 * @param {number} padding
 * @return {HTMLDivElement}
 */
export function pnlCreate(parent, x, y, htmlElem = null, padding = 0) {
	const div = document.createElement('div');
	div.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; padding: ${padding}px; box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);`;

	if (htmlElem) {
		div.append(htmlElem);
	}

	parent[pnlSymbol] = div;
	document.body.append(parent[pnlSymbol]);
	return div;
}
