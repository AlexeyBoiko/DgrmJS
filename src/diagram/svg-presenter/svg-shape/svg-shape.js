import { svgPositionSet, svgPositionGet, svgRotate, svgStrToTspan } from '../../infrastructure/svg-utils.js';

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
	}

	/**
	 * @param {string} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @returns {ISvgPresenterShape}
	 */
	on(type, listener) {
		this.svgEl.addEventListener(type, listener);
		return this;
	}

	/**
	 * @param {PresenterShapeState} state
	 * @returns {boolean}
	 */
	stateHas(state) {
		return this._state.has(state);
	}

	/** @returns {Set<PresenterShapeState>} */
	stateGet() {
		return new Set(this._state);
	}

	/** @returns {Point} */
	positionGet() {
		return svgPositionGet(this.svgEl);
	}

	/** @param {PresenterShapeUpdateParam} param */
	update(param) {
		if (param.position) {
			svgPositionSet(this.svgEl, param.position);
		}

		if (param.rotate) {
			svgRotate(this.svgEl, param.rotate);
		}

		if (param.props) {
			SvgShape._attrsSet(this.svgEl, param.props);
		}

		if (param.state) {
			this._state = param.state;
			if (this._state.has('selected')) { this.svgEl.classList.add('selected'); } else { this.svgEl.classList.remove('selected'); }
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
							textParamsParse(/** @type {SVGTextElement} */(shape)));
						break;
					default:
						shape.setAttribute(attr, props[name][attr].toString());
						break;
				}
			});
		});
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
