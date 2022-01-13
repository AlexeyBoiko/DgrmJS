/**
 * SVG diagram
 */

import { connectorEndParams, shapeStateAdd, shapeStateDel } from './shape-utils.js';

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
	 * @param {PresenterChildAddType} type
	 * @param {PresenterShapeAppendParam | PresenterPathAppendParam} param
	 * @returns {IPresenterElement}
	 */
	shapeAdd(type, param) {
		return this._presenter.append(type, param);
	}

	/**
	 * @param {DiagramShapeUpdateParam} param
	 * @returns {IPresenterShape}
	 */
	shapeUpdate(param) {
		/** @type {IPresenterShape} */
		const shape = param.shape
			? param.shape
			: this._presenter.querySelector(param.selector);

		shape.update(param);
		return shape;
	}

	/**
	 * @param {DiagramShapeDelParam} param
	 * @returns {void}
	 */
	shapeDel(param) {
		// TODO: delete connectors

		this._presenter.delete(/** @type {IPresenterShape} */(param.shape
			? param.shape
			: this._presenter.querySelector(param.selector)));
	}

	/** @param { CustomEvent<IPresenterEventDetail> } evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'pointermove':
				if (this._movedShape) {
					const shapePosition = {
						x: this._movedDelta.x + evt.detail.offsetX,
						y: this._movedDelta.y + evt.detail.offsetY
					};

					this._movedShape.update({ position: shapePosition });
					this._connectorManager.updatePosition(this._movedShape);
				}
				break;
			case 'pointerdown':
				switch (evt.detail.target.type) {
					case 'canvas':
					case 'shape':
						this._movedSet(/** @type {IPresenterShape} */(evt.detail.target), { x: evt.detail.offsetX, y: evt.detail.offsetY });
						break;
					case 'connector': {
						this._onConnectorDown(/** @type { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} */(evt));
					}
				}
				break;
			case 'pointerup':
				switch (evt.detail.target.type) {
					case 'connector':
						this._onConnectorUp(/** @type { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} */(evt));
						shapeStateDel(/** @type {IPresenterConnector} */(evt.detail.target).shape, 'hovered');
						shapeStateDel(/** @type {IPresenterConnector} */(evt.detail.target), 'hovered');
						break;
				}
				this._movedClean();
				break;
			case 'pointerenter':
				if (this._movedShape && this._movedShape.connectable) {
					switch (evt.detail.target.type) {
						case 'shape':
							shapeStateAdd(/** @type {IPresenterShape} */(evt.detail.target), 'hovered');
							break;
						case 'connector':
							shapeStateAdd(/** @type {IPresenterConnector} */(evt.detail.target).shape, 'hovered');
							shapeStateAdd(/** @type {IPresenterConnector} */(evt.detail.target), 'hovered');
							break;
					}
				}
				break;
			case 'pointerleave':
				if (this._movedShape && this._movedShape.connectable) {
					switch (evt.detail.target.type) {
						case 'shape':
							shapeStateDel(/** @type {IPresenterShape} */(evt.detail.target), 'hovered');
							break;
						case 'connector':
							shapeStateDel(/** @type {IPresenterConnector} */(evt.detail.target).shape, 'hovered');
							shapeStateDel(/** @type {IPresenterConnector} */(evt.detail.target), 'hovered');
							break;
					}
				}
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

				const connectorEnd = /** @type {IPresenterShape} */(this.shapeAdd('shape', connectorEndParams(evt.detail.target)));
				this._movedSet(connectorEnd, { x: evt.detail.offsetX, y: evt.detail.offsetY });
				this._connectorManager.add(evt.detail.target, connectorEnd.defaultInConnector);
				break;
			}
			case 'in': {
				if (evt.detail.target.stateGet().has('connected')) {
					//
					// disconnect

					const connectorEnd = /** @type {IPresenterShape} */(this.shapeAdd('shape', connectorEndParams(evt.detail.target)));
					this._movedSet(connectorEnd, { x: evt.detail.offsetX, y: evt.detail.offsetY });
					this._connectorManager.replaceEnd(evt.detail.target, connectorEnd.defaultInConnector);
					if (!this._connectorManager.any(evt.detail.target, 'end')) {
						shapeStateDel(evt.detail.target, 'connected');
					}
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

		this._connectorManager.replaceEnd(this._movedShape.defaultInConnector, evt.detail.target);
		this.shapeDel({ shape: this._movedShape });
		shapeStateAdd(evt.detail.target, 'connected');
	}

	/**
	 * @param {IPresenterShape} shape
	 * @private
	 */
	_selectedSet(shape) {
		if (shape !== this._selectedShape) {
			this._dispatchEvent('select', shape);

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
	 * @param {Point} offsetPoint
	 * @private
	 */
	_movedSet(shape, offsetPoint) {
		/** @private */
		this._movedShape = shape;

		if (this._movedShape.connectable) {
			shapeStateAdd(this._movedShape, 'disabled');
		}

		const shapePosition = this._movedShape.postionGet();
		/** @private */
		this._movedDelta = {
			x: shapePosition.x - offsetPoint.x,
			y: shapePosition.y - offsetPoint.y
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
	 * @param {DiagramEventType} type
	 * @param {IPresenterShape} target
	 * @private
	 */
	_dispatchEvent(type, target) {
		return this.dispatchEvent(new CustomEvent(type, {
			cancelable: true,
			/** @type {IDiagramEventDetail} */
			detail: {
				target: target
			}
		}));
	}
}
