import { any, last } from '../infrastructure/iterable-utils.js';
import { shapeStateDel } from '../shape-utils.js';

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
		const path = /** @type {IConnectorPath} */(this._presenter.append(
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

		path.start = connectorStart;
		path.end = connectorEnd;

		ConnectorManager._pathAdd(connectorStart.shape, path);
		ConnectorManager._pathAdd(connectorEnd.shape, path);
	}

	/**
	 * reconect to new connectorInElem
	 * if connectorInElemOld has many connectors - take last
	 * @param {IConnectorConnector} connectorOld type must be connectorInElem
	 * @param {IConnectorConnector} connectorNew type must be connectorInElem
	 * @returns {void}
	 */
	replaceEnd(connectorOld, connectorNew) {
		const path = last(connectorOld.shape.connectedPaths, pp => pp.end === connectorOld);
		path.update({
			end: {
				position: ConnectorManager._pathPoint(connectorNew),
				dir: connectorNew.dir ? connectorNew.dir : connectorOld.dir
			}
		});

		path.end = connectorNew;
		if (connectorOld.shape !== connectorNew.shape) {
			connectorOld.shape.connectedPaths.delete(path);
			ConnectorManager._pathAdd(connectorNew.shape, path);
		}
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
		for (const path of shape.connectedPaths) {
			path.update({
				start: path.start.shape === shape
					? { position: { x: shapePosition.x + path.start.innerPosition.x, y: shapePosition.y + path.start.innerPosition.y } }
					: null,
				end: path.end.shape === shape
					? { position: { x: shapePosition.x + path.end.innerPosition.x, y: shapePosition.y + path.end.innerPosition.y } }
					: null
			});
		}
	}

	/**
	 * delete related to shape connectors
	 * @param {IConnetorShape} shape
	 * @returns {void}
	 */
	deleteByShape(shape) {
		if (!any(shape.connectedPaths)) { return; }

		for (const path of shape.connectedPaths) {
			path.end.shape.connectedPaths.delete(path);
			shapeStateDel(path.end, 'connected');

			path.start.shape.connectedPaths.delete(path);
			shapeStateDel(path.start, 'connected');

			if (path.end.shape.connectable) {
				this._presenter.delete(path.end.shape);
			}
			this._presenter.delete(path);
		}
	}

	/**
	 * @param {IConnectorConnector} connector
	 * @returns {boolean}
	 */
	any(connector) {
		return any(connector.shape.connectedPaths, path => path.start === connector || path.end === connector);
	}

	/**
	 * @param {IConnetorShape} shape
	 * @param {IConnectorPath} path
	 * @private
	 */
	static _pathAdd(shape, path) {
		if (!shape.connectedPaths) { shape.connectedPaths = new Set(); }
		shape.connectedPaths.add(path);
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
