import { copySvg, delSvg } from '../infrastructure/assets.js';
import { clickForAll, evtTargetAttr } from '../infrastructure/util.js';

export class GroupSettings extends HTMLElement {
	/** @param {(cms:string)=>void} cmdHandler */
	constructor(cmdHandler) {
		super();
		/** @private */
		this._cmdHandler = cmdHandler;
	}

	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML = `
		<style>
			.ln { display: flex; }
			.ln > * {
				height: 24px;
				padding: 10px;
			}
			[data-cmd] { cursor: pointer; }
		</style>
		<div class="ln">
			${copySvg}
			${delSvg}
		</div>`;

		clickForAll(shadow, '[data-cmd]',
			evt => this._cmdHandler(evtTargetAttr(evt, 'data-cmd')));
	}
}
customElements.define('ap-grp-settings', GroupSettings);
