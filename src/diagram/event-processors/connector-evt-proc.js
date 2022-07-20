import { connectorEndParams } from '../shape-utils.js';

const isUp = Symbol(0);

/** @typedef {IPresenterConnector & { [isUp]?: Boolean }} IEvtProcShape */

/** @implements {IDiagramPrivateEventProcessor} */
export class ConnectorEvtProc {
	/** @param {IDiagramPrivate} diagram */
	constructor(diagram) {
		this._diagram = diagram;
	}

	/**
	 * @param {IPresenterConnector} connector
	 * @param {CustomEvent<IPresenterEventDetail>} evt
	 * */
	process(connector, evt) {
		switch (evt.type) {
			case 'pointermove':
				if (connector[isUp]) { return; }

				this._diagram.shapeSetMoving(
					this._createConnectorEnd(connector),
					{ x: evt.detail.clientX, y: evt.detail.clientY });
				break;
			case 'pointerdown':
				delete connector[isUp];
				break;
			case 'pointerup':
				connector[isUp] = true;
				break;
		}
	}

	/**
	 * @param {IPresenterConnector} connector
	 * @returns {IPresenterShape}
	 */
	_createConnectorEnd(connector) {
		switch (connector.connectorType) {
			case 'out': {
				//
				// connectorEnd create

				const connectorEnd = /** @type {IPresenterShape} */(this._diagram.add('shape', connectorEndParams(connector)));
				this._diagram.add('path', {
					start: connector,
					end: connectorEnd.defaultInConnector
				});
				return connectorEnd;
			}
			// case 'in':
			// 	if (connector.stateGet().has('connected')) {
			// 		//
			// 		// disconnect

			// 		const path = (this._selectedShape?.type === 'path' && /** @type {IPresenterPath} */(this._selectedShape).end === connector)
			// 			? /** @type {IPresenterPath} */(this._selectedShape)
			// 			: this._connectorManager.pathGetByEnd(connector);

			// 		if (!this.dispatch('disconnect', path)) {
			// 			return;
			// 		}

			// 		const connectorEnd = /** @type {IPresenterShape} */(this.add('shape', connectorEndParams(connector)));
			// 		this._connectorManager.replaceEnd(path, connectorEnd.defaultInConnector);
			// 		this._diagram.shapeSetMoving(connectorEnd, clientPoint);
			// 	}
			// 	break;
		}
		return null;
	}
}
