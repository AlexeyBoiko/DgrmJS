import { first } from '../infrastructure/iterable-utils.js';
import { pointCanvasToView, pointViewToCanvas } from '../utils/point-convert-utils.js';
import { shapeStateAdd, shapeStateDel, shapeStateSet } from '../utils/shape-utils.js';

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
	 * @param {IDiagramElement} elem
	 * @return {boolean}
	 */
	canProcess(elem) { return elem.type === 'shape'; }

	/**
	 * @param {IPresenterShape} shape
	 * @param {IDiagramPrivateEvent} evt
	 */
	process(shape, evt) {
		switch (evt.type) {
			case 'pointermove':
				shapeMove(this._diagram, shape, evt, shape.connectable);
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

				if (shape.connectable && /** @type {IPresenterConnector} */(evt.detail.target).connectorType === 'in') {
					//
					// connect

					const path = first(shape.connectedPaths);
					if (!this._diagram.dispatch('connect', path)) { return; }
					this._connectorManager.replaceEnd(path, /** @type {IPresenterConnector} */(evt.detail.target));
					this._diagram.del(shape);
					shapeStateDel(path, 'disabled');
					shape = null;
				}

				this._clean(shape);
				break;
			case 'unselect':
				shapeStateDel(shapeOrPath(shape), 'selected');
				break;
			case 'pointerenter':
				if (shape.connectable && ['connector', 'shape'].includes(evt.detail.target.type)) {
					shapeStateAdd(/** @type {IPresenterStatable} */(evt.detail.target), 'hovered');

					this._hoveredSet((evt.detail.target.type === 'shape')
						? /** @type {IPresenterShape} */(evt.detail.target)
						: /** @type {IPresenterConnector} */(evt.detail.target).shape);
				}
				break;
			case 'pointerleave':
				if (!shape.connectable) { return; }
				switch (evt.detail.target.type) {
					case 'shape':
						if (/** @type {IPresenterConnector} */(evt.detail.enterTo)?.shape !== evt.detail.target) {
							this._hoveredSet(null);
						}
						break;
					case 'connector':
						if (/** @type {IPresenterConnector} */(evt.detail.target)?.shape !== evt.detail.enterTo) {
							this._hoveredSet(null);
						} else {
							shapeStateDel(/** @type {IPresenterStatable} */(evt.detail.target), 'hovered');
						}
						break;
				}
				break;
			case 'canvasleave':
			case 'unactive':
				this._clean(shape);
				break;
		}
	}

	/**
	 * @param {IPresenterShape} shape
	 * @private
	 */
	_clean(shape) {
		if (shape) { shapeMoveEnd(shape); }
		this._hoveredSet(null);
		this._diagram.activeElement(null);
	}

	/**
	 * @param {IPresenterShape} shape
	 * @private
	 */
	_hoveredSet(shape) {
		if (this._hovered && this._hovered !== shape) { shapeStateDel(this._hovered, 'hovered'); }
		/**
		 * @private
		 */
		this._hovered = shape;
	}
}

/** delta between shape and cursor when shape start dragging {Point} */
const movedDelta = Symbol(0);

/** @typedef {IPresenterShape & { [movedDelta]?: Point }} IEvtProcShape */

/**
 * @param {IDiagram} diagram
 * @param {IEvtProcShape} shape
 * @param {IDiagramPrivateEvent} evt
 * @param {boolean} bindConnectorToPointer TODO: refactor remove this
 */
export function shapeMove(diagram, shape, evt, bindConnectorToPointer = false) {
	if (!shape[movedDelta]) {
		//
		// move start

		diagram.selected = null;
		disable(shape, true);

		// TODO
		//		remove bindConnectorToPointer.
		//		when move one connector bindConnectorToPointer = true - bing center of connector to pointer
		//		when move many shapes bindConnectorToPointer = false

		if (bindConnectorToPointer) {
			// bind connector center to pointer
			// connectable shape is circle so bind to center
			shape[movedDelta] = { x: 0, y: 0 };
		} else {
			// remember point in shape we take and bind to pointer

			const shapePositionInView = pointCanvasToView(
				diagram.canvasPosition,
				diagram.scale,
				shape.positionGet());

			shape[movedDelta] = {
				x: shapePositionInView.x - evt.detail.clientX,
				y: shapePositionInView.y - evt.detail.clientY
			};
		}
	}

	diagram.shapeUpdate(shape, {
		position: pointViewToCanvas(
			diagram.canvasPosition,
			diagram.scale,
			{
				x: shape[movedDelta].x + evt.detail.clientX,
				y: shape[movedDelta].y + evt.detail.clientY
			})
	});
}

/**
 * @param {IEvtProcShape} shape
 */
export function shapeMoveEnd(shape) {
	disable(shape, false);
	delete shape[movedDelta];
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
