
/**
 * @implements {IShapeSettings}
 */
export class ShapeSettings extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML = `<style>
			textarea {
				box-sizing: border-box;
				width: 100%;
				padding: .5rem .75rem;
				border: 1px solid #d2d6da;
				border-radius: .5rem;
				font-size: 16px;
				font-weight: 400;
			}
			
			textarea:focus, textarea:focus-within, textarea:focus-visible {
				outline: 2px solid rgb(225, 151, 211);
			}
			
			button {
				margin: 0;
				padding: 0;
				border: none;
				background: none;
			}

			.settings {
				height: 150px;
				border-bottom: 1px solid rgb(204 207 210);
			}

			.form {
				padding: 15px;
			}
			.form footer {
				text-align: right;
				padding-top: 15px;
			}
			.form header {
				text-align: right;
				padding-bottom: 15px;
			}

			.notset { 
				padding: 23px 15px;
				text-align: center;
			}

			.form { display: none;} 
			.selected .form { display: block;}
			.selected .notset { display: none;}
			</style>
			<div class="settings" id="settings">
				<div class="notset">
					Select shape
				</div>
				<div class="form">
					<header>
						<button>
							<svg height="26px" viewBox="0 0 482.428 482.429"
								style="enable-background:new 0 0 612 612; fill:#344767">
								<path d="M381.163,57.799h-75.094C302.323,25.316,274.686,0,241.214,0c-33.471,0-61.104,25.315-64.85,57.799h-75.098
									c-30.39,0-55.111,24.728-55.111,55.117v2.828c0,23.223,14.46,43.1,34.83,51.199v260.369c0,30.39,24.724,55.117,55.112,55.117
									h210.236c30.389,0,55.111-24.729,55.111-55.117V166.944c20.369-8.1,34.83-27.977,34.83-51.199v-2.828
									C436.274,82.527,411.551,57.799,381.163,57.799z M241.214,26.139c19.037,0,34.927,13.645,38.443,31.66h-76.879
									C206.293,39.783,222.184,26.139,241.214,26.139z M375.305,427.312c0,15.978-13,28.979-28.973,28.979H136.096
									c-15.973,0-28.973-13.002-28.973-28.979V170.861h268.182V427.312z M410.135,115.744c0,15.978-13,28.979-28.973,28.979H101.266
									c-15.973,0-28.973-13.001-28.973-28.979v-2.828c0-15.978,13-28.979,28.973-28.979h279.897c15.973,0,28.973,13.001,28.973,28.979
									V115.744z"></path>
								<path d="M171.144,422.863c7.218,0,13.069-5.853,13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07
									c-7.217,0-13.069,5.854-13.069,13.07v147.154C158.074,417.012,163.926,422.863,171.144,422.863z"></path>
								<path d="M241.214,422.863c7.218,0,13.07-5.853,13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07
									c-7.217,0-13.069,5.854-13.069,13.07v147.154C228.145,417.012,233.996,422.863,241.214,422.863z"></path>
								<path d="M311.284,422.863c7.217,0,13.068-5.853,13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07
									c-7.219,0-13.07,5.854-13.07,13.07v147.154C298.213,417.012,304.067,422.863,311.284,422.863z"></path>
							</svg>
						</button>
					</header>
					<textarea rows="3"/></textarea>
				</div>
			</div>`;

		shadow.querySelector('button').addEventListener('click', _ => this._dispatchEvent('del'));

		this.textField = /** @type {HTMLTextAreaElement} */(shadow.querySelector('textarea'));
		this.textField.addEventListener('input', _ => this._dispatchEvent('type', this.textField.value));
		this.textField.addEventListener('change', _ => this._dispatchEvent('type', this.textField.value));

		this.settingsDiv = shadow.getElementById('settings');
	}

	/**
	 * subscribe to event
	 * @param {ShapeSettingsEventType} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		this.addEventListener(evtType, listener);
		return this;
	}

	/**
	 * @param {ShapeSettingsUpdateParams} params
	 */
	update(params) {
		if (params.text !== undefined) {
			this.textField.value = params.text;
		}

		if (params.disabled !== undefined) {
			this.textField.disabled = params.disabled;
		}

		if (params.selected !== undefined) {
			if (params.selected) {
				this.settingsDiv.classList.add('selected');
			} else {
				this.settingsDiv.classList.remove('selected');
			}
		}
	}

	/**
	 * @param {string} type
	 * @param {any} detail
	 */
	_dispatchEvent(type, detail) {
		this.dispatchEvent(new CustomEvent(type, {
			bubbles: true,
			composed: true,
			detail: detail
		}));
	}
};
customElements.define('ap-shape-settings', ShapeSettings);
