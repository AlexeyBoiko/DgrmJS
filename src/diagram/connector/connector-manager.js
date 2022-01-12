import { any, last } from '../infrastructure/iterable-utils.js';

/** @implements {IConnectorManager} */
export class ConnectorManager {
	/**
	 * @param {IPresenter} presenter
	 */
	constructor(presenter) {
		this._presenter = presenter;
	}

	/**
	 * @param {IConnectorConnector} connectorStart type must be connectorInElem
	 * @param {IConnectorConnector} connectorEnd type must be connectorInElem
	 * @returns {void}
	 */
	add(connectorStart, connectorEnd) {
		const path = /** @type {IPresenterPath} */(this._presenter.append(
			'path',
			{
				templateKey: 'path',
				start: {
					position: ConnectorManager._pathPoint(connectorStart),
					dir: connectorStart.dir
				},
				end: {
					position: ConnectorManager._pathPoint(connectorEnd),
					dir: connectorEnd.dir ? connectorEnd.dir : ConnectorManager._dirRevers(connectorStart.dir)
				}
			}));

		ConnectorManager._pathAdd(connectorStart, path, 'start');
		ConnectorManager._pathAdd(connectorEnd, path, 'end');
	}

	/**
	 * reconect to new connectorInElem
	 * if connectorInElemOld has many connectors - take last
	 * @param {IConnectorConnector} connectorOld type must be connectorInElem
	 * @param {IConnectorConnector} connectorNew type must be connectorInElem
	 * @returns {void}
	 */
	replaceEnd(connectorOld, connectorNew) {
		/** @type {IPresenterPath} */
		const path = last(connectorOld.connectedPaths, el => el[1] === 'end')[0];
		path.update({
			end: {
				position: ConnectorManager._pathPoint(connectorNew),
				dir: connectorNew.dir ? connectorNew.dir : connectorOld.dir
			}
		});

		ConnectorManager._pathDel(connectorOld, path, 'end');
		ConnectorManager._pathAdd(connectorNew, path, 'end');
	}

	/**
	 * update related with shape paths
	 * @param {IConnetorShape} shape
	 * @returns {void}
	 */
	updatePosition(shape) {
		if (!any(shape.connectedPaths)) {
			return;
		}

		const shapePosition = shape.postionGet();
		shape.connectedPaths.forEach((endPoints, path) => {
			path.update({
				start: endPoints.startInnerPosition
					? { position: { x: shapePosition.x + endPoints.startInnerPosition.x, y: shapePosition.y + endPoints.startInnerPosition.y } }
					: null,
				end: endPoints.endInnerPosition
					? { position: { x: shapePosition.x + endPoints.endInnerPosition.x, y: shapePosition.y + endPoints.endInnerPosition.y } }
					: null
			});
		});
	}

	/**
	 * @param {IConnectorConnector} connectorInElem
	 * @param {PresenterPathEndType} endType
	 * @returns {boolean}
	 */
	any(connectorInElem, endType) {
		return any(connectorInElem.connectedPaths, el => el[1] === endType);
	}

	/**
	 * @private
	 * @param {IConnectorConnector} connector
	 * @param {IPresenterPath} path
	 * @param {PresenterPathEndType} endType
	 * @returns {void}
	 */
	static _pathAdd(connector, path, endType) {
		if (!connector.connectedPaths) {
			connector.connectedPaths = new Map();
		}
		connector.connectedPaths.set(path, endType);

		//
		// bind to shape

		if (!connector.shape.connectedPaths) {
			connector.shape.connectedPaths = new Map();
		}
		let shapePathPoints = connector.shape.connectedPaths.get(path);
		if (!shapePathPoints) {
			shapePathPoints = {};
			connector.shape.connectedPaths.set(path, shapePathPoints);
		}

		if (endType === 'start') {
			shapePathPoints.startInnerPosition = connector.innerPosition;
		} else if (endType === 'end') {
			shapePathPoints.endInnerPosition = connector.innerPosition;
		}
	}

	/**
	 * @private
	 * @param {IConnectorConnector} connector
	 * @param {IPresenterPath} path
	 * @param {PresenterPathEndType} endType
	 * @returns {void}
	 */
	static _pathDel(connector, path, endType) {
		connector.connectedPaths.delete(path);

		//
		// unbind from shape

		const shapePathPoints = connector.shape.connectedPaths.get(path);
		if (endType === 'start') {
			shapePathPoints.startInnerPosition = null;
		} else if (endType === 'end') {
			shapePathPoints.endInnerPosition = null;
		}

		if (!shapePathPoints.startInnerPosition && !shapePathPoints.endInnerPosition) {
			connector.shape.connectedPaths.delete(path);
		}
	}

	/**
	 * @param {IConnectorConnector} connector
	 * @returns {Point}
	 * @private
	 */
	static _pathPoint(connector) {
		const shapePosition = connector.shape.postionGet();
		return {
			x: shapePosition.x + connector.innerPosition.x,
			y: shapePosition.y + connector.innerPosition.y
		};
	}

	/**
	 * @param {PresenterPathEndDirection} dir
	 * @returns {PresenterPathEndDirection}
	 * @private
	 */
	static _dirRevers(dir) {
		switch (dir) {
			case 'bottom': return 'top';
			case 'top' : return 'bottom';
			case 'left' : return 'right';
			case 'right' : return 'left';
		}
	}
}
