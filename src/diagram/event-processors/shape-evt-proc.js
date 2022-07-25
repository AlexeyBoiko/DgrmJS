import { first } from '../infrastructure/iterable-utils.js';
import { shapeStateAdd, shapeStateDel, shapeStateSet } from '../shape-utils.js';

/** delta between shape and cursor when shape start dragging {Point} */
const movedDelta = Symbol(0);

/** @typedef {IPresenterShape & { [movedDelta]?: Point }} IEvtProcShape */

/** @implements {IDiagramPrivateEventProcessor} */
export class ShapeEvtProc {
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
	 * @param {IEvtProcShape} shape
	 * @param {IDiagramPrivateEvent} evt
	 */
	process(shape, evt) {
		switch (evt.type) {
			case 'pointermove':
				if (!shape[movedDelta]) {
					//
					// move start

					this._diagram.selected = null;

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

			case 'pointerup':
				if (!shape[movedDelta]) {
					//
					// select

					this._diagram.selected = shapeOrPath(shape);
					return;
				}

				//
				// move end

				if (shape.connectable) {
					if (/** @type {IPresenterConnector} */(evt.detail.target).connectorType === 'in') {
						//
						// connect

						const path = first(shape.connectedPaths);
						if (!this._diagram.dispatch('connect', path)) { return; }
						this._connectorManager.replaceEnd(path, /** @type {IPresenterConnector} */(evt.detail.target));
						this._diagram.del(shape);
						shapeStateDel(path, 'disabled');
						shape = null;
					}

					switch (evt.detail.target.type) {
						case 'shape': shapeStateDel(/** @type {IPresenterShape} */(evt.detail.target), 'hovered'); break;
						case 'connector': shapeStateDel(/** @type {IPresenterConnector} */(evt.detail.target).shape, 'hovered'); break;
					}
				}

				if (shape) {
					disable(shape, false);
					delete shape[movedDelta];
				}
				break;

			case 'unselect':
				shapeStateDel(shapeOrPath(shape), 'selected');
				break;

			case 'pointerenter':
				if (shape.connectable && ['connector', 'shape'].includes(evt.detail.target.type)) {
					shapeStateAdd(/** @type {IPresenterStatable} */(evt.detail.target), 'hovered');
				}
				break;
			case 'pointerleave':
				if (!shape.connectable) { return; }
				switch (evt.detail.target.type) {
					case 'shape':
						if (/** @type {IPresenterConnector} */(evt.detail.enterTo)?.shape !== evt.detail.target) {
							shapeStateDel(/** @type {IPresenterStatable} */(evt.detail.target), 'hovered');
						}
						break;
					case 'connector':
						if (/** @type {IPresenterConnector} */(evt.detail.target)?.shape !== evt.detail.enterTo) {
							shapeStateDel(/** @type {IPresenterConnector} */(evt.detail.target).shape, 'hovered');
						} else {
							shapeStateDel(/** @type {IPresenterStatable} */(evt.detail.target), 'hovered');
						}
						break;
				}
				break;
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
