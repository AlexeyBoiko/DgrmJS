/**
 * Base decorator for editable elements
 * - call 'onEdit' when element enter in edit mode - on second click on a shape
 * - call 'onEditLeave' when element leave edit mode
 * - inheritors must override 'onEdit', 'onEditLeave' methods
 */
export class SvgElementEditableAbstract {
	/**
	 * @param {IPresenterStatable & ISvgPresenterElement} svgElement
	 */
	constructor(svgElement) {
		this.svgElement = svgElement;
		this.type = svgElement.type;
		this.svgEl = this.svgElement.svgEl;

		this.svgElement.svgEl.addEventListener('pointerdown', this);
		this.svgElement.svgEl.addEventListener('pointerup', this);
		this.svgElement.svgEl.addEventListener('click', this);
	}

	/**
	 * @param {{ state?: Set<DiagramShapeState> }} param
	 */
	update(param) {
		if (param.state && this._isEditState) {
			this._isEditState = false;
			this._isSelectedOnDown = false;
			this.onEditLeave();
		}

		this.svgElement.update(param);
	}

	dispose() {
		if (this._isEditState) { this.onEditLeave(); }
	}

	/**
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		if (evt.target.hasAttribute('data-evt-no-click') ||
			document.elementFromPoint(evt.clientX, evt.clientY) !== evt.target) { return; }

		if (evt.type === 'click') {
			this.onClick(evt, this._isEditState);
			return;
		}

		if (this._isEditState) { return; }

		switch (evt.type) {
			case 'pointerdown':
				/** @private */
				this._isSelectedOnDown = this.svgElement.stateGet().has('selected');
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

/**
 * Base decorator for editable shapes
 * - call 'onEdit' when shape enter in edit mode - on second click on a shape
 * - call 'onEditLeave' when shape leave edit mode
 * - inheritors must override 'onEdit', 'onEditLeave' methods
 * @implements {IPresenterShape}
 */
export class SvgShapeEditableAbstractDecorator extends SvgElementEditableAbstract {
	/**
	 * @param {ISvgPresenterShape} svgShape
	 */
	constructor(svgShape) {
		super(svgShape);

		// ISvgPresenterShape
		this.connectable = /** @type {ISvgPresenterShape} */(this.svgElement).connectable;
		this.defaultInConnector = /** @type {ISvgPresenterShape} */(this.svgElement).defaultInConnector;
		this.connectors = /** @type {ISvgPresenterShape} */(this.svgElement).connectors;
	}

	/**
	 * @param {DiagramShapeState} state
	 */
	stateHas(state) { return this.svgElement.stateHas(state); }
	stateGet() { return this.svgElement.stateGet(); }
	positionGet() { return /** @type {ISvgPresenterShape} */(this.svgElement).positionGet(); }

	/**
	 * @param {DiagramShapeUpdateParam} param
	 */
	update(param) {
		if (param.state && this._isEditState) {
			this._isEditState = false;
			this.onEditLeave();
		}

		super.update(param);
	}
}
