/** @implements {IFileOptions} */
export class FileOptions extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML =
			`<style>
			.options div {
				color: #0d6efd;
				padding: 10px 0;
				border-bottom: 1px solid rgb(231 234 236);
				cursor: pointer;
			}

			.options div:first-child {
				padding-top: 15px;
			}

			.options div:last-child {
				padding-bottom: 15px;
				border-bottom: none;
			}
			</style>
			<div class="options">
				<div data-cmd="dgrmGenerateLink">Copy link to diagram to clipboard</div>
				<div data-cmd="dgrmSave">Save diagram image</div>
				<div data-cmd="dgrmOpen">Open diagram</div>
			</div>`;
		shadow.querySelectorAll('[data-cmd]').forEach(el => el.addEventListener('click', this));
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
		this.dispatchEvent(new CustomEvent(evt.currentTarget.getAttribute('data-cmd'), {
			bubbles: true,
			composed: true
		}));
	}
};
customElements.define('ap-file-options', FileOptions);
