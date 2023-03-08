import { copyAndPast } from '../diagram/copy-past-applay.js';
import { copySvg, delSvg } from '../infrastructure/assets.js';
import { clickForAll, listen, classSingleAdd, evtTargetAttr } from '../infrastructure/util.js';
import { modalChangeTop, modalCreate } from './modal-create.js';
import { ShapeSmbl } from './shape-smbl.js';

/**
 * @param {import('../infrastructure/canvas-smbl').CanvasElement} canvas
 * @param {import('./shape-smbl').ShapeElement} shapeElement
 * @param {number} bottomX positon of the bottom left corner of the panel
 * @param {number} bottomY positon of the bottom left corner of the panel
 */
export function settingsPnlCreate(canvas, shapeElement, bottomX, bottomY) {
	const shapeSettings = new ShapeEdit();
	listen(shapeSettings, 'cmd', /** @param {CustomEvent<{cmd:string, arg:string}>} evt */ evt => {
		switch (evt.detail.cmd) {
			case 'style': classSingleAdd(shapeElement, shapeElement[ShapeSmbl].data, 'cl-', evt.detail.arg); break;
			case 'del': shapeElement[ShapeSmbl].del(); break;
			case 'copy': copyAndPast(canvas, [shapeElement]); break;
		}
	});
	return modalCreate(bottomX, bottomY, shapeSettings);
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
			<svg data-toggle="clr" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M19.228 18.732l1.768-1.768 1.767 1.768a2.5 2.5 0 1 1-3.535 0zM8.878 1.08l11.314 11.313a1 1 0 0 1 0 1.415l-8.485 8.485a1 1 0 0 1-1.414 0l-8.485-8.485a1 1 0 0 1 0-1.415l7.778-7.778-2.122-2.121L8.88 1.08zM11 6.03L3.929 13.1 11 20.173l7.071-7.071L11 6.029z" fill="rgb(52,71,103)"/></svg>
			<svg data-toggle="prop"  ${this.getAttribute('edit-btn') ? '' : 'style="display: none;"'} viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12.9 6.858l4.242 4.243L7.242 21H3v-4.243l9.9-9.9zm1.414-1.414l2.121-2.122a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414l-2.122 2.121-4.242-4.242z" fill="rgb(52,71,103)"/></svg>
			${copySvg}
			${delSvg}
		</div>`;

		//
		// tabs

		{
			const pnl = shadow.getElementById('pnl');

			/** @param {1|-1} coef */
			function modalSetTop(coef) {
				modalChangeTop(window.scrollY + coef * pnl.getBoundingClientRect().height); // window.scrollY fix IPhone keyboard
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

/** @param {ElementCSSInlineStyle} el, @param {boolean} isDisp */
function display(el, isDisp) { el.style.display = isDisp ? 'unset' : 'none'; }
