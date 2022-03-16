/** @implements {IPanel} */
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

			.menu {
				overflow-x: auto;
				white-space: nowrap;
				display: flex;
				padding: 0 5px;
			}
			
			.menu svg {
				height: 42px;
				display: inline-block;
				padding: 15px 10px;
				stroke: #344767;
				stroke-width: 2px;
				fill: #fff;
				width: 42px;
				min-width: 42px;
			}
		
			.menu a {
				display: none;
				line-height: 42px;
				padding: 10px;
				font-size:large;
			}
		
			.menu .big {
				width: 62px;
				min-width: 62px;
			}
		
			.menu svg:nth-of-type(2), .menu a:first-of-type {
				padding-left: 15px;
			}
		
			.menu .itm {
				padding-right: 15px;
				border-right: 1px solid rgb(204 207 210);
				fill: rgba(58, 65, 111, 0.5);
			}

			@media only screen and (max-width: 700px) {
				.menu a {
					display:unset;
				}
			
				.menu svg:last-of-type {
					padding-right: 15px;
					border-right: 1px solid rgb(204 207 210);
					fill: rgba(58, 65, 111, 0.5);
				}
			}
			</style>
			<div id="panel" class="panel">
				<div class="menu">
					<svg class="itm" data-cmd="generateLink" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
						<path
							d="M1536 768v128q76 0 145 17t123 56 84 99 32 148q0 66-25 124t-69 101-102 69-124 26h-512q-66 0-124-25t-101-69-69-102-26-124q0-87 31-147t85-99 122-56 146-18V768h-64q-93 0-174 35t-142 96-96 142-36 175q0 93 35 174t96 142 142 96 175 36h512q93 0 174-35t142-96 96-142 36-175q0-93-35-174t-96-142-142-96-175-36h-64zm-640 512v-128q76 0 145-17t123-56 84-99 32-148q0-66-25-124t-69-101-102-69-124-26H448q-66 0-124 25t-101 69-69 102-26 124q0 87 31 147t85 99 122 56 146 18v128h-64q-93 0-174-35t-142-96-96-142T0 832q0-93 35-174t96-142 142-96 175-36h512q93 0 174 35t142 96 96 142 36 175q0 93-35 174t-96 142-142 96-175 36h-64z">
						</path>
					</svg>
					<svg data-shape="circle">
						<circle r="20" cx="21" cy="21"></circle>
					</svg>
					<svg data-shape="rect" class="big">
						<rect x="1" y="1" width="60" height="40" rx="15" ry="15"></rect>
					</svg>
					<svg data-shape="rhomb" class="big">
						<g transform="translate(1,1)">
							<path d="M0 20 L30 0 L60 20 L30 40 Z" stroke-width="2" stroke-linejoin="round"></path>
						</g>
					</svg>
					<svg data-shape="text">
						<text x="5" y="40" font-size="52px" fill="#344767" stroke-width="0">T</text>
					</svg>
					<a href="https://github.com/AlexeyBoiko/DgrmJS" target="_blank">GitHub</a>
					<a href="https://linkedin.com/in/alexey-boyko-tech" target="_blank">LinkedIn</a>
					<a href="https://alexey-boyko.medium.com/" target="_blank">Blog</a>
					<a href="https://boyko.tech/" target="_blank">boyko.tech</a>
				</div>
			</div>`;

		shadow.querySelectorAll('[data-shape]').forEach(el => el.addEventListener('click',
			/** @param {PointerEvent & { currentTarget: Element }} evt */ evt => this._shapeClick(evt)));
		shadow.querySelectorAll('.itm').forEach(el => el.addEventListener('click',
			/** @param {PointerEvent & { currentTarget: Element }} evt */ evt => this._itmClick(evt)));
	}

	/**
	 * subscribe to event
	 * @param {string} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		this.addEventListener(evtType, listener);
		return this;
	}

	/**
	 * @param {PointerEvent & { currentTarget: Element }} evt
	 * @private
	 */
	_shapeClick(evt) {
		this._dispatchEvent('shapeAddByKey', evt.currentTarget.getAttribute('data-shape'));
	}

	/**
	 * @param {PointerEvent & { currentTarget: Element }} evt
	 * @private
	 */
	_itmClick(evt) {
		this._dispatchEvent(evt.currentTarget.getAttribute('data-cmd'));
	}

	/**
	 * @param {string} type
	 * @private
	 */
	_dispatchEvent(type, detail) {
		this.dispatchEvent(new CustomEvent(type, {
			bubbles: true,
			composed: true,
			detail: detail
		}));
	}
}
customElements.define('ap-panel', Panel);
