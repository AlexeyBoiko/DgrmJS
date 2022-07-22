import { last } from '../infrastructure/iterable-utils.js';

/** @implements {IDiagramPrivateEventProcessor} */
export class ConnectorEvtProc {
	/**
	 * @param {IDiagramPrivate} diagram
	 * @param {IConnectorManager} connectorManager
	 */
	constructor(diagram, connectorManager) {
		/** @private */
		this._diagram = diagram;

		/** @private */
		this._connectorManager = connectorManager;
	}

	/**
	 * @param {IPresenterConnector} connector
	 * @param {IDiagramPrivateEvent} evt
	 * */
	process(connector, evt) {
		switch (evt.type) {
			case 'pointermove':{
				const end = this._createConnectorEnd(connector);
				if (end) { this._diagram.shapeSetMoving(end); }
				break;
			}
		}
	}

	/**
	 * @param {IPresenterConnector} connector
	 * @returns {IPresenterShape}
	 * @private
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
			case 'in': {
				// disconnect

				const path = (this._diagram.selected?.type === 'path' && /** @type {IPresenterPath} */(this._diagram.selected).end === connector)
					? /** @type {IPresenterPath} */(this._diagram.selected)
					: last(connector.shape.connectedPaths, pp => pp.end === connector);

				if (!this._diagram.dispatch('disconnect', path)) { return null; }

				const connectorEnd = /** @type {IPresenterShape} */(this._diagram.add('shape', connectorEndParams(connector)));
				this._connectorManager.replaceEnd(path, connectorEnd.defaultInConnector);
				return connectorEnd;
			}
		}
	}
}

/**
 * create param for connectorEnd shape
 * @param {IPresenterConnector} connector
 * @returns {DiagramShapeAddParam}
 */
function connectorEndParams(connector) {
	const shapePosition = connector.shape.positionGet();
	const innerPosition = connector.innerPosition;
	return {
		templateKey: 'connect-end',
		position: {
			x: shapePosition.x + innerPosition.x,
			y: shapePosition.y + innerPosition.y
		},
		postionIsIntoCanvas: true
	};
}
