import { count, last } from '../infrastructure/iterable-utils.js';

/** @implements {IConnectorManager} */
export class ConnectorManager {
	/**
	 * @param {IPresenter} presenter
	 */
	constructor(presenter) {
		this._presenter = presenter;
	}

	/**
	 * @param {IConnectorInElement} connectorInElemStart type must be connectorInElem
	 * @param {IConnectorInElement} connectorInElemEnd type must be connectorInElem
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

		ConnectorManager._pathAdd(connectorInElemStart, path, 'start');
		ConnectorManager._pathAdd(connectorInElemEnd, path, 'end');
	}

	/**
	 * reconect to new connectorInElem
	 * if connectorInElemOld has many connectors - take last
	 * @param {IConnectorInElement} connectorInElemOld type must be connectorInElem
	 * @param {IConnectorInElement} connectorInElemNew type must be connectorInElem
	 * @returns {void}
	 */
	replaceEnd(connectorInElemOld, connectorInElemNew) {
		/** @type {IPresenterPath} */
		const path = last(connectorInElemOld.connectedPaths, el => el[1] === 'end')[0];
		path.update('end', connectorInElemNew.postionGet(), connectorInElemNew.dir);

		ConnectorManager._pathDel(connectorInElemOld, path);
		ConnectorManager._pathAdd(connectorInElemNew, path, 'end');
	}

	/**
	 * @param {IConnectorElement} shape
	 * @returns {void}
	 */
	updatePosition(shape) {
		throw new Error('Method not implemented.');
	}

	/**
	 * @param {IConnectorInElement} connectorInElem
	 * @param {PresenterPathEndType} endType
	 * @returns {number}
	 */
	count(connectorInElem, endType) {
		return count(connectorInElem.connectedPaths, el => el[1] === endType);
	}

	/**
	 * @private
	 * @param {IConnectorInElement} connectorInElem
	 * @param {IPresenterPath} path
	 * @param {PresenterPathEndType} endType
	 * @returns {void}
	 */
	static _pathAdd(connectorInElem, path, endType) {
		if (!connectorInElem.connectedPaths) {
			connectorInElem.connectedPaths = new Map();
		}
		connectorInElem.connectedPaths.set(path, endType);
		connectorInElem.shape.connectedPaths.set(path, endType);
	}

	/**
	 * @param {IConnectorInElement} connectorInElem
	 * @param {IPresenterPath} path
	 * @returns {void}
	 */
	static _pathDel(connectorInElem, path) {
		connectorInElem.connectedPaths.delete(path);
		connectorInElem.shape.connectedPaths.delete(path);
	}
}
