import { setDel } from './infrastructure/iterable-utils.js';

/**
 * @param {IPresenterStatable} shape
 * @param {PresenterShapeState} state
 */
export function shapeStateAdd(shape, state) {
	const states = shape.stateGet();
	if (!states.has(state)) {
		shape.update({ state: states.add(state) });
	}
}

/**
 * @param {IPresenterStatable} shape
 * @param {PresenterShapeState} state
 */
export function shapeStateDel(shape, state) {
	const states = shape.stateGet();
	if (states.has(state)) {
		shape.update({ state: setDel(states, state) });
	}
}

/**
 * create param for connectorEnd shape
 * @param {IPresenterConnector} connector
 * @returns {PresenterShapeAppendParam}
 * @private
 */
export function connectorEndParams(connector) {
	const shapePosition = connector.shape.postionGet();
	const innerPosition = connector.innerPosition;
	return {
		templateKey: 'connect-end',
		position: {
			x: shapePosition.x + innerPosition.x,
			y: shapePosition.y + innerPosition.y
		},
		postionIsIntoCanvas: true,
		rotate: connector.connectorType === 'out'
			? connector.dir === 'right'
				? 0
				: connector.dir === 'left'
					? 180
					: connector.dir === 'bottom'
						? 90
						: 270
			: connector.dir === 'right'
				? 180
				: connector.dir === 'left'
					? 0
					: connector.dir === 'bottom'
						? 270
						: 90
	};
}
