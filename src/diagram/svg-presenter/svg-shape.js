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
	 * NOT immutable, change with update method
	 * @returns {Set<PresenterShapeState>}
	 */
	stateGet() {
		return this._state;
	}

	/** @returns {Point} */
	postionGet() {
		return svgPositionGet(this.svgEl);
	}

	/** @param {PresenterShapeUpdateParam} param */
	update(param) {
		if (param.position) {
			svgPositionSet(this.svgEl, param.position);
			this._firstClick = true;
		}

		if (param.rotate) {
			svgRotate(this.svgEl, param.rotate);
		}

		if (param.props) {
			SvgShape._attrsSet(this.svgEl, param.props);

			// highlight empty text places
			this.svgEl.querySelectorAll('[data-text-for]').forEach(el => {
				if (/** @type {SVGTextElement} */ (this.svgEl.querySelector(`[data-key=${el.getAttribute('data-text-for')}]`)).getBBox().width === 0) {
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
						shape.innerHTML = props[name][attr]
							? svgStrToTspan(props[name][attr].toString(), SvgShape._textLineHeightAttrParse(shape))
							: '';
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
			if (evt.target.tagName === 'tspan' || evt.target.getAttribute('data-text-for')) {
				const placeEl = evt.target.tagName === 'tspan'
					? this.svgEl.querySelector(`[data-text-for=${evt.target.parentElement.getAttribute('data-key')}]`)
					: evt.target;
				if (placeEl) {
					// @ts-ignore
					SvgShape._inputShow(this.svgEl, placeEl);
				}
			}
		}
		this._firstClick = false;
	}

	/**
	 * @param {SVGGElement} svgEl
	 * @param {SVGRectElement} placeEl - where to place input
	 * @private
	 */
	static _inputShow(svgEl, placeEl) {
		/** @type {SVGTextElement} */
		const textEl = svgEl.querySelector(`[data-key=${placeEl.getAttribute('data-text-for')}]`);
		placeEl.classList.remove('empty');

		const foreign = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
		SvgShape._foreignWidthSet(placeEl, foreign, textEl);

		const input = document.createElement('textarea');
		// input.type = 'text';
		input.style.width = '100%';
		input.style.height = '100%';
		input.style.caretColor = textEl.getAttribute('fill');
		input.value = textEl.textContent;

		const lineHeight = SvgShape._textLineHeightAttrParse(textEl);
		input.oninput = function() {
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
	 * @param {Element} textEl
	 * @returns {number}
	 * @private
	 */
	static _textLineHeightAttrParse(textEl) {
		return parseInt(textEl.getAttribute('data-line-height'));
	}
}
