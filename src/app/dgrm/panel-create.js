export const delBtnSymbol = Symbol(0);

/** @typedef { any & {[delBtnSymbol]?: HTMLDivElement} } DelBtnHost */

/**
 * @param {DelBtnHost} parent
 * @param {number} x
 * @param {number} y
 * @param {Function} onclick
*/
export function delBtnShow(parent, x, y, onclick) {
	parent[delBtnSymbol] = document.createElement('div');
	parent[delBtnSymbol].style.cssText = `position: fixed; left: ${x}px; top: ${y}px; padding: 10px; box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);`;
	parent[delBtnSymbol].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>';
	parent[delBtnSymbol].onclick = function() {
		delBtnDel(parent);
		onclick();
	};
	document.body.append(parent[delBtnSymbol]);
}

/**
 * @param {DelBtnHost} parent
 * @param {number} x
 * @param {number} y
 */
export function delBtnMove(parent, x, y) {
	parent[delBtnSymbol].style.top = `${window.scrollY + y}px`; // window.scrollY fix IPhone keyboard
	parent[delBtnSymbol].style.left = `${x}px`;
}

/** @param {DelBtnHost} parent */
export function delBtnDel(parent) {
	if (parent[delBtnSymbol]) {
		parent[delBtnSymbol].remove();
		parent[delBtnSymbol] = null;
	}
}
