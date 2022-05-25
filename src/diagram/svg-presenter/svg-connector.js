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
	 * @param {PresenterPathEndDirection=} param.dir
	 */
	constructor({ svgEl, connectorType, shape, key, innerPosition, dir }) {
		/** @private */
		this._svgEl = svgEl;

		/**
		 * @type {Set<PresenterShapeState>}
		 * @private
		 */
		this._state = new Set();

		/** @type {PresenterElementType} */
		this.type = 'connector';
		this.connectorType = connectorType;
		this.shape = shape;
		this.key = key;
		this.innerPosition = innerPosition;
		this.dir = dir;
	}

	/**
	 * @param {PresenterShapeState} state
	 * @returns {boolean}
	 */
	stateHas(state) {
		return this._state.has(state);
	}

	/**
	 * @returns {Set<PresenterShapeState>}
	 */
	stateGet() {
		return new Set(this._state);
	}

	/**
	 * @param {{ state: Set<PresenterShapeState>; }} param
	 */
	update(param) {
		this._state = param.state;
		for (const state of ['connected', 'hovered', 'selected']) {
			stateClassSync(this._state, this._svgEl, /** @type{PresenterShapeState} */(state));
		}
	}
}
