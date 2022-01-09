import { svgPositionSet } from '../infrastructure/svg-utils.js';
import { pathCreate } from './svg-path-fuctory.js';
import { shapeCreate } from './svg-shape-fuctory.js';

/** @implements {IPresenter} */
export class SvgPresenter extends EventTarget {
	/** @param {SVGSVGElement} svg */
	constructor(svg) {
		super();

		/** @private */
		this._svg = svg;
		this._svg.addEventListener('pointermove', this);
		this._svg.addEventListener('pointerdown', this);
		this._svg.addEventListener('pointerup', this);

		/**
		 * store presenter objects
		 * @type {WeakMap<SVGGraphicsElement, IPresenterElement>}
		 * @private
		 */
		this._svgElemToPresenterObj = new WeakMap();

		/**
		 * @type {SVGGElement}
		 * @private
		 */
		this._canvasSvgGElem = svg.querySelector('[data-name="canvas"]');
		svgPositionSet(this._canvasSvgGElem, { x: 0, y: 0 });
	}

	/**
	 * @param {PresenterChildAddType} type
	 * @param {PresenterShapeAppendParam | PresenterPathAppendParams} param
	 * @returns {IPresenterElement}
	 */
	appendChild(type, param) {
		switch (type) {
			case 'shape':
				return shapeCreate({
					svg: this._svg,
					svgElemToPresenterObj: this._svgElemToPresenterObj,
					listener: this,
					createParams: /** @type {PresenterShapeAppendParam} */(param)
				});
			case 'path':
				return pathCreate({
					svg: this._svg,
					createParams: /** @type {PresenterPathAppendParams} */(param)
				});
		}
	}

	/**
	 * @template {IPresenterElement} T
	 * @param {string} query
	 * @returns {T | null}
	 */
	querySelector(query) {
		/** @type {SVGGraphicsElement} */
		const elem = this._svg.querySelector(query);
		if (!elem) { return null; }
		return /** @type {T} */(this._svgElemToPresenterObj.get(elem));
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
					evt.currentTarget,
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
			this._dispatchEvent('pointerleave', this._pointElem);
		}
		this._dispatchEvent('pointerenter', pointElem);

		/**
		 * @type {SVGGraphicsElement}
		 * @private
		 */
		this._pointElem = pointElem;
	}

	/**
	 * @param {PresenterEventType} type
	 * @param {SVGGraphicsElement=} target
	 * @param {number=} offsetX
	 * @param {number=} offsetY
	 * @private
	 */
	_dispatchEvent(type, target, offsetX, offsetY) {
		this.dispatchEvent(new CustomEvent(type, {
			cancelable: true,
			/** @type {IPresenterEventDetail} */
			detail: {
				target: target ? this._svgElemToPresenterObj.get(target) : null,
				offsetX: offsetX,
				offsetY: offsetY
			}
		}));
	}
}
