export const pnlSymbol = Symbol(0);

/** @typedef { any & {[pnlSymbol]?: HTMLDivElement} } DelBtnHost */

/**
 * Show panel with del button
 * @param {DelBtnHost} parent
 * @param {number} x
 * @param {number} y
 * @param {Function} onclick
*/
export function pnlDelShow(parent, x, y, onclick) {
	parent[pnlSymbol] = pnlCreate(x, y);
	parent[pnlSymbol].innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>';
	parent[pnlSymbol].onclick = function() {
		pnlDel(parent);
		onclick();
	};
	document.body.append(parent[pnlSymbol]);
}

/**
 * Show panel with color picker
 * @param {DelBtnHost} parent
 * @param {number} x
 * @param {number} y
 * @param {string} defaulColor
 * @param {(cmd:string, arg:string)=>void} onclick
 */
export function pnlColorShow(parent, x, y, defaulColor, onclick) {
	parent[pnlSymbol] = pnlCreate(x, y);
	parent[pnlSymbol].innerHTML =
		`<style>
			.ln { display: flex;}
			[data-cmd] {
				height: 24px;
			}
			.crcl {
				width: 24px;
				border-radius: 50%;
				margin-right: 5px;
			}
		</style>
		<div class="ln">
			<div data-cmd="color" data-cmd-arg="" class="crcl" style="background: ${defaulColor};"></div>
			<div data-cmd="color" data-cmd-arg="#e74c3c" class="crcl" style="background: #e74c3c"></div>
			<div data-cmd="color" data-cmd-arg="#FFBA00" class="crcl" style="background: #FFBA00;"></div>
			<div data-cmd="color" data-cmd-arg="#19bc9b" class="crcl" style="background: #19bc9b; margin-right:0;"></div>
			<div data-cmd="del" style="margin-left: 10px;">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="pointer-events: none;"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>
			</div>
		</div>`;
	parent[pnlSymbol].onclick = /** @param {PointerEvent & { target: Element }} evt */ function(evt) {
		const cmd = evt.target.getAttribute('data-cmd');
		if (cmd === 'del') { pnlDel(parent); }
		onclick(cmd, evt.target.getAttribute('data-cmd-arg'));
	};
	document.body.append(parent[pnlSymbol]);
}

/**
 * @param {DelBtnHost} parent
 * @param {number} x
 * @param {number} y
 */
export function pnlMove(parent, x, y) {
	parent[pnlSymbol].style.top = `${window.scrollY + y}px`; // window.scrollY fix IPhone keyboard
	parent[pnlSymbol].style.left = `${x}px`;
}

/** @param {DelBtnHost} parent */
export function pnlDel(parent) {
	if (parent[pnlSymbol]) {
		parent[pnlSymbol].remove();
		parent[pnlSymbol] = null;
	}
}

/**
 * @param {number} x
 * @param {number} y
 * @return {HTMLDivElement}
 */
function pnlCreate(x, y) {
	const div = document.createElement('div');
	div.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; padding: 10px; box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);`;
	return div;
}

/* <div data-cmd="color" data-cmd-arg="#ff6600" class="crcl" style="background: #ff6600;"></div>
	<div data-cmd="color" data-cmd-arg="#1aaee5" class="crcl" style="background: #1aaee5;"></div>
	<div data-cmd="color" data-cmd-arg="#1d809f" class="crcl" style="background: #1d809f"></div> */
//
