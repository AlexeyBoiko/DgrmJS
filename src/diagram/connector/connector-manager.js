import { countIn, lastIn } from '../infrastructure/iterable-utils.js';

/** @implements {IConnectorManager} */
export class ConnectorManager {
	/**
	 * @param {IPresenter} presenter
	 */
	constructor(presenter) {
		this._presenter = presenter;
	}

	/**
	 * @param {IConnectorInElem} connectorInElemStart type must be connectorInElem
	 * @param {IConnectorInElem} connectorInElemEnd type must be connectorInElem
	 * @returns {void}
	 */
	add(connectorInElemStart, connectorInElemEnd) {
		/** @type {IPresenterPath} */
		const path = this._presenter.appendChild(
			'path',
			{
				start: connectorInElemStart.postionGet(),
				end: connectorInElemEnd.postionGet()
			});

		ConnectorManager._addPath(connectorInElemStart, path, 'start');
		ConnectorManager._addPath(connectorInElemEnd, path, 'end');
	}

	/**
	 * reconect to new connectorInElem
	 * if connectorInElemOld has many connectors - take last
	 * @param {IConnectorInElem} connectorInElemOld type must be connectorInElem
	 * @param {IConnectorInElem} connectorInElemNew type must be connectorInElem
	 * @returns {void}
	 */
	replaceEnd(connectorInElemOld, connectorInElemNew) {
		/** @type {IPresenterPath} */
		const path = lastIn(connectorInElemOld.connectedPaths, (_, endType) => endType === 'end').key;
		path.update('end', connectorInElemNew.postionGet(), connectorInElemNew.dir);
		connectorInElemOld.connectedPaths.delete(path);
		ConnectorManager._addPath(connectorInElemNew, path, 'end');
	}

	/**
	 * @param {IConnectorInElem} shape
	 * @returns {void}
	 */
	updatePosition(shape) {
		throw new Error('Method not implemented.');
	}

	/**
	 * @param {IConnectorInElem} connectorInElem
	 * @param {PresenterPathEndType} endType
	 * @returns {number}
	 */
	count(connectorInElem, endType) {
		return countIn(connectorInElem.connectedPaths, (_, _endType) => _endType === endType);
	}

	/**
	 * @private
	 * @param {IConnectorInElem} connectorInElem
	 * @param {IPresenterPath} path
	 * @param {PresenterPathEndType} endType
	 * @returns {void}
	 */
	static _addPath(connectorInElem, path, endType) {
		if (!connectorInElem.connectedPaths) {
			connectorInElem.connectedPaths = new Map();
		}
		connectorInElem.connectedPaths.set(path, endType);
	}
}
