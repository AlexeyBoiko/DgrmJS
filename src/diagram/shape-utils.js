import { setDel } from './infrastructure/iterable-utils.js';

/**
 * @param {IPresenterStatable} shape
 * @param {PresenterShapeState} state
 */
export function shapeStateAdd(shape, state) {
	shape.update({ state: shape.stateGet().add(state) });
}

/**
 * @param {IPresenterStatable} shape
 * @param {PresenterShapeState} state
 */
export function shapeStateDel(shape, state) {
	shape.update({ state: setDel(shape.stateGet(), state) });
}
