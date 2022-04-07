/**
 * SVG diagram
 */

import { connectorEndParams, shapeStateAdd, shapeStateDel } from './shape-utils.js';

/** @implements {IDiagram} */
export class Diagram extends EventTarget {
	/**
	 * @param {IPresenter} pesenter
	 * @param {IConnectorManager} connectorManager
	 */
	constructor(pesenter, connectorManager) {
		super();

		/** @private */
		this._presenter = pesenter
			.on('pointermove', this)
			.on('pointerdown', this)
			.on('pointerup', this)
			.on('pointerenter', this)
			.on('pointerleave', this);

		/** @private */
		this._connectorManager = connectorManager;
	}

	/**
	 * subscribe to event
	 * @param {DiagramEventType} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		this.addEventListener(evtType, listener);
		return this;
	}

	/**
	 * @param {PresenterShapeAppendParam} param
	 * @returns {IPresenterShape}
	 */
	shapeAdd(param) {
		return /** @type{IPresenterShape} */(this._presenter.append('shape', param));
	}

	/**
	 * @param {IPresenterShape} shape
	 * @returns {void}
	 */
	shapeDel(shape) {
		this._connectorManager.deleteByShape(shape);
		this._presenter.delete(shape);
	}

	/**
	 * @param {DiagramPrivateShapeConnectParam} param
	 * @returns {void}
	 */
	shapeConnect(param) {
		this._connectorManager.add(
			param.start.shape.connectors.get(param.start.connector),
			param.end.shape.connectors.get(param.end.connector));
	}

	/** @param { CustomEvent<IPresenterEventDetail> } evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'pointermove':
				if (this._movedShape) {
					shapeStateAdd(this._movedShape, 'disabled');

					this._movedShape.update({
						position: {
							x: this._movedDelta.x + evt.detail.clientX,
							y: this._movedDelta.y + evt.detail.clientY
						}
					});
					this._connectorManager.updatePosition(this._movedShape);
				}
				break;
			case 'pointerdown':
				switch (evt.detail.target.type) {
					case 'canvas':
					case 'shape':
						this.shapeSetMoving(/** @type {IPresenterShape} */(evt.detail.target), { x: evt.detail.clientX, y: evt.detail.clientY });
						break;
					case 'connector': {
						this._onConnectorDown(/** @type { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} */(evt));
					}
				}
				break;
			case 'pointerup':
				if (evt.detail.target.type === 'connector') {
					this._onConnectorUp(/** @type { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} */(evt));
				}
				this._movedClean();
				this._hoveredClean();
				break;
			case 'pointerenter':
				if (this._movedShape && this._movedShape.connectable &&
					(evt.detail.target.type === 'connector' || evt.detail.target.type === 'shape')) {
					this._hoveredSet(/** @type {IPresenterStatable & IPresenterElement} */(evt.detail.target));
				}
				break;
			case 'pointerleave':
				this._hoveredClean();
				break;
		}
	}

	/**
	 * @param { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} evt
	 * @private
	 */
	_onConnectorDown(evt) {
		switch (evt.detail.target.connectorType) {
			case 'out': {
				//
				// connectorEnd create

				const connectorEnd = this.shapeAdd(connectorEndParams(evt.detail.target));
				this.shapeSetMoving(connectorEnd, { x: evt.detail.clientX, y: evt.detail.clientY });
				this._connectorManager.add(evt.detail.target, connectorEnd.defaultInConnector);
				break;
			}
			case 'in': {
				if (evt.detail.target.stateGet().has('connected')) {
					//
					// disconnect

					if (!this._dispatchEvent('disconnect', {
						start: this._connectorManager.startConnectorGet(evt.detail.target),
						end: evt.detail.target
					})) { return; }

					const connectorEnd = this.shapeAdd(connectorEndParams(evt.detail.target));
					this.shapeSetMoving(connectorEnd, { x: evt.detail.clientX, y: evt.detail.clientY });
					this._connectorManager.replaceEnd(evt.detail.target, connectorEnd.defaultInConnector);
				}
				break;
			}
		}
	}

	/**
	 * @param { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} evt
	 * @private
	 */
	_onConnectorUp (evt) {
		if (!this._movedShape || !this._movedShape.connectable || evt.detail.target.connectorType !== 'in') {
			return;
		}

		//
		// connect connector

		if (!this._dispatchEvent('connect', {
			start: this._connectorManager.startConnectorGet(this._movedShape.defaultInConnector),
			end: evt.detail.target
		})) { return; }

		this._connectorManager.replaceEnd(this._movedShape.defaultInConnector, evt.detail.target);
		this.shapeDel(this._movedShape);
	}

	/**
	 * @param {IPresenterShape} shape
	 * @private
	 */
	_selectedSet(shape) {
		if (shape !== this._selectedShape) {
			this._dispatchEvent('select', { target: shape });

			if (this._selectedShape) {
				shapeStateDel(this._selectedShape, 'selected');
			}

			if (shape) {
				shapeStateAdd(shape, 'selected');
			}

			/**
			 * @type {IPresenterShape}
			 * @private
			 */
			this._selectedShape = shape;
		}
	}

	/**
	 * @param {IPresenterShape} shape
	 * @param {Point} clientPoint
	 */
	shapeSetMoving(shape, clientPoint) {
		/** @private */
		this._movedShape = shape;

		const shapePosition = this._movedShape.positionGet();
		/** @private */
		this._movedDelta = {
			x: shapePosition.x - clientPoint.x,
			y: shapePosition.y - clientPoint.y
		};

		this._selectedSet(this._movedShape);
	}

	/** @private */
	_movedClean() {
		if (this._movedShape) {
			shapeStateDel(this._movedShape, 'disabled');
		}

		this._movedDelta = null;
		this._movedShape = null;
	}

	/**
	 * @param {IPresenterStatable & IPresenterElement} shape
	 * @private
	 */
	_hoveredSet(shape) {
		/** @private */
		this._hoveredShape = shape;

		shapeStateAdd(shape, 'hovered');
		if (shape.type === 'connector') {
			shapeStateAdd(/** @type {IPresenterConnector} */(shape).shape, 'hovered');
		}
	}

	/** @private */
	_hoveredClean() {
		if (!this._hoveredShape) {
			return;
		}

		shapeStateDel(this._hoveredShape, 'hovered');
		if (this._hoveredShape.type === 'connector') {
			shapeStateDel(/** @type {IPresenterConnector} */(this._hoveredShape).shape, 'hovered');
		}

		this._hoveredShape = null;
	}

	/**
	 * @param {DiagramEventType} type
	 * @param {IDiagramEventSelectDetail|IDiagramEventConnectDetail} detail
	 * @returns {boolean}
	 * @private
	 */
	_dispatchEvent(type, detail) {
		return this.dispatchEvent(new CustomEvent(type, {
			cancelable: true,
			detail: detail
		}));
	}
}
