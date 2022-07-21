import { first } from '../infrastructure/iterable-utils.js';
import { shapeStateAdd, shapeStateDel, shapeStateSet } from '../shape-utils.js';

/** delta between shape and cursor when shape start dragging {Point} */
const movedDelta = Symbol(0);
const isDown = Symbol(0);
const isUp = Symbol(0);

/** @typedef {IPresenterShape & { [movedDelta]?: Point, [isDown]?: Boolean, [isUp]?: Boolean }} IEvtProcShape */

/** @implements {IDiagramPrivateEventProcessor} */
export class ShapeEvtProc {
	/** @param {IDiagramPrivate} diagram */
	constructor(diagram) {
		this._diagram = diagram;
	}

	/**
	 * @param {IEvtProcShape} shape
	 * @param {CustomEvent<IPresenterEventDetail>} evt
	 * */
	process(shape, evt) {
		switch (evt.type) {
			case 'pointermove':
				if (shape[isUp]) { return; }

				if (!shape[movedDelta]) {
					// move start

					this._select(shape, false);
					disable(shape, true);

					const shapePosition = shape.positionGet();
					shape[movedDelta] = {
						x: shapePosition.x - evt.detail.clientX,
						y: shapePosition.y - evt.detail.clientY
					};
				}

				this._diagram.shapeUpdate(shape, {
					position: {
						x: shape[movedDelta].x + evt.detail.clientX,
						y: shape[movedDelta].y + evt.detail.clientY
					}
				});
				break;

			// when: 'pointerdown' on {shape}, or 'pointerdown' on another element and {shape} was activeSahpe
			case 'pointerdown':
				if (shape !== evt.detail.target) {
					// Clear = 'pointerdown' on another element

					this._select(shape, false);
					delete shape[isUp];
					delete shape[isDown];
					delete shape[movedDelta];
					return;
				}

				delete shape[isUp];
				shape[isDown] = true;
				break;

			// when evt on {shape}, or on another element and {shape} is activeSahpe
			case 'pointerup':
				if (shape[movedDelta]) {
					// move end
					disable(shape, false);
				} else if (shape[isDown]) {
					// select = 'pointerdown' and 'pointerup' on {shape} and {shape} don't move
					this._select(shape, true);
				}

				delete shape[isDown];
				delete shape[movedDelta];
				shape[isUp] = true;
				break;

			// when evt on {shape}, or on another element and {shape} is activeSahpe
			case 'pointerenter':
				if (/** @type {IPresenterShape} */(this._diagram?.activeElement)?.connectable) {
					shapeStateAdd(shape, 'hovered');
				}
				break;
			case 'pointerleave':
				shapeStateDel(shape, 'hovered');
				break;
		}
	}

	/**
	 * @param {IPresenterShape} shape
	 * @param {boolean} isSelect
	 */
	_select(shape, isSelect) {
		const elem = shapeOrPath(shape);
		if (elem.stateHas('selected') === isSelect) { return; }

		if (isSelect) {
			this._diagram.dispatch('select', elem);
			shapeStateAdd(elem, 'selected');
		} else {
			shapeStateDel(elem, 'selected');
		}
	}
}

/**
 * @param {IPresenterShape} shape
 * @param {Boolean} isDisable
 * @returns {void}
 */
function disable(shape, isDisable) {
	shapeStateSet(shapeOrPath(shape), 'disabled', isDisable);
}

/**
 * @param {IPresenterShape} shape
 * @returns {IPresenterStatable}
 */
function shapeOrPath(shape) {
	return shape.connectable ? first(shape.connectedPaths) : shape;
}
