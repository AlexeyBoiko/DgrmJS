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

		/** @type {PresenterElementType} */
		this.type = 'connector';
		this.connectorType = connectorType;
		this.shape = shape;
		this.innerPosition = innerPosition;
		this.dir = dir;
	}

	/**
	 * @param {boolean} flag
	 * @returns {void}
	 */
	connectedSet(flag) {
		if (flag) {
			this._svgEl.classList.add('connected');
		} else {
			this._svgEl.classList.remove('connected');
		}
	}

	/**
	 * @returns {boolean}
	 */
	connectedGet() {
		return this._svgEl.classList.contains('connected');
	}
}
