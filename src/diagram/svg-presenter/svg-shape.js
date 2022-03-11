import { svgPositionSet, svgPositionGet, svgRotate, svgStrToTspan } from '../infrastructure/svg-utils.js';

/** @implements {ISvgPresenterShape} */
export class SvgShape {
	/**
	 * @param {object} param
	 * @param {SVGGraphicsElement} param.svgEl
	 * @param {'shape'|'canvas'=} param.type
	 * @param {boolean=} param.connectable
	 * @param {IPresenterConnector=} param.defaultInConnector
	 */
	constructor({ svgEl, type = null, connectable = null, defaultInConnector = null }) {
		/**
		 * @type {Set<PresenterShapeState>}
		 * @private
		 */
		this._state = new Set();

		this.svgEl = svgEl;

		/** @type {PresenterElementType} */
		this.type = type || 'shape';
		this.connectable = connectable;
		this.defaultInConnector = defaultInConnector;

		/** @type {Map<string, IPresenterConnector>} */
		this.connectors = new Map();

		this.svgEl.addEventListener('click', this);
	}

	/**
	 * @returns {Set<PresenterShapeState>}
	 */
	stateGet() {
		return new Set(this._state);
	}

	/** @returns {Point} */
	postionGet() {
		return svgPositionGet(this.svgEl);
	}

	/**
	 * @param {PresenterShapeUpdateParam} param
	 * */
	update(param) {
		if (param.position) {
			svgPositionSet(this.svgEl, param.position);
			this._firstClick = true;
		}

		if (param.rotate) {
			svgRotate(this.svgEl, param.rotate);
		}

		if (param.props) {
			this._props = Object.assign({}, param.props);
			SvgShape._attrsSet(this.svgEl, param.props);

			// highlight empty text places
			this.svgEl.querySelectorAll('[data-text-for]').forEach(el => {
				if (!param.props[el.getAttribute('data-text-for')].textContent) {
					el.classList.add('empty');
				}
			});
		}

		if (param.state) {
			this._state = param.state;
			if (this._state.has('selected')) {
				this.svgEl.classList.add('selected');
				this._firstClick = true;
			} else { this.svgEl.classList.remove('selected'); }
			if (this._state.has('hovered')) { this.svgEl.classList.add('hover'); } else { this.svgEl.classList.remove('hover'); }
			if (this._state.has('disabled')) { this.svgEl.style.pointerEvents = 'none'; } else { this.svgEl.style.pointerEvents = 'auto'; }
		}
	}

	/**
	 * @param {Element} elem
	 * @param {PresenterShapeProps} props
	 * @private
	 */
	static _attrsSet(elem, props) {
		Object.keys(props).forEach(name => {
			const shape = (name === 'root')
				? elem
				: elem.querySelector(`[data-key='${name}'`);

			Object.keys(props[name]).forEach(attr => {
				switch (attr) {
					case 'textContent':
						shape.innerHTML = svgStrToTspan(
							props[name][attr] ? props[name][attr].toString() : '',
							SvgShape._textParamsParse(/** @type {SVGTextElement} */(shape)));
						break;
					default:
						shape.setAttribute(attr, props[name][attr].toString());
						break;
				}
			});
		});
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
				SvgShape._inputShow(this.svgEl, placeEl, this._props);
			}
		}
		this._firstClick = false;
	}

	/**
	 * @param {SVGGElement} svgEl
	 * @param {SVGRectElement} placeEl - where to place input
	 * @param {PresenterShapeProps} shapeProps - where to place input
	 * @private
	 */
	static _inputShow(svgEl, placeEl, shapeProps) {
		const textKey = placeEl.getAttribute('data-text-for');
		/** @type {SVGTextElement} */
		const textEl = svgEl.querySelector(`[data-key=${textKey}]`);
		placeEl.classList.remove('empty');

		const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
		SvgShape._foreignWidthSet(placeEl, foreign, textEl);

		const input = document.createElement('textarea');
		input.style.width = '100%';
		input.style.height = '100%';
		input.style.caretColor = textEl.getAttribute('fill');
		input.value = shapeProps[textKey].textContent ? shapeProps[textKey].textContent.toString() : null;

		const lineHeight = SvgShape._textParamsParse(textEl);
		input.oninput = function() {
			shapeProps[textKey].textContent = input.value;
			textEl.innerHTML = svgStrToTspan(input.value, lineHeight);
			SvgShape._foreignWidthSet(placeEl, foreign, textEl);
		};

		input.onblur = function() {
			foreign.remove();
			if (!input.value) { placeEl.classList.add('empty'); } else { placeEl.classList.remove('empty'); }
		};
		input.onpointerdown = function(evt) {
			evt.stopImmediatePropagation();
		};
		foreign.appendChild(input);

		svgEl.appendChild(foreign);
		input.focus();
	}

	/**
	 * @param {SVGRectElement} placeEl - where to place input
	 * @param {SVGForeignObjectElement} foreign
	 * @param {SVGTextElement} textEl
	 * @private
	 */
	static _foreignWidthSet(placeEl, foreign, textEl) {
		const textBbox = textEl.getBBox();
		if (textBbox.width > 0) {
			foreign.width.baseVal.value = textBbox.width;
			foreign.x.baseVal.value = textBbox.x;

			foreign.height.baseVal.value = textBbox.height;
			foreign.y.baseVal.value = textBbox.y;
		} else {
			foreign.width.baseVal.value = placeEl.width.baseVal.value;
			foreign.x.baseVal.value = placeEl.x.baseVal.value;

			foreign.height.baseVal.value = placeEl.height.baseVal.value;
			foreign.y.baseVal.value = placeEl.y.baseVal.value;
		}
	}

	/**
	 * @param {SVGTextElement} textEl
	 * @returns {{x:number, lineHeight:number}}
	 * @private
	 */
	static _textParamsParse(textEl) {
		return {
			x: textEl.x?.baseVal[0]?.value ?? 0,
			lineHeight: parseInt(textEl.getAttribute('data-line-height'))
		};
	}
}
