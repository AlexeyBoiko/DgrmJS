/**
 * SVG diagram builder
 * @module svgDiagramBuilder
 */

/** @typedef {{shape: IPresenterElement, connectorElem: IPresenterElement}} ShapeConnectPoint */

export class DiagramBuilder extends EventTarget {
	/**
	 * @param {IPresenter} pesenter
	 * @param {IConnectorManager} connectorManager
	 */
	constructor(pesenter, connectorManager) {
		super();
		this._presenter = pesenter
			.on('pointermove', this)
			.on('pointerdown', this)
			.on('pointerup', this);

		this._connectorManager = connectorManager;

		/** @private */
		this._elData = new WeakMap();
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
	 * @param {PresenterElementAppendParam} param
	 * @returns {IPresenterElement}
	 */
	shapeAdd(param) {
		return this._presenter.appendChild(param);
	}

	/**
	 * @param {DiagramShapeUpdateParam} param
	 * @returns {IPresenterElement}
	 */
	shapeUpdate(param) {
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
		(param.shape
			? param.shape
			: this._presenter.querySelector(param.selector)).delete();
	}

	/** @param {PresenterEvent} evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'pointermove': {
				if (this._movedShape) {
					const shapePosition = {
						x: this._movedDelta.x + evt.offsetX,
						y: this._movedDelta.y + evt.offsetY
					};

					this._movedShape.update({ position: shapePosition });
					this._connectorManager.connectorsUpdatePosition(this._movedShape);
				}
				break;
			}
			case 'pointerdown':
				switch (evt.targetElem.type) {
					case 'canvas':
					case 'shape':
					case 'connectorEnd':
						this._movedSet(evt.targetElem, { x: evt.offsetX, y: evt.offsetY });
						break;
					case 'connectorIn': {
						//
						// connectorEnd create

						const connectorEnd = this._connectorEndCreate(/** @type {IPresenterConnectorInElement} */(evt.targetElem));
						this._connectorManager.connectorAdd(evt.targetElem, connectorEnd);
						this._movedSet(connectorEnd, { x: evt.offsetX, y: evt.offsetY });
						break;
					}
					case 'connectorInConnected': {
						//
						// disconnect

						/** @type {IPresenterConnectorInElement} */
						const connectorIn = this._elData.get(evt.targetElem);
						const connectorEnd = this._connectorEndCreate(connectorIn);
						this._connectorManager.connectorReplaceElem(connectorIn, connectorEnd);
						this._movedSet(connectorEnd, { x: evt.offsetX, y: evt.offsetY });

						if (this._connectorManager.connectorCount(connectorIn) === 1) {
							// can't delete here becouse of mobile
							evt.targetElem.hide();
							this._toDel = evt.targetElem;
						}
						break;
					}
				}
				break;
			case 'pointerup': {
				if (this._movedShape?.type === 'connectorEnd' &&
					(evt.targetElem.type === 'connectorIn' || evt.targetElem.type === 'connectorInConnected')) {
					//
					// connect connector

					/** @type {IPresenterConnectorInElement} */
					const connectorIn = evt.targetElem.type === 'connectorIn'
						? evt.targetElem
						: this._elData.get(evt.targetElem);

					this._connectorManager.connectorReplaceElem(this._movedShape, connectorIn);

					// add connectorEnd to shape
					if (this._connectorManager.connectorCount(connectorIn) === 1) {
						this._elData.set(
							evt.targetElem.shape.appendChild({
								type: 'connectorInConnected',
								templateKey: 'connect-end',
								position: connectorIn.innerPosition,
								rotateAngle: DiagramBuilder._rotateAngle(connectorIn.dir)
							}),
							connectorIn);
					}

					this.shapeDel(this._movedShape);
				}

				this._movedClean();
				if (this._toDel) {
					this._toDel.delete();
					this._toDel = null;
				}
				break;
			}
		}
	}

	/**
	 * @param {IPresenterElement} shape
	 * @private
	 */
	_selectedSet(shape) {
		if (shape !== this._selectedShape) {
			// this._svg.dispatchEvent(new CustomEvent('select', {
			// 	cancelable: true,
			// 	detail: { shape: shape }
			// }));

			if (this._selectedShape) {
				shape.unSelect();
			}

			if (shape) {
				shape.select();
			}

			/**
			 * @type {IPresenterElement}
			 * @privte
			 */
			this._selectedShape = shape;
		}
	}

	/**
	 * @param {IPresenterElement} shape
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
	 * @param {IPresenterConnectorInElement} connectorIn
	 * @returns {IPresenterElement}
	 */
	_connectorEndCreate(connectorIn) {
		const shapePosition = connectorIn.shape.postionGet();
		const innerPosition = connectorIn.innerPosition;
		return this.shapeAdd({
			type: 'connectorEnd',
			templateKey: 'connect-end',
			position: {
				x: shapePosition.x + innerPosition.x,
				y: shapePosition.y + innerPosition.y
			},
			rotateAngle: DiagramBuilder._rotateAngle(connectorIn.dir)
		});
	}

	/**
	 * @param {PresenterPathEntDirection} dir
	 * @returns {number}
	 * @private
	 */
	static _rotateAngle(dir) {
		return dir === 'left'
			? 0
			: dir === 'right'
				? 180
				: dir === 'top'
					? 90
					: 270;
	}
}
