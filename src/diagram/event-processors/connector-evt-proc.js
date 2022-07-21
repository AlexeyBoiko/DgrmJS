import { shapeStateSet } from '../shape-utils.js';

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
				this._diagram.shapeSetMoving(this._createConnectorEnd(connector));
				break;

			// when evt on {connector}, or on another and {connector} was activeSahpe
			case 'pointerdown':
				shapeStateSet(connector, 'selected', connector === evt.detail.target);
				break;

			// when evt on {connector}, or on another and {connector} is activeSahpe
			case 'pointerup':
				this._diagram.shapeSetMoving(null);
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

/**
 * create param for connectorEnd shape
 * @param {IPresenterConnector} connector
 * @returns {DiagramShapeAddParam}
 * @private
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
