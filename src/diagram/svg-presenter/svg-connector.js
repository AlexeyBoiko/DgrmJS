/** @implements {IPresenterConnector} */
export class SvgConnector {
	/**
	 * @param {object} param
	 * @param {SVGGraphicsElement} param.svgEl
	 * @param {PresenterConnectorType} param.connectorType
	 * @param {IPresenterShape} param.shape
	 * @param {Point} param.innerPosition
	 * @param {PresenterPathEndDirection=} param.dir
	 */
	constructor({ svgEl, connectorType, shape, innerPosition, dir }) {
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
		this.innerPosition = innerPosition;
		this.dir = dir;
	}

	/**
	 * NOT immutable, change with update method
	 * @returns {Set<PresenterShapeState>}
	 */
	stateGet() {
		return this._state;
	}

	/**
	 * @param {{ state: Set<PresenterShapeState>; }} param
	 */
	update(param) {
		this._state = param.state;
		if (this._state.has('connected')) { this._svgEl.classList.add('connected'); } else { this._svgEl.classList.remove('connected'); }
		if (this._state.has('hovered')) { this._svgEl.classList.add('hover'); } else { this._svgEl.classList.remove('hover'); }
	}
}
