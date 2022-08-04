import { first } from '../infrastructure/iterable-utils.js';
import { shapeStateAdd, shapeStateDel, shapeStateSet } from '../shape-utils.js';

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
	 * @param {IPresenterShape} shape
	 * @param {IDiagramPrivateEvent} evt
	 */
	process(shape, evt) {
		switch (evt.type) {
			case 'pointermove':
				shapeMove(this._diagram, shape, evt);
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

			case 'canvasleave':
				this._clean(shape);
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
		}
	}

	/**
	 * @param {IPresenterShape} shape
	 * @private
	 */
	_clean(shape) {
		if (shape) { shapeMoveEnd(shape); }
		this._hoveredSet(null);
		this._diagram.activeElement = null;
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
 * @param {IDiagramPrivate} diagram
 * @param {IEvtProcShape} shape
 * @param {IDiagramPrivateEvent} evt
 */
export function shapeMove(diagram, shape, evt) {
	if (!shape[movedDelta]) {
		//
		// move start

		diagram.selected = null;

		disable(shape, true);
		const shapePosition = shape.positionGet();
		shape[movedDelta] = {
			x: shapePosition.x - evt.detail.clientX,
			y: shapePosition.y - evt.detail.clientY
		};
	}

	diagram.shapeUpdate(shape, {
		position: {
			x: shape[movedDelta].x + evt.detail.clientX,
			y: shape[movedDelta].y + evt.detail.clientY
		}
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
