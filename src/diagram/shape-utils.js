import { setDel } from './infrastructure/iterable-utils.js';

/**
 * @param {IPresenterStatable} shape
 * @param {DiagramShapeState} state
 */
export function shapeStateAdd(shape, state) {
	if (!shape.stateHas(state)) {
		const states = shape.stateGet();
		shape.update({ state: states.add(state) });
	}
}

/**
 * @param {IPresenterStatable} shape
 * @param {DiagramShapeState} state
 */
export function shapeStateDel(shape, state) {
	if (shape.stateHas(state)) {
		const states = shape.stateGet();
		shape.update({ state: setDel(states, state) });
	}
}

/**
 * create param for connectorEnd shape
 * @param {IPresenterConnector} connector
 * @returns {DiagramShapeAddParam}
 * @private
 */
export function connectorEndParams(connector) {
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
