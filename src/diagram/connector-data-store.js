/** @typedef {import("./connector-data").ConnectorData} ConnectorData */

export class ConnectorDataStore {
	/**
	 * @param {any} elData
	 */
	constructor(elData) {
		/** @private */
		this._elData = elData;
	}

	/**
	 * @param {SVGPathElement} path
	 * @param {ConnectorData} connectorData
	 */
	dataSet(path, connectorData) {
		this._elData.set(path, connectorData);

		// remember connector-shape links
		this._relatedPathAdd(connectorData.point1.shapePosition.shape, path);
		this._relatedPathAdd(connectorData.point2.shapePosition.shape, path);
	}

	/**
	 * @param {SVGPathElement} path
	 * @returns {ConnectorData}
	 */
	dataGet(path) {
		return this._elData.get(path);
	}

	/**
	 * @param {SVGPathElement} path
	 */
	dataDel(path) {
		const connectorData = this.dataGet(path);
		this.relatedPathList(connectorData.point1.shapePosition.shape).delete(path);
		this.relatedPathList(connectorData.point2.shapePosition.shape).delete(path);
	}

	/**
	 * get related connectors
	 * @param {SVGElement} shape
	 * @returns {Set<SVGPathElement>}
	 */
	relatedPathList(shape) {
		return this._elData.get(shape);
	}

	/**
	 * get related connectors that end with connectorElem
	 * @param {SVGGElement} shape
	 * @param {SVGElement} connectorElem
	 * @returns {SVGPathElement[]}
	 */
	relatedPathListByEndShare(shape, connectorElem) {
		return [...this.relatedPathList(shape)]
			.filter(path =>
				this.dataGet(path).point2.connectorElem === connectorElem);
	}

	/**
	 * remember related connector
	 * @param {SVGElement} shape
	 * @param {SVGPathElement} path
	 * @private
	 */
	_relatedPathAdd(shape, path) {
		/** {Set<SVGPathElement>} */
		let shapeConnectors = this._elData.get(shape);
		if (!shapeConnectors) {
			shapeConnectors = new Set();
			this._elData.set(shape, shapeConnectors);
		}
		shapeConnectors.add(path);
	}
}
