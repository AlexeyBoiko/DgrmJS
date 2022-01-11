/**
 * SVG diagram builder
 * @module svgDiagramBuilder
 */

export class DiagramBuilder extends EventTarget {
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
			.on('pointerup', this);

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
	 * @param {PresenterShapeAppendParam | PresenterPathAppendParams} param
	 * @returns {IPresenterElement}
	 */
	shapeAdd(type, param) {
		return this._presenter.appendChild(type, param);
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
			case 'pointermove': {
				if (this._movedShape) {
					const shapePosition = {
						x: this._movedDelta.x + evt.detail.offsetX,
						y: this._movedDelta.y + evt.detail.offsetY
					};

					this._movedShape.update({ position: shapePosition });
					this._connectorManager.updatePosition(this._movedShape);
				}
				break;
			}
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
			case 'pointerup': {
				if (evt.detail.target && evt.detail.target.type === 'connector') {
					this._onConnectorUp(/** @type { CustomEvent<IPresenterEventDetail & { target: IPresenterConnector }>} */(evt));
				}
				this._movedClean();
				break;
			}
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

				const connectorEnd = this._connectorEndCreate(evt.detail.target);
				this._connectorManager.add(evt.detail.target, connectorEnd.defaultInConnector);
				this._movedSet(connectorEnd, { x: evt.detail.offsetX, y: evt.detail.offsetY });
				break;
			}
			case 'in': {
				if (evt.detail.target.connectedGet()) {
					//
					// disconnect

					const connectorEnd = this._connectorEndCreate(evt.detail.target);
					this._connectorManager.replaceEnd(evt.detail.target, connectorEnd.defaultInConnector);
					this._movedSet(connectorEnd, { x: evt.detail.offsetX, y: evt.detail.offsetY });

					if (this._connectorManager.any(evt.detail.target, 'end')) {
						evt.detail.target.connectedSet(false);
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
		evt.detail.target.connectedSet(true);
	}

	/**
	 * @param {IPresenterShape} shape
	 * @private
	 */
	_selectedSet(shape) {
		if (shape !== this._selectedShape) {
			// this._svg.dispatchEvent(new CustomEvent('select', {
			// 	cancelable: true,
			// 	detail: { shape: shape }
			// }));

			if (this._selectedShape) {
				this._selectedShape.select(false);
			}

			if (shape) {
				shape.select(true);
			}

			/**
			 * @type {IPresenterShape}
			 * @privte
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
		this._movedShape = shape;

		const shapePosition = this._movedShape.postionGet();
		this._movedDelta = {
			x: shapePosition.x - offsetPoint.x,
			y: shapePosition.y - offsetPoint.y
		};

		this._selectedSet(this._movedShape);
	}

	/** @private */
	_movedClean() {
		/** @private */
		this._movedDelta = null;
		/** @private */
		this._movedShape = null;
	}

	/**
	 * @param {IPresenterConnector} connectorIn
	 * @returns {IPresenterShape}
	 * @private
	 */
	_connectorEndCreate(connectorIn) {
		const shapePosition = connectorIn.shape.postionGet();
		const innerPosition = connectorIn.innerPosition;
		return /** @type {IPresenterShape} */(this.shapeAdd(
			'shape',
			{
				templateKey: 'connect-end',
				position: {
					x: shapePosition.x + innerPosition.x,
					y: shapePosition.y + innerPosition.y
				},
				rotate: DiagramBuilder._rotateAngle(connectorIn.dir)
			}));
	}

	/**
	 * @param {PresenterPathEndDirection} dir
	 * @returns {number}
	 * @private
	 */
	static _rotateAngle(dir) {
		return dir === 'right'
			? 0
			: dir === 'left'
				? 180
				: dir === 'bottom'
					? 90
					: 270;
	}
}
