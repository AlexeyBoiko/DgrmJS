/**
 * @param {number} bottomX positon of the bottom left corner of the panel
 * @param {number} bottomY positon of the bottom left corner of the panel
 * @param { {(evt: CustomEvent<{cmd:string, arg:string}>):void} } onCmd
 */
export function settingsPnlCreate(bottomX, bottomY, onCmd) {
	const shapeSettings = new ShapeSettings();
	shapeSettings.addEventListener('cmd', onCmd);

	const div = document.createElement('div');
	div.style.cssText = 'position: fixed; box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);';
	div.append(shapeSettings);
	document.body.append(div);

	function position(btmX, btmY) {
		div.style.left = `${btmX}px`;
		div.style.top = `${window.scrollY + btmY - div.getBoundingClientRect().height}px`; // window.scrollY fix IPhone keyboard
	}
	position(bottomX, bottomY);

	// dispose function
	return {
		/**
		 * @param {number} bottomX positon of the bottom left corner of the panel
		 * @param {number} bottomY positon of the bottom left corner of the panel
		 */
		position,
		dispose: () => div.remove()
	};
}

class ShapeSettings extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML =
		`<style>
			.ln { display: flex;}
			.ln > div {
				height: 24px;
				padding: 10px;
			}
			[data-cmd] { cursor: pointer; }

			.crcl {
				width: 25px;
				height: 25px;
				border-radius: 50%;
			}

			.props {
				padding-bottom: 10px;
			}
		</style>
		<div class="props" style="display: none;">
			<div class="ln">
				<div data-cmd="style" data-cmd-arg="cl-red">
					<div class="crcl" style="background: #E74C3C">&nbsp;</div>
				</div>
				<div data-cmd="style" data-cmd-arg="cl-orange">
					<div class="crcl" style="background: #ff6600">&nbsp;</div>
				</div>
				<div data-cmd="style" data-cmd-arg="cl-green">
					<div class="crcl" style="background: #19bc9b">&nbsp;</div>
				</div>
			</div>
			<div class="ln">
				<div data-cmd="style" data-cmd-arg="cl-blue">
					<div class="crcl" style="background: #1aaee5">&nbsp;</div>
				</div>
				<div data-cmd="style" data-cmd-arg="cl-dblue">
					<div class="crcl" style="background: #1D809F">&nbsp;</div>
				</div>
				<div data-cmd="style" data-cmd-arg="cl-dgray">
					<div class="crcl" style="background: #495057">&nbsp;</div>
				</div>
			</div>
		</div>
		<div class="ln">
			<div data-cmd="toggle">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12.9 6.858l4.242 4.243L7.242 21H3v-4.243l9.9-9.9zm1.414-1.414l2.121-2.122a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414l-2.122 2.121-4.242-4.242z" fill="rgba(52,71,103,1)"/></svg>
			</div>
			<div data-cmd="del">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>
			</div>
		</div>`;

		shadow.querySelectorAll('[data-cmd]').forEach(el => el.addEventListener('click', this));

		/** @private */
		this._parent = shadow.host.parentElement;

		/**
		 * @type {HTMLDivElement}
		 * @private
		 */
		this._props = shadow.querySelector('.props');
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	handleEvent(evt) {
		const cmd = evt.currentTarget.getAttribute('data-cmd');

		if (cmd === 'toggle') {
			this._toggle();
			return;
		}

		this.dispatchEvent(new CustomEvent('cmd', {
			detail: { cmd, arg: evt.currentTarget.getAttribute('data-cmd-arg') }
		}));
	}

	/** @private */
	_toggle() {
		if (this._props.style.display === 'none') {
			this._props.style.display = 'unset';
			this._parent.style.top = `${this._parent.getBoundingClientRect().top + window.scrollY - 88}px`; // window.scrollY fix IPhone keyboard
		} else {
			this._props.style.display = 'none';
			this._parent.style.top = `${this._parent.getBoundingClientRect().top + window.scrollY + 88}px`; // window.scrollY fix IPhone keyboard
		}
	}
}
customElements.define('ap-shape-settings', ShapeSettings);
