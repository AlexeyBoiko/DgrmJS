import { svgPositionSet, svgPositionGet, svgTextDraw } from '../../infrastructure/svg-utils.js';
import { stateClassSync } from '../svg-presenter-utils.js';

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
		 * @type {Set<DiagramShapeState>}
		 * @private
		 */
		this._state = new Set();

		this.svgEl = svgEl;

		/** @type {DiagramElementType} */
		this.type = type || 'shape';
		this.connectable = connectable;
		this.defaultInConnector = defaultInConnector;

		/** @type {Map<string, IPresenterConnector>} */
		this.connectors = new Map();
	}

	/**
	 * @param {DiagramShapeState} state
	 * @returns {boolean}
	 */
	stateHas(state) {
		return this._state.has(state);
	}

	/** @returns {Set<DiagramShapeState>} */
	stateGet() {
		return new Set(this._state);
	}

	/** @returns {Point} */
	positionGet() {
		return svgPositionGet(this.svgEl);
	}

	/** @param {DiagramShapeUpdateParam} param */
	update(param) {
		if (param.position) {
			svgPositionSet(this.svgEl, param.position);
		}

		if (param.props) {
			SvgShape._attrsSet(this.svgEl, param.props);
		}

		if (param.connectors) {
			Object.keys(param.connectors).forEach(connectorKey => {
				const connectorUpdateParams = param.connectors[connectorKey];
				const connectorData = this.connectors.get(connectorKey);
				if (connectorUpdateParams.innerPosition) { connectorData.innerPosition = connectorUpdateParams.innerPosition; }
				if (connectorUpdateParams.dir) { connectorData.dir = connectorUpdateParams.dir; }
			});
		}

		if (param.state) {
			this._state = param.state;
			for (const state of ['selected', 'hovered', 'disabled']) {
				stateClassSync(this._state, this.svgEl, /** @type {DiagramShapeState} */(state));
			}
		}
	}

	/**
	 * @param {Element} elem
	 * @param {DiagramShapeProps} props
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
						svgTextDraw(
							/** @type {SVGTextElement} */(shape),
							props[name][attr]?.toString(),
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
 * @returns {{lineHeight:number, verticalMiddle?:number}}
 */
export function textParamsParse(textEl) {
	return {
		lineHeight: parseInt(textEl.getAttribute('data-line-height')),
		verticalMiddle: textEl.hasAttribute('data-vertical-middle')
			? parseInt(textEl.getAttribute('data-vertical-middle'))
			: null
	};
}
