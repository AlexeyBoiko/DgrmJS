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
 * @param {IPresenterStatable} shape
 * @param {DiagramShapeState} state
 * @param {boolean} isSet
 */
export function shapeStateSet(shape, state, isSet) {
	(isSet ? shapeStateAdd : shapeStateDel)(shape, state);
}
