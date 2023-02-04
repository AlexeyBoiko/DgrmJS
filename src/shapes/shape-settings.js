import { classAdd, classDel, listen } from '../infrastructure/util.js';
import { ShapeSmbl } from './shape-smbl.js';

/**
 * @param {number} bottomX positon of the bottom left corner of the panel
 * @param {number} bottomY positon of the bottom left corner of the panel
 * @param { {(evt: PointerEvent):void} } onDel
 */
export function delPnlCreate(bottomX, bottomY, onDel) {
	const div = document.createElement('div');
	div.style.cssText = 'height: 24px; padding:10px;';
	div.onclick = onDel;
	div.innerHTML = delSvg;
	return pnlCreate(bottomX, bottomY, div);
}

/**
 * @param {number} bottomX positon of the bottom left corner of the panel
 * @param {number} bottomY positon of the bottom left corner of the panel
 * @param {import('./shape-smbl').ShapeElement} shapeElement
 */
export function settingsPnlCreate(bottomX, bottomY, shapeElement) {
	const shapeSettings = new ShapeEdit();
	listen(shapeSettings, 'cmd', /** @param {CustomEvent<{cmd:string, arg:string}>} evt */ evt => {
		switch (evt.detail.cmd) {
			case 'style': singleClassAdd(shapeElement, shapeElement[ShapeSmbl].data, 'cl-', evt.detail.arg); break;
			case 'del': shapeElement[ShapeSmbl].del(); break;
		}
	});
	return pnlCreate(bottomX, bottomY, shapeSettings);
}

/** @type {HTMLDivElement} */
let editModalDiv;
/** @param {number} bottomX, @param {number} bottomY, @param {HTMLElement} elem */
export function pnlCreate(bottomX, bottomY, elem) {
	editModalDiv = document.createElement('div');
	editModalDiv.style.cssText = 'position: fixed; box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);';
	editModalDiv.append(elem);
	document.body.append(editModalDiv);

	function position(btmX, btmY) {
		editModalDiv.style.left = `${btmX}px`;
		editModalDiv.style.top = `${window.scrollY + btmY - editModalDiv.getBoundingClientRect().height}px`; // window.scrollY fix IPhone keyboard
	}
	position(bottomX, bottomY);

	return {
		/**
		 * @param {number} bottomX positon of the bottom left corner of the panel
		 * @param {number} bottomY positon of the bottom left corner of the panel
		 */
		position,
		del: () => { editModalDiv.remove(); editModalDiv = null; }
	};
}

class ShapeEdit extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML =
		`<style>
			.ln { display: flex; }
			.ln > * {
				height: 24px;
				padding: 10px;
				cursor: pointer;
			}
			#prop { padding-bottom: 10px; }

			.crcl { width: 25px; height: 25px; border-radius: 50%; }
		</style>
		<div id="pnl">
			<div id="clr" style="display: none;">
				<div class="ln">
					<div data-cmd="style" data-cmd-arg="cl-red">
						<div class="crcl" style="background: #E74C3C"></div>
					</div>
					<div data-cmd="style" data-cmd-arg="cl-orange">
						<div class="crcl" style="background: #ff6600"></div>
					</div>
					<div data-cmd="style" data-cmd-arg="cl-green">
						<div class="crcl" style="background: #19bc9b"></div>
					</div>
				</div>
				<div class="ln">
					<div data-cmd="style" data-cmd-arg="cl-blue">
						<div class="crcl" style="background: #1aaee5"></div>
					</div>
					<div data-cmd="style" data-cmd-arg="cl-dblue">
						<div class="crcl" style="background: #1D809F"></div>
					</div>
					<div data-cmd="style" data-cmd-arg="cl-dgray">
						<div class="crcl" style="background: #495057"></div>
					</div>
				</div>
			</div>
			<div id="prop" style="display: none;"><slot id="slot"></slot></div>
		</div>
		<div class="ln">
			<svg data-toggle="clr" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19.228 18.732l1.768-1.768 1.767 1.768a2.5 2.5 0 1 1-3.535 0zM8.878 1.08l11.314 11.313a1 1 0 0 1 0 1.415l-8.485 8.485a1 1 0 0 1-1.414 0l-8.485-8.485a1 1 0 0 1 0-1.415l7.778-7.778-2.122-2.121L8.88 1.08zM11 6.03L3.929 13.1 11 20.173l7.071-7.071L11 6.029z" fill="rgb(50,70,103)"/></svg>
			<svg data-toggle="prop"  ${this.getAttribute('edit-btn') ? '' : 'style="display: none;"'} viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12.9 6.858l4.242 4.243L7.242 21H3v-4.243l9.9-9.9zm1.414-1.414l2.121-2.122a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414l-2.122 2.121-4.242-4.242z" fill="rgb(52,71,103)"/></svg>
			${delSvg}
		</div>`;

		//
		// tabs

		{
			const pnl = shadow.getElementById('pnl');

			/** @param {1|-1} coef */
			function modalSetTop(coef) {
				editModalDiv.style.top = `${editModalDiv.getBoundingClientRect().top + window.scrollY + coef * pnl.getBoundingClientRect().height}px`; // window.scrollY fix IPhone keyboard
			}

			/** @type {HTMLElement} */
			let currentTab;

			clickForAll(shadow, '[data-toggle]', evt => {
				if (currentTab) {
					modalSetTop(1);
					display(currentTab, false);
				}

				const tab = shadow.getElementById(evtTargetAttr(evt, 'data-toggle'));
				if (currentTab !== tab) {
					display(tab, true);
					modalSetTop(-1);
					currentTab = tab;
				} else {
					currentTab = null;
				}
			});
		}

		//
		// commands

		clickForAll(shadow, '[data-cmd]', evt => {
			this.dispatchEvent(new CustomEvent('cmd', {
				detail: {
					cmd: evtTargetAttr(evt, 'data-cmd'),
					arg: evtTargetAttr(evt, 'data-cmd-arg')
				}
			}));
		});
	}
}
customElements.define('ap-shape-edit', ShapeEdit);

const delSvg = '<svg data-cmd="del" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>';

/** @param {ElementCSSInlineStyle} el, @param {boolean} isDisp */
function display(el, isDisp) { el.style.display = isDisp ? 'unset' : 'none'; }

/** @param {PointerEvent & { currentTarget: Element }} evt, @param {string} attr */
export const evtTargetAttr = (evt, attr) => evt.currentTarget.getAttribute(attr);

/** @param {ParentNode} el, @param {string} selector, @param {(this: GlobalEventHandlers, ev: PointerEvent & { currentTarget: Element }) => any} handler */
export function clickForAll(el, selector, handler) { el.querySelectorAll(selector).forEach(/** @param {HTMLElement} el */ el => { el.onclick = handler; }); }

/** @param {Element} shapeEl, @param {{styles?:string[]}} shapeData, @param {string} classPrefix, @param {string} classToAdd */
export function singleClassAdd(shapeEl, shapeData, classPrefix, classToAdd) {
	if (!shapeData.styles) { shapeData.styles = []; }

	const currentColor = shapeData.styles.findIndex(ss => ss.startsWith(classPrefix));
	if (currentColor > -1) {
		classDel(shapeEl, shapeData.styles[currentColor]);
		shapeData.styles.splice(currentColor, 1);
	}
	shapeData.styles.push(classToAdd);
	classAdd(shapeEl, classToAdd);
}
