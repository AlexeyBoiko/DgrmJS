import { svgStrToTspan } from '../diagram/infrastructure/svg-utils.js';
import { textParamsParse } from '../diagram/svg-presenter/svg-shape/svg-shape.js';

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

	stateGet() { return this._svgShape.stateGet(); }
	postionGet() { return this._svgShape.postionGet(); }

	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @returns {IPresenterShape}
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

			// highlight empty text places
			this.svgEl.querySelectorAll('[data-text-for]').forEach(el => {
				if (!param.props[el.getAttribute('data-text-for')].textContent) {
					el.classList.add('empty');
				}
			});
		}

		if (param.state) {
			if (param.state.has('selected') && !this.stateGet().has('selected')) { this._firstClick = true; }
			this._panelDel();
			this._textEditorDel();
		}

		this._svgShape.update(param);
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		evt.stopPropagation();

		if (!this._firstClick) {
			this._textEditorShow(evt);
			this._panelShow(evt);
		}
		this._firstClick = false;
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
			/** @private */
			this._textEditor = inputShow(
				this.svgEl,
				placeEl,
				this._props,
				// onchangeCallback
				_ => {
					this.svgEl.dispatchEvent(new CustomEvent('update', {
						/** @type {IDiagramShapeEventUpdateDetail} */
						detail: {
							target: this,
							props: this._props
						}
					}));
				},
				// onblurCallback
				_ => this._textEditorDel());
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
		panelDiv.style.top = `${position.top - 50}px`;
		panelDiv.style.left = `${position.left - 5}px`;
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
				/** @type {IDiagramShapeEventUpdateDetail} */
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

/**
 * @param {SVGGElement} svgEl
 * @param {SVGRectElement} placeEl - where to place input
 * @param {PresenterShapeProps} shapeProps
 * @param {{():void}} onchangeCallback
 * @param {{():void}} onblurCallback
 * @returns {SVGForeignObjectElement}
 * @private
 */
function inputShow(svgEl, placeEl, shapeProps, onchangeCallback, onblurCallback) {
	const textKey = placeEl.getAttribute('data-text-for');
	/** @type {SVGTextElement} */
	const textEl = svgEl.querySelector(`[data-key=${textKey}]`);
	placeEl.classList.remove('empty');

	const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
	const textarea = document.createElement('textarea');

	textarea.style.caretColor = textEl.getAttribute('fill');
	textarea.value = shapeProps[textKey].textContent ? shapeProps[textKey].textContent.toString() : null;

	const lineHeight = textParamsParse(textEl);
	textarea.oninput = function() {
		textEl.innerHTML = svgStrToTspan(textarea.value, lineHeight);
		foreignWidthSet(textEl, foreign, textarea, textareaPaddingAndBorder, textareaStyle.textAlign);
		shapeProps[textKey].textContent = textarea.value;
		onchangeCallback();
	};
	textarea.onblur = function() {
		if (!textarea.value) { placeEl.classList.add('empty'); } else { placeEl.classList.remove('empty'); }
		onblurCallback();
	};
	textarea.onpointerdown = function(evt) {
		evt.stopImmediatePropagation();
	};

	foreign.appendChild(textarea);
	svgEl.appendChild(foreign);

	const textareaStyle = getComputedStyle(textarea);
	// must be in px
	const textareaPaddingAndBorder = parseInt(textareaStyle.padding) + parseInt(textareaStyle.borderWidth);
	foreignWidthSet(textEl, foreign, textarea, textareaPaddingAndBorder, textareaStyle.textAlign);

	textarea.focus();
	return foreign;
}

/**
 * @param {SVGTextElement} textEl
 * @param {SVGForeignObjectElement} foreign
 * @param {HTMLTextAreaElement} textarea
 * @param {number} textareaPaddingAndBorder
 * @param {string} textAlign
 * @private
 */
function foreignWidthSet(textEl, foreign, textarea, textareaPaddingAndBorder, textAlign) {
	const textBbox = textEl.getBBox();
	const width = textBbox.width + 20;

	foreign.width.baseVal.value = width + 2 * textareaPaddingAndBorder;
	foreign.x.baseVal.value = textBbox.x - textareaPaddingAndBorder - ((textAlign === 'center') ? 10 : 0);

	foreign.height.baseVal.value = textBbox.height + 2 * textareaPaddingAndBorder;
	foreign.y.baseVal.value = textBbox.y - textareaPaddingAndBorder;

	textarea.style.width = `${width}px`;
	textarea.style.height = `${textBbox.height}px`;
}
