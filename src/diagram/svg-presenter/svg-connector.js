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
		throw new Error('Method not implemented.');
	}

	/**
	 * @returns {boolean}
	 */
	connectedGet() {
		throw new Error('Method not implemented.');
	}
}
