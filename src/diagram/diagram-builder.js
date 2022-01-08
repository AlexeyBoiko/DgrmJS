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
					case 'connectorEnd':
						this._movedSet(evt.detail.target, { x: evt.detail.offsetX, y: evt.detail.offsetY });
						break;
					case 'connectorOut': {
						//
						// connectorEnd create

						const connectorEnd = this._connectorEndCreate(/** @type {IPresenterConnectorElement} */(evt.detail.target));
						this._connectorManager.add(evt.detail.target, connectorEnd);
						this._movedSet(connectorEnd, { x: evt.detail.offsetX, y: evt.detail.offsetY });
						break;
					}
					case 'connectorInConnected': {
						//
						// disconnect

						const connectorIn = /** @type {IBuilderConnectorElement} */(evt.detail.target).relatedConnectorInElement;
						const connectorEnd = this._connectorEndCreate(connectorIn);
						this._connectorManager.replaceEnd(connectorIn, connectorEnd);
						this._movedSet(connectorEnd, { x: evt.detail.offsetX, y: evt.detail.offsetY });

						if (this._connectorManager.count(connectorIn, 'end') === 1) {
							// can't delete here becouse of mobile
							evt.detail.target.hide();
							this._toDel = evt.detail.target;
						}
						break;
					}
				}
				break;
			case 'pointerup': {
				if (this._movedShape && this._movedShape.type === 'connectorEnd') {
					//
					// connect connector

					switch (evt.detail.target.type) {
						case 'connectorIn': {
							this._connectorManager.replaceEnd(this._movedShape, evt.detail.target);
							this.shapeDel(this._movedShape);

							// add connectorEnd to shape
							/** @type {IBuilderConnectorElement} */
							const connectorInConnected = evt.detail.target.shape.appendChild(
								'connectorInConnected',
								{
									templateKey: 'connect-end',
									position: /** @type {IPresenterConnectorElement} */(evt.detail.target).innerPosition,
									rotateAngle: DiagramBuilder._rotateAngle(/** @type {IPresenterConnectorElement} */(evt.detail.target).dir)
								});
							connectorInConnected.relatedConnectorInElement = /** @type {IPresenterConnectorElement} */(evt.detail.target);
							break;
						}
						case 'connectorInConnected':
							this._connectorManager.replaceEnd(this._movedShape, /** @type {IBuilderConnectorElement} */(evt.detail.target).relatedConnectorInElement);
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
	 * @param {IPresenterConnectorElement} connectorIn
	 * @returns {IPresenterFigure}
	 * @private
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
	 * @param {PresenterPathEndDirection} dir
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
