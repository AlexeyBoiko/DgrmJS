/**
 * Base decorator for editable shapes
 * - call 'onEdit' when shape enter in edit mode - on second click on a shape
 * - call 'onEditLeave' when shape leave edit mode
 * - inheritors must override 'onEdit', 'onEditLeave' methods
 * @implements {ISvgPresenterShape}
 */
export class SvgShapeEditableAbstractDecorator {
	/**
	 * @param {ISvgPresenterShape} svgShape
	 */
	constructor(svgShape) {
		/**
		 * @type {ISvgPresenterShape}
		 * @private
		 */
		this._svgShape = svgShape;

		this._svgShape.svgEl.addEventListener('pointerdown', this);
		this._svgShape.svgEl.addEventListener('pointerup', this);
		this._svgShape.svgEl.addEventListener('click', this);

		// ISvgPresenterShape
		this.svgEl = this._svgShape.svgEl;
		this.type = this._svgShape.type;
		this.connectable = this._svgShape.connectable;
		this.defaultInConnector = this._svgShape.defaultInConnector;
		this.connectors = this._svgShape.connectors;
	}

	/**
	 * @param {PresenterShapeState} state
	 */
	stateHas(state) { return this._svgShape.stateHas(state); }
	stateGet() { return this._svgShape.stateGet(); }
	positionGet() { return this._svgShape.positionGet(); }

	/**
	 * @param {PresenterShapeUpdateParam} param
	 */
	update(param) {
		if (param.state && this._isEditState) {
			this._isEditState = false;
			this.onEditLeave();
		}

		this._svgShape.update(param);
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		if (evt.target.hasAttribute('data-no-click') ||
			document.elementFromPoint(evt.clientX, evt.clientY) !== evt.target) { return; }

		if (evt.type === 'click') {
			this.onClick(evt, this._isEditState);
			return;
		}

		if (this._isEditState) { return; }

		switch (evt.type) {
			case 'pointerdown':
				/** @private */
				this._isSelectedOnDown = this.stateGet().has('selected');
				break;
			case 'pointerup':
				if (this._isSelectedOnDown) {
					/** @private */
					this._isEditState = true;
					this.onEdit(evt);
				}
				break;
		}
	}

	/**
	 * when shape enter edit mode
	 * override this method
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	onEdit(evt) {}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {}

	/**
	 * click on shape
	 * override this method
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 * @param {boolean} isEditState
	 */
	onClick(evt, isEditState) {}
}
