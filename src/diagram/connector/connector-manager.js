import { any, last } from '../infrastructure/iterable-utils.js';
import { shapeStateAdd, shapeStateDel } from '../shape-utils.js';

/** @implements {IConnectorManager} */
export class ConnectorManager {
	/**
	 * @param {IPresenter} presenter
	 */
	constructor(presenter) {
		this._presenter = presenter;
	}

	/**
	 * @param {IConnectorConnector} connectorStart
	 * @param {IConnectorConnector} connectorEnd
	 * @returns {IPresenterPath}
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
		shapeStateAdd(connectorEnd, 'connected');

		ConnectorManager._pathAdd(connectorStart.shape, path);
		ConnectorManager._pathAdd(connectorEnd.shape, path);

		return path;
	}

	/**
	 * reconect to new connector
	 * if connectorOld has many connectors - take last
	 * @param {IConnectorConnector} connectorOld
	 * @param {IConnectorConnector} connectorNew
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
			if (path.start.shape !== connectorOld.shape) {
				connectorOld.shape.connectedPaths.delete(path);
			}
			ConnectorManager._pathAdd(connectorNew.shape, path);
		}

		// state
		if (!any(connectorOld.shape.connectedPaths, path => path.start === connectorOld || path.end === connectorOld)) {
			shapeStateDel(connectorOld, 'connected');
		}
		shapeStateAdd(connectorNew, 'connected');
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

		const shapePosition = shape.positionGet();
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
	 * @param { IConnetorShape | IConnectorPath } shapeOrPath
	 */
	del(shapeOrPath) {
		switch (shapeOrPath.type) {
			case 'shape': this._deleteShape(/** @type {IConnetorShape} */(shapeOrPath)); break;
			case 'path': this._deletePath(/** @type {IConnectorPath} */(shapeOrPath)); break;
		}
	}

	/**
	 * @param {IConnectorPath} path
	 * @private
	 */
	_deletePath(path) {
		path.end.shape.connectedPaths.delete(path);
		if (!any(path.end.shape.connectedPaths, pp => pp.end === path.end)) {
			shapeStateDel(path.end, 'connected');
		}

		path.start.shape.connectedPaths.delete(path);

		if (path.end.shape.connectable) {
			this._presenter.delete(path.end.shape);
		}
		this._presenter.delete(path);
	}

	/**
	 * delete shape and related to shape connectors
	 * @param {IConnetorShape} shape
	 * @returns {void}
	 * @private
	 */
	_deleteShape(shape) {
		this._presenter.delete(shape);

		if (!any(shape.connectedPaths)) { return; }
		for (const path of shape.connectedPaths) {
			this._deletePath(path);
		}
	}

	/**
	 * @param {IConnectorConnector} endConnector
	 * @returns {IConnectorPath}
	 */
	pathGetByEnd(endConnector) {
		return last(endConnector.shape.connectedPaths, pp => pp.end === endConnector);
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
		const shapePosition = connector.shape.positionGet();
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
