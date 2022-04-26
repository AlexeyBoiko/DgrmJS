import { textParamsParse } from '../diagram/svg-presenter/svg-shape/svg-shape.js';
import { textareaCreate } from './infrastructure/svg-textarea.js';

/** @implements {ISvgPresenterShape} */
export class SvgShapeTextEditorDecorator {
	/**
	 * @param {ISvgPresenterShape} svgShape
	 * @param {PresenterShapeProps} initProps
	 */
	constructor(svgShape, initProps) {
		/**
		 * @type {ISvgPresenterShape}
		 * @private
		 */
		this._svgShape = svgShape;
		this._svgShape.svgEl.addEventListener('click', this);

		/** @private */
		this._props = Object.assign({}, initProps);

		// ISvgPresenterShape
		this.svgEl = this._svgShape.svgEl;
		this.type = this._svgShape.type;
		this.connectable = this._svgShape.connectable;
		this.defaultInConnector = this._svgShape.defaultInConnector;
		this.connectors = this._svgShape.connectors;
	}

	/**
	 * @param {PresenterShapeState} state
	 */
	stateHas(state) { return this._svgShape.stateHas(state); }
	stateGet() { return this._svgShape.stateGet(); }
	positionGet() { return this._svgShape.positionGet(); }

	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @returns {ISvgPresenterShape}
	 */
	on(type, listener) { this._svgShape.on(type, listener); return this; }

	/**
	 * @param {PresenterShapeUpdateParam} param
	 */
	update(param) {
		if (param.position) { /** @private */ this._firstClick = false; }

		if (param.props) {
			/** @private */
			this._props = Object.assign({}, param.props);
		}

		if (param.state) {
			if (param.state.has('selected') && !this.stateGet().has('selected')) {
				this._firstClick = true;
				this._textEditorHighlightEmpty();
			}
			this._panelDel();
			this._textEditorDel();
		}

		this._svgShape.update(param);
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		if (evt.target.hasAttribute('data-no-click') ||
			document.elementFromPoint(evt.clientX, evt.clientY) !== evt.target) { return; }

		evt.stopPropagation();

		if (!this._firstClick) {
			this._textEditorShow(evt);
			this._panelShow(evt);
		}
		this._firstClick = false;
	}

	/** @private */
	_textEditorHighlightEmpty() {
		this.svgEl.querySelectorAll('[data-text-for]').forEach(el => {
			if (!this._props[el.getAttribute('data-text-for')]?.textContent) {
				el.classList.add('empty');
			}
		});
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 * @private
	 */
	_textEditorShow(evt) {
		if (this._textEditor) { return; }

		/** @type {SVGRectElement} */
		let placeEl;
		switch (evt.target.tagName) {
			case 'tspan':
				placeEl = this.svgEl.querySelector(`[data-text-for=${evt.target.parentElement.getAttribute('data-key')}]`);
				break;
			case 'text':
				placeEl = this.svgEl.querySelector(`[data-text-for=${evt.target.getAttribute('data-key')}]`);
				break;
			default:
				if (evt.target.getAttribute('data-text-for')) {
					placeEl = /** @type {SVGRectElement} */(evt.target);
				}
				break;
		}

		if (placeEl) {
			placeEl.classList.remove('empty');
			const textKey = placeEl.getAttribute('data-text-for');

			/** @type {SVGTextElement} */
			const textEl = this.svgEl.querySelector(`[data-key=${textKey}]`);

			/** @private */
			this._textEditor = textareaCreate(
				// textEl
				textEl,
				// textParam
				textParamsParse(textEl),
				// val
				this._props[textKey]?.textContent.toString(),
				// onchange
				val => {
					if (!this._props[textKey]) { this._props[textKey] = {}; }
					this._props[textKey].textContent = val;

					this.svgEl.dispatchEvent(new CustomEvent('update', {
						/** @type {ISvgPresenterShapeEventUpdateDetail} */
						detail: {
							target: this,
							props: this._props
						}
					}));
				},
				// onblur
				val => {
					this._textEditorDel();
					if (!val) { placeEl.classList.add('empty'); } else { placeEl.classList.remove('empty'); }
				});
		}
	}

	/** @private */
	_textEditorDel() {
		if (!this._textEditor) { return; }

		const textEditor = this._textEditor;
		this._textEditor = null;
		textEditor.remove();
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 * @private
	 */
	_panelShow(evt) {
		if (this._panel) { return; }

		const position = this.svgEl.getBoundingClientRect();

		const panelDiv = document.createElement('div');
		panelDiv.classList.add('pop-set');
		panelDiv.style.position = 'fixed';
		panelDiv.style.top = `${position.top - 35}px`;
		panelDiv.style.left = `${position.left + 10}px`;
		panelDiv.innerHTML = `
			<style>
			.pop-set {
				position: fixed;
				padding: 10px;
				box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%);
				border-radius: 16px;
				background-color: rgba(255,255,255, .9);
			}
			</style>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>`;
		panelDiv.onclick = _ => {
			this._panelDel();
			this.svgEl.dispatchEvent(new CustomEvent('del', {
				/** @type {ISvgPresenterShapeEventUpdateDetail} */
				detail: {
					target: this,
					props: this._props
				}
			}));
		};
		document.body.append(panelDiv);

		/** @private */
		this._panel = panelDiv;
	}

	/** @private */
	_panelDel() {
		if (!this._panel) { return; }

		const panelDiv = this._panel;
		this._panel = null;
		panelDiv.remove();
	}
}
