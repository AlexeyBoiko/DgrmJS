/** @implements {Menu} */
export class Menu extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML =
			`<style>
			.menu {
				overflow-x: auto;
				white-space: nowrap;
				display: flex;
				padding: 0;
			}
			
			[data-cmd] {
				cursor: pointer;
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
				color: #0d6efd;
			}
		
			.menu .big {
				width: 62px;
				min-width: 62px;
			}
		
			.menu .itm {
				border-right: 1px solid rgb(204 207 210);
				fill: #344767;
			}

			@media only screen and (max-width: 700px) {
				.menu a {
					display:unset;
				}
			
				.menu svg:last-of-type {
					border-right: 1px solid rgb(204 207 210);
					fill: #344767;
				}
			}
			</style>
			<div id="menu" class="menu" style="touch-action: none;">
			<svg class="itm" data-cmd="tab" data-cmd-arg="file-options" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
				viewBox="0 0 511 511" style="enable-background:new 0 0 511 511;" xml:space="preserve">
				<path d="M454.962,110.751c-0.018-0.185-0.05-0.365-0.081-0.545c-0.011-0.06-0.016-0.122-0.028-0.182
					c-0.043-0.215-0.098-0.425-0.159-0.632c-0.007-0.025-0.012-0.052-0.02-0.077c-0.065-0.213-0.141-0.421-0.224-0.625
					c-0.008-0.021-0.015-0.043-0.023-0.064c-0.081-0.195-0.173-0.384-0.269-0.57c-0.016-0.031-0.029-0.063-0.045-0.094
					c-0.093-0.173-0.196-0.339-0.301-0.504c-0.027-0.042-0.05-0.086-0.077-0.127c-0.103-0.154-0.216-0.3-0.33-0.446
					c-0.037-0.048-0.07-0.098-0.109-0.145c-0.142-0.173-0.294-0.338-0.45-0.498c-0.015-0.015-0.027-0.031-0.042-0.046l-104-104
					c-0.018-0.018-0.038-0.033-0.057-0.051c-0.156-0.153-0.317-0.301-0.486-0.44c-0.055-0.045-0.113-0.083-0.169-0.126
					c-0.138-0.107-0.275-0.214-0.42-0.311c-0.051-0.034-0.105-0.062-0.156-0.095c-0.156-0.099-0.312-0.197-0.475-0.284
					c-0.036-0.019-0.074-0.035-0.111-0.053c-0.181-0.093-0.365-0.183-0.554-0.262c-0.024-0.01-0.049-0.017-0.074-0.027
					c-0.202-0.081-0.406-0.157-0.616-0.221c-0.027-0.008-0.054-0.013-0.081-0.021c-0.206-0.06-0.415-0.115-0.628-0.158
					c-0.063-0.013-0.128-0.018-0.192-0.029c-0.177-0.031-0.354-0.062-0.536-0.08C344.001,0.013,343.751,0,343.5,0h-248
					C73.72,0,56,17.72,56,39.5v432c0,21.78,17.72,39.5,39.5,39.5h320c21.78,0,39.5-17.72,39.5-39.5v-360
					C455,111.249,454.987,110.999,454.962,110.751z M351,25.606L429.394,104H375.5c-13.509,0-24.5-10.99-24.5-24.5V25.606z M415.5,496
					h-320C81.991,496,71,485.01,71,471.5v-432C71,25.99,81.991,15,95.5,15H336v64.5c0,21.78,17.72,39.5,39.5,39.5H440v352.5
					C440,485.01,429.009,496,415.5,496z"/>
			</svg>
			<svg data-cmd="shapeAdd" data-cmd-arg="circle">
				<circle r="20" cx="21" cy="21"></circle>
			</svg>
			<svg data-cmd="shapeAdd" data-cmd-arg="rect" class="big">
				<rect x="1" y="1" width="60" height="40" rx="15" ry="15"></rect>
			</svg>
			<svg data-cmd="shapeAdd" data-cmd-arg="rhomb" class="big">
				<g transform="translate(1,1)">
					<path d="M0 20 L30 0 L60 20 L30 40 Z" stroke-width="2" stroke-linejoin="round"></path>
				</g>
			</svg>
			<svg data-cmd="shapeAdd" data-cmd-arg="text">
				<text x="5" y="40" font-size="52px" fill="#344767" stroke-width="0">T</text>
			</svg>
			<a href="https://github.com/AlexeyBoiko/DgrmJS" target="_blank">GitHub</a>
			<a href="https://linkedin.com/in/alexey-boyko-tech" target="_blank">LinkedIn</a>
			<a href="https://alexey-boyko.medium.com/" target="_blank">Blog</a>
			<a href="https://boyko.tech/" target="_blank">boyko.tech</a>
		</div>`;

		shadow.querySelectorAll('.itm').forEach(el => el.addEventListener('click', this));

		const menu = shadow.getElementById('menu');
		menu.querySelectorAll('[data-cmd="shapeAdd"]').forEach(el => el.addEventListener('pointerdown', this));
		menu.addEventListener('pointerleave', this);
		menu.addEventListener('pointerup', this);
		menu.addEventListener('pointermove', this);
	};

	/**
	 * subscribe to event
	 * @param {string} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		this.addEventListener(evtType, listener);
		return this;
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'click':
				this._dispatch(evt.currentTarget.getAttribute('data-cmd'), evt.currentTarget.getAttribute('data-cmd-arg'));
				break;
			case 'pointerdown':
				this._isNativePointerleaveTriggered = false;
				this._isShapeDragOutDispatched = false;
				this._pressedShape = evt.currentTarget.getAttribute('data-cmd-arg');

				// for emulate pointerleave
				this._parentElem = document.elementFromPoint(evt.clientX, evt.clientY);
				this._pointElem = this._parentElem;
				break;
			case 'pointerup':
				this._isNativePointerleaveTriggered = false;
				this._isShapeDragOutDispatched = false;
				this._pressedShape = null;
				break;
			case 'pointermove':
				this._emulatePointerleave(evt);

				// if native 'pointerleave' don't fire -> mobile
				if (!this._isNativePointerleaveTriggered && this._isShapeDragOutDispatched) {
					this._dispatch('shapeMove', {
						clientX: evt.clientX,
						clientY: evt.clientY
					});
				}
				break;
			case 'pointerleave':
				this._isNativePointerleaveTriggered = true;
				this._leave(evt);
				break;
		}
	}

	/**
	 * @param {PointerEvent & { currentTarget: Element }} evt
	 * @private
	 */
	_emulatePointerleave(evt) {
		// emulate pointerleave for mobile

		// if standart 'pointerleave' works -> this._pressedShape = null
		// emulation will not trigger event second time

		if (!this._pressedShape) { return; }

		const pointElem = document.elementFromPoint(evt.clientX, evt.clientY);
		if (pointElem === this._pointElem) {
			return;
		}

		// pointerleave
		if (this._parentElem === this._pointElem) {
			this._leave(evt);
		}

		/**
		 * @type {Element}
		 * @private
		 */
		this._pointElem = pointElem;
	}

	/**
	 * @param {PointerEvent & { currentTarget: Element }} evt
	 * @private
	 */
	_leave(evt) {
		if (!this._pressedShape) { return; }

		this._dispatch('shapeDragOut', {
			shape: this._pressedShape,
			clientX: evt.clientX,
			clientY: evt.clientY
		});

		this._pressedShape = null;
		this._isShapeDragOutDispatched = true;
	}

	/**
	 * @param {string} type
	 * @param {any} detail
	 */
	_dispatch(type, detail) {
		this.dispatchEvent(new CustomEvent(type, {
			bubbles: true,
			composed: true,
			detail: detail
		}));
	}
}
customElements.define('ap-menu', Menu);
