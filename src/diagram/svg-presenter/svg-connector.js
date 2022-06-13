import { stateClassSync } from './svg-presenter-utils.js';

/** @implements {IPresenterConnector} */
export class SvgConnector {
	/**
	 * @param {object} param
	 * @param {SVGGraphicsElement} param.svgEl
	 * @param {PresenterConnectorType} param.connectorType
	 * @param {string} param.key
	 * @param {IPresenterShape} param.shape
	 * @param {Point} param.innerPosition
	 * @param {DiagramPathEndDirection=} param.dir
	 */
	constructor({ svgEl, connectorType, shape, key, innerPosition, dir }) {
		/** @private */
		this._svgEl = svgEl;

		/**
		 * @type {Set<DiagramShapeState>}
		 * @private
		 */
		this._state = new Set();

		/** @type {DiagramElementType} */
		this.type = 'connector';
		this.connectorType = connectorType;
		this.shape = shape;
		this.key = key;
		this.innerPosition = innerPosition;
		this.dir = dir;
	}

	/**
	 * @param {DiagramShapeState} state
	 * @returns {boolean}
	 */
	stateHas(state) {
		return this._state.has(state);
	}

	/**
	 * @returns {Set<DiagramShapeState>}
	 */
	stateGet() {
		return new Set(this._state);
	}

	/**
	 * @param {{ state: Set<DiagramShapeState>; }} param
	 */
	update(param) {
		this._state = param.state;
		for (const state of ['connected', 'hovered', 'selected']) {
			stateClassSync(this._state, this._svgEl, /** @type {DiagramShapeState} */(state));
		}
	}
}
