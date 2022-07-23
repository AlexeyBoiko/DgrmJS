import { shapeStateAdd } from './shape-utils.js';

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
			.on('pointerenter', this);
		// .on('pointerleave', this);

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
		this.selected = null;
		this._connectorManager.del(/** @type { IPresenterShape | IPresenterPath} */(shape));
	}

	/** @param { CustomEvent<IDiagramPrivateEventDetail> & IDiagramPrivateEvent } evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'pointermove':
				if (this._activeElement) { this._evtProcessorCall(this._activeElement, evt); }
				break;
			case 'pointerdown':
				/**
				 * track all events
				 * @private
				 * @type {IDiagramElement}
				 */
				this._activeElement = evt.detail.target;
				this._evtProcessorCall(this._activeElement, evt);
				break;
			case 'pointerup':
				if (this._activeElement) { this._evtProcessorCall(this._activeElement, evt); }
				this._activeElement = null;
				break;
			case 'pointerenter':
				if (this._activeElement) {
					if (this._hovered) {
						this._evtProcessorCall(
							this._activeElement,
							{ type: 'pointerleave', detail: { target: this._hovered, enterTo: evt.detail.target } });
					}

					this._evtProcessorCall(this._activeElement, evt);
				}

				/** @private */
				this._hovered = evt.detail.target;
				break;
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
	 * @param {IDiagramElement} elem
	 */
	// eslint-disable-next-line accessor-pairs
	set activeElement (elem) {
		this._activeElement = elem;
	}

	/** @param {IPresenterStatable} elem */
	set selected(elem) {
		if (elem === this._selected) { return; }

		if (this._selected) {
			this._evtProcessorCall(this._selected, { type: 'unselect' });
		}

		/** @private */
		this._selected = elem;
		if (elem) {
			this.dispatch('select', elem);
			shapeStateAdd(elem, 'selected');
		}
	}

	get selected() { return this._selected; }

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
