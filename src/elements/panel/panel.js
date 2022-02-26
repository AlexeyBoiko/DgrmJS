import '../menu/menu.js';
import '../shape-settings/shape-settings.js';

export class Panel extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML =
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
			ap-shape-settings {display: none;}
			.panel.open ap-shape-settings { display: block; }
			</style>
			<div id="panel" class="panel">
				<ap-shape-settings id="shape-settings"></ap-shape-settings>
				<ap-menu id="menu"></ap-menu>
			</div>`;

		this.panel = shadow.getElementById('panel');
		this.shapeSettings = /** @type {IShapeSettings} */(shadow.getElementById('shape-settings'));
		this.menu = /** @type {IMenu} */(shadow.getElementById('menu'))
			.on('settingsToggle', _ => this._settingsToggle());
	}

	/**
	 * subscribe to event
	 * @param {string} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		switch (evtType) {
			case 'shapeAddByKey':
			case 'generateLink':
				this.menu.on(evtType, listener);
				break;
			case 'shapeDel':
			case 'shapeType':
				this.shapeSettings.on(evtType, listener);
				break;
		}
		return this;
	}

	/**
	 * @param {ShapeSettingsUpdateParams} params
	 */
	shapeSettingsUpdate(params) {
		this.shapeSettings.update(params);
	}

	_settingsToggle() {
		if (this.panel.classList.contains('open')) {
			this.panel.classList.remove('open');
		} else {
			this.panel.classList.add('open');
		}
	}
}
customElements.define('ap-panel', Panel);
