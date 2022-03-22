/** @implements {IFileOptions} */
export class FileOptions extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML = `
			<style>
			svg {
				position: fixed;
				top: 15px;
				left: 15px;
				cursor: pointer;
			}
			.options {
				position: fixed;
				padding: 15px;
				box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%);
				border-radius: 16px;
				background-color: rgba(255,255,255, .9);

				top: 0px;
				left: 0px;
			}

			.options [data-cmd] { color: rgb(13, 110, 253); cursor: pointer; margin: 10px 0;}
			</style>
			 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg>
			 <div class="options" style="visibility: hidden;">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg>
				<div data-cmd="dgrmOpen" style="padding-top:30px;">Open diagram</div>
				<div data-cmd="dgrmSave">Save diagram image</div>
				<div data-cmd="dgrmGenerateLink">Copy link to diagram</div>
		 	</div>`;
		shadow.querySelectorAll('svg').forEach(el => el.addEventListener('click', this));
		shadow.querySelectorAll('[data-cmd]').forEach(el => el.addEventListener('click', this));

		/**
		 * @type {HTMLDivElement}
		 * @private
		 */
		this._options = shadow.querySelector('.options');
	}

	/**
	 * subscribe to event
	 * @param {FileOptionsEventType} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		this.addEventListener(evtType, listener);
		return this;
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	handleEvent(evt) {
		if (evt.currentTarget.tagName === 'svg') {
			this._options.style.visibility = this._options.style.visibility === 'visible'
				? 'hidden'
				: 'visible';
			return;
		}
		this.dispatchEvent(new CustomEvent(evt.currentTarget.getAttribute('data-cmd'), {
			bubbles: true,
			composed: true
		}));
	}
};
customElements.define('ap-file-options', FileOptions);
