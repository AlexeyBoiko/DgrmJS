// elements
import '../menu/menu.js';
import '../file-options/file-options.js';

export class Panel extends HTMLElement {
	connectedCallback() {
		this._shadow = this.attachShadow({ mode: 'closed' });
		this._shadow.innerHTML =
			`<style>
			.panel {
				position: fixed;
				bottom: 0;
				box-shadow: 0px 0px 58px 2px rgba(34, 60, 80, 0.2);
				border-radius: 0 16px 0 0;
				background-color: rgba(255,255,255, .7);
			}
			@media only screen and (max-width: 700px) {
				.panel {
					width: 100%;
					border-radius: 0;
				}
			
				.panel.open {
					border-radius: 16px 16px 0 0;
				}
			}
			.tab {
				border-bottom: 1px solid rgb(204 207 210);
				padding: 0 15px;
				display: none;
			}
			.panel.open .tab {display: block;}

			#shape-settings, #file-options {display: none;}
			</style>
			<div id="panel" class="panel">
				<div class="tab">
				<ap-shape-settings id="shape-settings" class="itm"></ap-shape-settings>
				<ap-file-options id="file-options" class="itm"></ap-file-options>
				</div>
				<ap-menu id="menu"></ap-menu>
			</div>`;

		this._panel = this._shadow.getElementById('panel');
		this._fileOptions = /** @type {IFileOptions} */(this._shadow.getElementById('file-options'));
		this._menu = /** @type {IMenu} */(this._shadow.getElementById('menu'))
			.on('tab', /** @param {CustomEvent<string>} evt */ evt => this._tabClick(evt));
	}

	/**
	 * subscribe to event
	 * @param {string} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		switch (evtType) {
			case 'shapeDragOut':
			case 'shapeMove':
				this._menu.on(evtType, listener);
				break;
			case 'dgrmGenerateLink':
			case 'dgrmSave':
			case 'dgrmOpen':
				this._fileOptions.on(evtType, listener);
				break;
		}
		return this;
	}

	/** @param {CustomEvent<string>} evt */
	_tabClick(evt) {
		this._hideCurrentTab();
		if (this._tab === evt.detail) {
			this._panel.classList.remove('open');
			this._tab = null;
		} else {
			this._shadow.getElementById(evt.detail).style.display = 'block';
			this._panel.classList.add('open');
			this._tab = evt.detail;
		}
	}

	_hideCurrentTab() {
		if (this._tab) {
			this._shadow.getElementById(this._tab).style.display = 'none';
		}
	}
}
customElements.define('ap-panel', Panel);
