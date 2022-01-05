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
	 * @param {PresenterElementType} type
	 * @param {PresenterFigureAppendParam} param
	 * @returns {IPresenterFigure}
	 */
	shapeAdd(type, param) {
		return this._presenter.appendChild(type, param);
	}

	/**
	 * @param {DiagramShapeUpdateParam} param
	 * @returns {IPresenterFigure}
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
					this._connectorManager.updatePosition(this._movedShape);
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
						this._connectorManager.add(evt.targetElem, connectorEnd);
						this._movedSet(connectorEnd, { x: evt.offsetX, y: evt.offsetY });
						break;
					}
					case 'connectorInConnected': {
						//
						// disconnect

						const connectorIn = /** @type {IBuilderConnectorInElement} */(evt.targetElem).relatedConnectorInElement;
						const connectorEnd = this._connectorEndCreate(connectorIn);
						this._connectorManager.replaceEnd(connectorIn, connectorEnd);
						this._movedSet(connectorEnd, { x: evt.offsetX, y: evt.offsetY });

						if (this._connectorManager.count(connectorIn, 'end') === 1) {
							// can't delete here becouse of mobile
							evt.targetElem.hide();
							this._toDel = evt.targetElem;
						}
						break;
					}
				}
				break;
			case 'pointerup': {
				if (this._movedShape?.type === 'connectorEnd') {
					//
					// connect connector

					switch (evt.targetElem.type) {
						case 'connectorIn': {
							this._connectorManager.replaceEnd(this._movedShape, evt.targetElem);
							this.shapeDel(this._movedShape);

							// add connectorEnd to shape
							/** @type {IBuilderConnectorInElement} */
							const connectorInConnected = evt.targetElem.shape.appendChild(
								'connectorInConnected',
								{
									templateKey: 'connect-end',
									position: /** @type {IPresenterConnectorInElement} */(evt.targetElem).innerPosition,
									rotateAngle: DiagramBuilder._rotateAngle(/** @type {IPresenterConnectorInElement} */(evt.targetElem).dir)
								});
							connectorInConnected.relatedConnectorInElement = /** @type {IPresenterConnectorInElement} */(evt.targetElem);
							break;
						}
						case 'connectorInConnected':
							this._connectorManager.replaceEnd(this._movedShape, /** @type {IBuilderConnectorInElement} */(evt.targetElem).relatedConnectorInElement);
							this.shapeDel(this._movedShape);
							break;
					}
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
	 * @param {IPresenterFigure} shape
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
			 * @type {IPresenterFigure}
			 * @privte
			 */
			this._selectedShape = shape;
		}
	}

	/**
	 * @param {IPresenterFigure} shape
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
	 * @returns {IPresenterFigure}
	 */
	_connectorEndCreate(connectorIn) {
		const shapePosition = connectorIn.shape.postionGet();
		const innerPosition = connectorIn.innerPosition;
		return this.shapeAdd(
			'connectorEnd',
			{
				templateKey: 'connect-end',
				position: {
					x: shapePosition.x + innerPosition.x,
					y: shapePosition.y + innerPosition.y
				},
				rotateAngle: DiagramBuilder._rotateAngle(connectorIn.dir),
				props: { root: { dir: connectorIn.dir } }
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
