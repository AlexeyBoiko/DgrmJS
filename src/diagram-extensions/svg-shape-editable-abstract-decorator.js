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
		if (param.position) {
			/** @private */
			this._firstClick = false;
		}

		if (param.state) {
			if (param.state.has('selected') && !this.stateGet().has('selected')) {
				this._firstClick = true;
			}

			if (this._isEditState) {
				this._isEditState = false;
				this.onEditLeave();
			}
		}

		this._svgShape.update(param);
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		if (evt.target.hasAttribute('data-no-click') ||
			document.elementFromPoint(evt.clientX, evt.clientY) !== evt.target) { return; }

		evt.stopPropagation();

		if (!this._firstClick && !this._isEditState) {
			/** @private */
			this._isEditState = true;
			this.onEdit(evt);
		}
		this._firstClick = false;

		this.onClick(evt, this._isEditState);
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
