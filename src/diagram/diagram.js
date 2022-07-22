import { shapeStateAdd, shapeStateDel } from './shape-utils.js';

/** @implements {IDiagramPrivate} */
export class Diagram extends EventTarget {
	/**
	 * @param {IPresenter} pesenter
	 * @param {IConnectorManager} connectorManager
	 * @param {(diagram: IDiagramPrivate) => Map<DiagramElementType, IDiagramPrivateEventProcessor>} evtProcessorsFactory
	 */
	constructor(pesenter, connectorManager, evtProcessorsFactory) {
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

		/**
		 * @type {Map<DiagramElementType, IDiagramPrivateEventProcessor>}
		 * @private
		 */
		this._evtProcessors = evtProcessorsFactory(this);
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

		this.dispatch('add', element);
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

	/** @param { IDiagramPrivateEvent } evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'pointermove':
				if (this.activeElement) { this._evtProcessorCall(this.activeElement, evt); }
				// this._evtProcess(evt);

				// if (this._downElement) {
				// 	const clientPoint = { x: evt.detail.clientX, y: evt.detail.clientY };
				// 	if (this._downElement.type === 'connector') {
				// 		this._connectorStartMove(/** @type {IPresenterConnector} */(this._downElement), clientPoint);
				// 	} else {
				// 		this.shapeSetMoving(
				// 			this._downElement.type === 'shape' ? /** @type {IPresenterShape} */(this._downElement) : this._presenter.canvas,
				// 			clientPoint);
				// 	}
				// 	this._downElement = null;
				// }

				// if (this._movedShape) {
				// 	this._movedShape.update({
				// 		position: {
				// 			x: this._movedDelta.x + evt.detail.clientX,
				// 			y: this._movedDelta.y + evt.detail.clientY
				// 		}
				// 	});
				// 	this._connectorManager.updatePosition(this._movedShape);
				// }
				break;
			case 'pointerdown':
				// /**
				//  * @private
				//  * @type {IDiagramElement}
				//  */
				// this._downElement = evt.detail.target;

				// this._evtProcess(evt);

				/**
				 * @private
				 * @type {IDiagramElement}
				 */
				this.activeElement = evt.detail.target;
				this._evtProcessorCall(this.activeElement, evt);
				break;
			case 'pointerup':
				// this._evtProcess(evt);
				if (this.activeElement) { this._evtProcessorCall(this.activeElement, evt); }
				this.activeElement = null;

				// if (evt.detail.target.type === 'connector') {
				// 	this._connectorOnUp(/** @type { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} */(evt));
				// } else if (this._downElement) {
				// 	// if click on shape without move
				// 	this._selectedSet(/** @type {IPresenterShape} */(this._downElement).connectable
				// 		? this._connectorManager.pathGetByEnd(/** @type {IPresenterShape} */(this._downElement).defaultInConnector)
				// 		: /** @type {IPresenterShape} */(this._downElement));
				// }

				// this._downElement = null;
				// this.movedClean();
				// this._hoveredClean();
				break;
			case 'pointerenter':
				if (this.activeElement) {
					if (this._hovered) {
						this._evtProcessorCall(
							this.activeElement,
							{ type: 'pointerleave', detail: { target: this._hovered, enterTo: evt.detail.target } });
					}

					this._evtProcessorCall(this.activeElement, evt);
				}

				/** @private */
				this._hovered = evt.detail.target;
				// this._evtProcessorCall(this._hovered, evt);

				// OLD
				// 	if (this._movedShape && this._movedShape.connectable &&
				// 		(evt.detail.target.type === 'connector' || evt.detail.target.type === 'shape')) {
				// 		this._hoveredSet(/** @type {IPresenterStatable & IDiagramElement} */(evt.detail.target));
				// 	}
				break;
			// case 'pointerleave':
			// 	if (this.activeElement) { this._evtProcessorCall(this.activeElement, evt); }

			// 	// 	// 	this._hoveredClean();
			// 	break;
		}
	}

	/**
	 * @param {IDiagramElement} elem
	 * @param {IDiagramPrivateEvent} evt
	 * @private
	 */
	_evtProcessorCall(elem, evt) {
		this._evtProcessors.get(elem.type).process(elem, evt);
	}

	/**
	 * @param {IPresenterShape} shape
	 */
	shapeSetMoving(shape) {
	// /** @private */
	// this._movedShape = shape;

		// this._disable(this._movedShape, true);

		// const shapePosition = this._movedShape.positionGet();
		// /** @private */
		// this._movedDelta = {
		// 	x: shapePosition.x - clientPoint.x,
		// 	y: shapePosition.y - clientPoint.y
		// };

		// this._selectedSet();

		/// ///////////// 1
		// this._evtProcess(new CustomEvent('pointerdown', {
		// /** @type {IPresenterEventDetail} */
		// 	detail: {
		// 		target: shape,
		// 		// TODO
		// 		clientX: 0,
		// 		clientY: 0
		// 	}
		// }));
		// this.activeElement = shape;

		/// ///////////// 2
		this.activeElement = shape;
	}

	movedClean() {
		// TODO: FOR MOBILE

		// if (this._movedShape) {
		// 	this._disable(this._movedShape, false);
		// }

		// this._movedDelta = null;
		// this._movedShape = null;
	}

	/** @param {IDiagramElement} elem */
	// eslint-disable-next-line accessor-pairs
	set selected(elem) {
		if (this._selected) {
			this._evtProcessorCall(this._selected, { type: 'unselect' });
		}

		/** @private */
		this._selected = elem;
		if (elem) {
			this.dispatch('select', elem);
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

					if (!this.dispatch('disconnect', path)) {
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
		if (!this.dispatch('connect', path)) { return; }

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
			this.dispatch('select', shape);

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
	 * @param {IPresenterStatable & IDiagramElement} shape
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
	 */
	dispatch(type, target) {
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
