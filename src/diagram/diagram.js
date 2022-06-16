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
	 * @param {DiagramChildAddType} type
	 * @param {DiagramShapeAddParam | DiagramPrivateShapeConnectParam} param
	 * @returns {IDiagramElement}
	 */
	add(type, param) {
		/** @type {IDiagramElement} */
		let element;
		switch (type) {
			case 'shape':
				element = this._presenter.append('shape', /** @type {DiagramShapeAddParam} */(param));
				break;
			case 'path':
				element = this._connectorManager.add(
					connectorGet(/** @type {DiagramPrivateShapeConnectParam} */(param).start),
					connectorGet(/** @type {DiagramPrivateShapeConnectParam} */(param).end));
				break;
		}

		this._dispatchEvent('add', element);
		return element;
	}

	/**
	 * @param {IPresenterShape} shape
	 * @param {DiagramShapeUpdateParam} param
	 */
	shapeUpdate(shape, param) {
		shape.update(param);
		if (param.position || param.connectors) {
			this._connectorManager.updatePosition(shape);
		}
	}

	/**
	 * @param {IDiagramElement} shape
	 * @returns {void}
	 */
	del(shape) {
		this._connectorManager.del(/** @type { IPresenterShape | IPresenterPath} */(shape));
	}

	/** @param { CustomEvent<IPresenterEventDetail> } evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'pointermove':
				if (this._downElement) {
					const clientPoint = { x: evt.detail.clientX, y: evt.detail.clientY };
					if (this._downElement.type === 'connector') {
						this._connectorStartMove(/** @type {IPresenterConnector} */(this._downElement), clientPoint);
					} else {
						this.shapeSetMoving(
							this._downElement.type === 'shape' ? /** @type {IPresenterShape} */(this._downElement) : this._presenter.canvas,
							clientPoint);
					}
					this._downElement = null;
				}

				if (this._movedShape) {
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
				/**
				 * @private
				 * @type {IPresenterElement}
				 */
				this._downElement = evt.detail.target;
				break;
			case 'pointerup':
				if (evt.detail.target.type === 'connector') {
					this._connectorOnUp(/** @type { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} */(evt));
				} else if (this._downElement) {
					// if click on shape without move
					this._selectedSet(/** @type {IPresenterShape} */(this._downElement).connectable
						? this._connectorManager.pathGetByEnd(/** @type {IPresenterShape} */(this._downElement).defaultInConnector)
						: /** @type {IPresenterShape} */(this._downElement));
				}

				this._downElement = null;
				this.movedClean();
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
	 * @param {IPresenterConnector} connector
	 * @param { Point} clientPoint
	 * @private
	 */
	_connectorStartMove(connector, clientPoint) {
		switch (connector.connectorType) {
			case 'out': {
				//
				// connectorEnd create

				const connectorEnd = /** @type {IPresenterShape} */(this.add('shape', connectorEndParams(connector)));
				this.add('path', {
					start: connector,
					end: connectorEnd.defaultInConnector
				});
				this.shapeSetMoving(connectorEnd, clientPoint);
				break;
			}
			case 'in': {
				if (connector.stateGet().has('connected')) {
					//
					// disconnect

					const path = (this._selectedShape?.type === 'path' && /** @type {IPresenterPath} */(this._selectedShape).end === connector)
						? /** @type {IPresenterPath} */(this._selectedShape)
						: this._connectorManager.pathGetByEnd(connector);

					if (!this._dispatchEvent('disconnect', path)) {
						return;
					}

					const connectorEnd = /** @type {IPresenterShape} */(this.add('shape', connectorEndParams(connector)));
					this._connectorManager.replaceEnd(path, connectorEnd.defaultInConnector);
					this.shapeSetMoving(connectorEnd, clientPoint);
				}
				break;
			}
		}
	}

	/**
	 * @param { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} evt
	 * @private
	 */
	_connectorOnUp (evt) {
		if (evt.detail.target.connectorType !== 'in') { return; }

		if (!this._movedShape?.connectable) {
			this._selectedSet(this._connectorManager.pathGetByEnd(evt.detail.target));
			return;
		}

		//
		// connect connector

		const path = this._connectorManager.pathGetByEnd(this._movedShape.defaultInConnector);
		if (!this._dispatchEvent('connect', path)) { return; }

		shapeStateDel(path, 'disabled');
		this._connectorManager.replaceEnd(path, evt.detail.target);
		this.del(this._movedShape);
	}

	/**
	 * @param {IPresenterStatable?=} shape
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
			 * @type {IPresenterStatable}
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

		this._disable(this._movedShape, true);

		const shapePosition = this._movedShape.positionGet();
		/** @private */
		this._movedDelta = {
			x: shapePosition.x - clientPoint.x,
			y: shapePosition.y - clientPoint.y
		};

		this._selectedSet();
	}

	movedClean() {
		if (this._movedShape) {
			this._disable(this._movedShape, false);
		}

		this._movedDelta = null;
		this._movedShape = null;
	}

	/**
	 * @param {IPresenterShape} shape
	 * @param {Boolean} isDisable
	 * @private
	 */
	_disable(shape, isDisable) {
		const stateSetter = isDisable ? shapeStateAdd : shapeStateDel;

		stateSetter(shape, 'disabled');
		if (shape.connectable) {
			const path = this._connectorManager.pathGetByEnd(shape.defaultInConnector);
			if (path) {
				stateSetter(
					this._connectorManager.pathGetByEnd(shape.defaultInConnector),
					'disabled');
			}
		}
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
	 * @param {IDiagramElement} target
	 * @returns {boolean}
	 * @private
	 */
	_dispatchEvent(type, target) {
		return this.dispatchEvent(new CustomEvent(type, {
			cancelable: true,
			detail: { target }
		}));
	}
}

/**
 * @param {DiagramPrivateConnectorEnd | IPresenterConnector} startOrEnd
 * @returns {IPresenterConnector}
 */
function connectorGet(startOrEnd) {
	return /** @type {IPresenterConnector} */(startOrEnd).type
		? /** @type {IPresenterConnector} */(startOrEnd)
		: startOrEnd.shape.connectors.get(startOrEnd.key);
}
