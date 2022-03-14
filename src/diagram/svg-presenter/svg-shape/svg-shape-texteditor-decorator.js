import { svgStrToTspan } from '../../infrastructure/svg-utils.js';

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
	 * @param {PresenterShapeEventType} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @returns {IPresenterShape}
	 */
	on(type, listener) { return this._svgShape.on(type, listener); }

	/**
	 * @param {PresenterShapeUpdateParam} param
	 */
	update(param) {
		this._svgShape.update(param);

		if (param.position) {
			/** @private */
			this._firstClick = true;
		}

		if (param.props) {
			/** @private */
			this._props = Object.assign({}, param.props);

			// highlight empty text places
			this._svgShape.svgEl.querySelectorAll('[data-text-for]').forEach(el => {
				if (!param.props[el.getAttribute('data-text-for')].textContent) {
					el.classList.add('empty');
				}
			});
		}

		if (param.state) {
			if (param.state.has('selected')) { this._firstClick = true; }
		}
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
					placeEl = this._svgShape.svgEl.querySelector(`[data-text-for=${evt.target.parentElement.getAttribute('data-key')}]`);
					break;
				case 'text':
					placeEl = this._svgShape.svgEl.querySelector(`[data-text-for=${evt.target.getAttribute('data-key')}]`);
					break;
				default:
					if (evt.target.getAttribute('data-text-for')) {
						placeEl = /** @type {SVGRectElement} */(evt.target);
					}
					break;
			}

			if (placeEl) {
				inputShow(
					this._svgShape.svgEl,
					placeEl,
					this._props,
					_ => {
						this._svgShape.svgEl.dispatchEvent(new CustomEvent('update', {
							/** @type {IPresenterShapeEventUpdateDetail} */
							detail: {
								target: this._svgShape,
								props: this._props
							}
						}));
					});
			}
		}
		this._firstClick = false;
	}
}

/**
 * @param {SVGTextElement} textEl
 * @returns {{x:number, lineHeight:number}}
 */
export function textParamsParse(textEl) {
	return {
		x: textEl.x?.baseVal[0]?.value ?? 0,
		lineHeight: parseInt(textEl.getAttribute('data-line-height'))
	};
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
	foreignWidthSet(placeEl, foreign, textEl);

	const textarea = document.createElement('textarea');
	textarea.style.width = '100%';
	textarea.style.height = '100%';
	textarea.style.caretColor = textEl.getAttribute('fill');
	textarea.value = shapeProps[textKey].textContent ? shapeProps[textKey].textContent.toString() : null;

	const lineHeight = textParamsParse(textEl);
	textarea.oninput = function() {
		textEl.innerHTML = svgStrToTspan(textarea.value, lineHeight);
		foreignWidthSet(placeEl, foreign, textEl);
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
	textarea.focus();
}

/**
 * @param {SVGRectElement} placeEl - where to place input
 * @param {SVGForeignObjectElement} foreign
 * @param {SVGTextElement} textEl
 * @private
 */
function foreignWidthSet(placeEl, foreign, textEl) {
	const textBbox = textEl.getBBox();

	foreign.width.baseVal.value = textBbox.width;
	foreign.x.baseVal.value = textBbox.x;

	foreign.height.baseVal.value = textBbox.height;
	foreign.y.baseVal.value = textBbox.y;
}
