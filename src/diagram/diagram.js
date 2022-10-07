import { first } from './infrastructure/iterable-utils.js';
import { shapeStateAdd } from './utils/shape-utils.js';

/** @implements {IDiagramPrivate} */
export class Diagram extends EventTarget {
	/**
	 * @param {IPresenter} pesenter
	 * @param {IConnectorManager} connectorManager
	 * @param {(diagram: IDiagramPrivate) => Set<IDiagramPrivateEventProcessor>} evtProcessorsFactory
	 */
	constructor(pesenter, connectorManager, evtProcessorsFactory) {
		super();

		/** @private */
		this._presenter = pesenter
			.on('pointermove', this)
			.on('pointerdown', this)
			.on('pointerup', this)
			.on('pointerenter', this)
			// .on('pointerleave', this);
			.on('canvasleave', this);

		/** @private */
		this._connectorManager = connectorManager;

		/**
		 * @type {Set<IDiagramPrivateEventProcessor>}
		 * @private
		 */
		this._evtProcessors = evtProcessorsFactory(this);
	}

	//
	// scale, canvas position

	get scale() { return this._presenter.scale; }
	/**
	 * @param {number} scale
	 * @param {Point} fixedPoint this point will not chage position while scale
	 */
	scaleSet(scale, fixedPoint) {
		this.dispatch('scale');
		this._presenter.scaleSet(scale, fixedPoint);
	}

	/**	@param {Point} val */
	set canvasPosition(val) { this._presenter.canvasPosition = val; }
	get canvasPosition() { return this._presenter.canvasPosition; }

	//
	// shapes add/update/remove

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
		this.dispatch('del', shape);
		this.selected = null;
		this._connectorManager.del(/** @type { IPresenterShape | IPresenterPath} */(shape));
	}

	//
	// pointer events, shape drag/click

	/** @param { CustomEvent<IDiagramPrivateEventDetail> & IDiagramPrivateEvent } evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'pointermove':
			case 'canvasleave':
				this._evtProcess(evt);
				break;
			case 'pointerdown':
				this.activeElement(evt.detail.target);
				this._evtProcess(evt);
				break;
			case 'pointerup':
				this._evtProcess(evt);
				this.activeElement(null);
				break;
			case 'pointerenter':
				if (this._hovered) {
					this._evtProcess({
						type: 'pointerleave',
						detail: { target: this._hovered, enterTo: evt.detail.target }
					});
				}

				this._evtProcess(evt);

				/** @private */
				this._hovered = evt.detail.target;
				break;
		}
	}

	/**
	 * @param {IDiagramElement} elem
	 * @private
	 */
	_evtProcGet(elem) {
		return first(this._evtProcessors, proc => proc.canProcess(elem));
	}

	/**
	 * @param { IDiagramPrivateEvent } evt
	 * @private
	 */
	_evtProcess(evt) {
		this._activeProcessor?.process(this._activeElement, evt);
	}

	/**
	 * activeElement track all events
	 * @param {IDiagramElement} elem
	 * @param {boolean?=} fireUnactive
	 */
	activeElement(elem, fireUnactive) {
		if (fireUnactive) { this._evtProcess({ type: 'unactive' }); }

		/**
		 * activeElement track all events
		 * @type {IDiagramElement}
		 * @private
		 */
		this._activeElement = elem;

		/**
		 * @type {IDiagramPrivateEventProcessor}
		 * @private
		 */
		this._activeProcessor = this._activeElement
			? this._evtProcGet(this._activeElement)
			: null;
	}

	/** @param {IPresenterStatable} elem */
	set selected(elem) {
		if (elem === this._selected) { return; }

		if (this._selected) {
			this._evtProcGet(this._selected).process(this._selected, { type: 'unselect' });
		}

		/** @private */
		this._selected = elem;
		if (elem) {
			this.dispatch('select', elem);
			shapeStateAdd(elem, 'selected');
		}
	}

	get selected() { return this._selected; }

	//
	// subscribe, dispatch

	/**
	 * subscribe to event
	 * @param {DiagramEventType} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 * @param {AddEventListenerOptions?=} options
	 */
	on(evtType, listener, options) {
		this.addEventListener(evtType, listener, options);
		return this;
	}

	/**
	 * @param {DiagramEventType} type
	 * @param {IDiagramElement?=} target
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
