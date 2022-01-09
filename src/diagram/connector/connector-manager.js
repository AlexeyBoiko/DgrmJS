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
		const path = /** @type {IPresenterPath} */(this._presenter.appendChild(
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
		path.update('end', {
			position: ConnectorManager._pathPoint(connectorNew),
			dir: connectorNew.dir ? connectorNew.dir : connectorOld.dir
		});

		ConnectorManager._pathDel(connectorOld, path);
		ConnectorManager._pathAdd(connectorNew, path, 'end');
	}

	/**
	 * @param {IConnetorShape} shape
	 * @returns {void}
	 */
	updatePosition(shape) {
		if (!any(shape.connectedPaths)) {
			return;
		}

		const shapePosition = shape.postionGet();
		shape.connectedPaths.forEach((innerPoint, path) => {
			path.update(
				innerPoint.pathEndType,
				{
					position: {
						x: shapePosition.x + innerPoint.innerPosition.x,
						y: shapePosition.y + innerPoint.innerPosition.y
					}
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

		if (!connector.shape.connectedPaths) {
			connector.shape.connectedPaths = new Map();
		}
		connector.shape.connectedPaths.set(
			path,
			{ innerPosition: connector.innerPosition, pathEndType: endType });
	}

	/**
	 * @private
	 * @param {IConnectorConnector} connectorInElem
	 * @param {IPresenterPath} path
	 * @returns {void}
	 */
	static _pathDel(connectorInElem, path) {
		connectorInElem.connectedPaths.delete(path);
		connectorInElem.shape.connectedPaths.delete(path);
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
