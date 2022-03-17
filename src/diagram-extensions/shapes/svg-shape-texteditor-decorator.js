import { svgStrToTspan } from '../../diagram/infrastructure/svg-utils.js';
import { textParamsParse } from '../../diagram/svg-presenter/svg-shape/svg-shape.js';

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
	 * @param {DiagramShapeEventType} type
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
		}

		this._svgShape.update(param);
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		evt.stopPropagation();

		if (!this._firstClick) {
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
				inputShow(
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
					});
			}

			// panel

			const position = this.svgEl.getBoundingClientRect();

			const newDiv = document.createElement('div');
			newDiv.style.position = 'fixed';
			newDiv.style.top = `${position.top - 30}px`;
			newDiv.style.left = `${position.left}px`;
			newDiv.innerHTML = 'Привет!';
			document.body.append(newDiv);
		}
		this._firstClick = false;
	}
}

/**
 * @param {SVGGElement} svgEl
 * @param {SVGRectElement} placeEl - where to place input
 * @param {PresenterShapeProps} shapeProps
 * @param {{():void}} onchangeCallback
 * @private
 */
function inputShow(svgEl, placeEl, shapeProps, onchangeCallback) {
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
		foreign.remove();
		if (!textarea.value) { placeEl.classList.add('empty'); } else { placeEl.classList.remove('empty'); }
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

	textarea.select();
	textarea.focus();
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
