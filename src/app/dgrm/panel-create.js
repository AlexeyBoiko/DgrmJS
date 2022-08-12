/**
 * @param {number} x
 * @param {number} y
 * @return {HTMLDivElement}
*/
export function panelCreate(x, y) {
	const panelDiv = document.createElement('div');
	panelDiv.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; padding: 10px; box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);`;
	panelDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>';
	document.body.append(panelDiv);
	return panelDiv;
}
