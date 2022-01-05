/** @implements {IPresenter} */
export class SvgPresenter {
	/** @param {SVGSVGElement} svg */
	constructor(svg) {
		/** private */
		this._svg = svg;
		this._svg.addEventListener('pointermove', this);
		this._svg.addEventListener('pointerdown', this);
		this._svg.addEventListener('pointerup', this);
	}

	/**
	 * @param {PresenterEventType} type
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(type, listener) {
		return this;
	}

	/**
	 * @param {any} el
	 * @param {Point} position
	 */
	positionSet(el, position) {
		// TODO
	}

	/**
	 * @param {PointerEvent & { currentTarget: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		evt.stopPropagation();
		switch (evt.type) {
			case 'pointermove': {
				break;
			}
			case 'pointerdown': {
				break;
			}
			case 'pointerup': {
				break;
			}
		}
	}

	/**
	 * @param {PresenterEventType} type
	 * @private 
	 */
	_dispatchEvent(type, ) {
		this._svg.dispatchEvent(new CustomEvent(type, {
			cancelable: true,
			detail: { shape: shape }
		}));
	}
}

