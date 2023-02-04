import { classAdd, classDel, listen } from '../infrastructure/util.js';
import { PathSmbl } from './path-smbl.js';
import { clickForAll, singleClassAdd, evtTargetAttr } from './shape-settings.js';

export class PathSettings extends HTMLElement {
	/** @param {PathElement} pathElement */
	constructor(pathElement) {
		super();
		/** @private */
		this._pathElement = pathElement;
	}

	connectedCallback() {
		const pathStyles = this._pathElement[PathSmbl].data.styles;
		const actStyle = style => this._pathElement[PathSmbl].data.styles?.includes(style) ? 'class="actv"' : '';

		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML = `
		<style>
			.ln { display: flex; }
			.ln > * {
				height: 24px;
				padding: 10px;
				fill-opacity: 0.3;
				stroke-opacity: 0.3;
			}
			[data-cmd] { cursor: pointer; }
			.actv { 
				fill-opacity: 1;
				stroke-opacity: 1;
			}
		</style>
		<ap-shape-edit id="edit" edit-btn="true">
			<div class="ln">
				<svg data-cmd data-cmd-arg="arw-s" ${actStyle('arw-s')} viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z" fill="rgb(52,71,103)"/></svg>
				<svg data-cmd data-cmd-arg="arw-e" ${actStyle('arw-e')} viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="rgb(52,71,103)"/></svg>
				<svg data-cmd data-cmd-arg="dash" ${actStyle('dash')} viewBox="0 0 24 24" width="24" height="24"><path d="M 2,11 L 20,11" stroke="rgb(52,71,103)" style="stroke-dasharray: 4,3; stroke-width: 3;"></path></svg>
			</div>
		</ap-shape-edit>`;

		// colors, del
		listen(shadow.getElementById('edit'), 'cmd', /** @param {CustomEvent<{cmd:string, arg:string}>} evt */ evt => {
			switch (evt.detail.cmd) {
				case 'style': singleClassAdd(this._pathElement, this._pathElement[PathSmbl].data, 'cl-', evt.detail.arg); break;
				case 'del': this._pathElement[PathSmbl].del(); break;
			}
		});

		// arrows, dotted
		clickForAll(shadow, '[data-cmd]', evt => {
			const argStyle = evtTargetAttr(evt, 'data-cmd-arg');
			const currentArr = pathStyles.indexOf(argStyle);
			if (currentArr > -1) {
				classDel(this._pathElement, argStyle);
				pathStyles.splice(currentArr, 1);
				classDel(evt.currentTarget, 'actv');
			} else {
				classAdd(this._pathElement, argStyle);
				pathStyles.push(argStyle);
				classAdd(evt.currentTarget, 'actv');
			}
		});
	}
}
customElements.define('ap-path-settings', PathSettings);

/** @typedef { import('./path-smbl').PathElement } PathElement */
