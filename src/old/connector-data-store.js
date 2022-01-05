/** @typedef {import("./connector-data").ConnectorData} ConnectorData */

export class ConnectorDataStore {
	/**
	 * @param {WeakMap<any, ConnectorData | Set<any>>} elData
	 */
	constructor(elData) {
		/** @private */
		this._elData = elData;
	}

	/**
	 * @param {any} path
	 * @param {ConnectorData} connectorData
	 */
	dataSet(path, connectorData) {
		this._elData.set(path, connectorData);

		// remember connector-shape links
		this._relatedPathAdd(connectorData.point1.shapePosition.shape, path);
		this._relatedPathAdd(connectorData.point2.shapePosition.shape, path);
	}

	/**
	 * @param {any} path
	 * @returns {ConnectorData}
	 */
	dataGet(path) {
		return /** @type {ConnectorData} */ (this._elData.get(path));
	}

	/**
	 * @param {any} path
	 */
	dataDel(path) {
		const connectorData = this.dataGet(path);
		this.relatedPathList(connectorData.point1.shapePosition.shape).delete(path);
		this.relatedPathList(connectorData.point2.shapePosition.shape).delete(path);
	}

	/**
	 * get related connectors
	 * @param {any} shape
	 * @returns {Set<any>}
	 */
	relatedPathList(shape) {
		return /** @type {Set<any>} */ (this._elData.get(shape));
	}

	/**
	 * get related connectors that end with connectorElem
	 * @param {any} shape
	 * @param {any} connectorElem
	 * @returns {any[]}
	 */
	relatedPathListByEndShare(shape, connectorElem) {
		return [...this.relatedPathList(shape)]
			.filter(path =>
				this.dataGet(path).point2.connectorElem === connectorElem);
	}

	/**
	 * remember related connector
	 * @param {any} shape
	 * @param {any} path
	 * @private
	 */
	_relatedPathAdd(shape, path) {
		let shapeConnectors = /** @type {Set<any>} */(this._elData.get(shape));
		if (!shapeConnectors) {
			shapeConnectors = new Set();
			this._elData.set(shape, shapeConnectors);
		}
		shapeConnectors.add(path);
	}
}
