import { SvgFigure } from './svg-figure.js';
import { svgPositionSet } from './svg-utils.js';

/** @implements {IPresenter} */
export class SvgPresenter extends EventTarget {
	/** @param {SVGSVGElement} svg */
	constructor(svg) {
		super();

		/** private */
		this._svg = svg;
		this._svg.addEventListener('pointermove', this);
		this._svg.addEventListener('pointerdown', this);
		this._svg.addEventListener('pointerup', this);

		/**
		 * @type {SVGGElement}
		 * @private
		 */
		this._canvasSvgGElem = svg.querySelector('[data-name="canvas"]');
		svgPositionSet(this._canvasSvgGElem, { x: 0, y: 0 });
	}

	/**
	 * @template {IPresenterElement} TElem
	 * @param {PresenterElementType} type
	 * @param {PresenterFigureAppendParam | PresenterPathAppendParams} param
	 * @returns {TElem}
	 */
	appendChild(type, param) {
		throw new Error('Method not implemented.');
	}

	/**
	 * @param {string} query
	 * @returns {IPresenterFigure | null}
	 */
	querySelector(query) {
		/** @type {SVGGraphicsElement} */
		const elem = this._svg.querySelector(query);
		if (!elem) { return null; }
		return this._elementEnsure(elem);
	}

	/**
	 * @param {PresenterEventType} type
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(type, listener) {
		return this;
	}

	/**
	 * @param {PointerEvent & { currentTarget: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		evt.stopPropagation();
		switch (evt.type) {
			case 'pointermove': {
				this._dispatchEnterLeave(evt);
				this._dispatchEvent('pointermove', null, evt.offsetX, evt.offsetY);
				break;
			}
			case 'pointerdown':
			case 'pointerup':
				this._dispatchEvent(
					evt.type,
					this._elementEnsure(evt.currentTarget),
					evt.offsetX,
					evt.offsetY);
				break;
		}
	}

	/**
	 * @param {PointerEvent & { currentTarget: SVGGraphicsElement }} evt
	 */
	_dispatchEnterLeave(evt) {
		const pointElem = /** @type {SVGGraphicsElement} */(document.elementFromPoint(evt.clientX, evt.clientY));
		if (pointElem === this._pointElem) {
			return;
		}

		if (this._pointElem) {
			this._dispatchEvent('pointerleave', this._elementEnsure(this._pointElem));
		}
		this._dispatchEvent('pointerenter', this._elementEnsure(pointElem));

		/**
		 * @type {SVGGraphicsElement}
		 * @private
		 */
		this._pointElem = pointElem;
	}

	/**
	 * @param {SVGGraphicsElement} svgEl
	 * @returns {IPresenterFigure}
	 * @private
	 */
	_elementEnsure(svgEl) {
		/** @type {IPresenterFigure} */
		let shape;
		/** @type {PresenterElementType} */
		let type;
		let additionalData;
		if (svgEl === this._svg) {
			type = 'canvas';
		} else if (svgEl.getAttribute('data-templ') === 'connect-end') {
			type = 'connectorEnd';
			shape = this._elementEnsure(svgEl.parentElement.closest('[data-templ]'));
		} else if (svgEl.getAttribute('data-templ')) {
			type = 'shape';
		} else if (svgEl.getAttribute('data-connect')) {
			type = 'connectorIn';
			shape = this._elementEnsure(svgEl.closest('[data-templ]'));

			const point = svgEl.getAttribute('data-connect-point').split(',');
			/** @type {IPresenterConnectorData} */
			additionalData = {
				innerPosition: { x: parseFloat(point[0]), y: parseFloat(point[1]) },
				dir: svgEl.getAttribute('data-connect-dir')
			};
		} else if (svgEl.getAttribute('data-connect-connected')) {
			type = 'connectorInConnected';
			shape = this._elementEnsure(svgEl.closest('[data-templ]'));
		}

		return Object.assign(new SvgFigure({
			svgEl: svgEl,
			type: type,
			shape: shape
		}), additionalData);
	}

	_ensure2(svgEl) {

	}

	/**
	 * @param {PresenterEventType} type
	 * @param {IPresenterFigure=} target
	 * @param {number=} offsetX
	 * @param {number=} offsetY
	 * @private
	 */
	_dispatchEvent(type, target, offsetX, offsetY) {
		this.dispatchEvent(new CustomEvent(type, {
			cancelable: true,
			/** @type {IPresenterEventDetail} */
			detail: {
				target: target,
				offsetX: offsetX,
				offsetY: offsetY
			}
		}));
	}
}
