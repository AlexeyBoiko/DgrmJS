// import { svgPositionSet } from '../infrastructure/svg-utils.js';
import { pathCreate } from './svg-path-fuctory.js';
import { shapeCreate } from './svg-shape-fuctory.js';
import { SvgShape } from './svg-shape.js';

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

		/** @type {SVGGElement}
		 * @private
		 */
		this._canvasSvgEl = svg.querySelector('[data-name="canvas"]');
		this._svgElemToPresenterObj.set(this._canvasSvgEl, new SvgShape({ svgEl: this._canvasSvgEl, type: 'canvas' }));
	}

	/**
	 * @param {PresenterChildAddType} type
	 * @param {PresenterShapeAppendParam | PresenterPathAppendParam} param
	 * @returns {IPresenterElement}
	 */
	append(type, param) {
		switch (type) {
			case 'shape':
				return shapeCreate({
					svgCanvas: this._canvasSvgEl,
					svgElemToPresenterObj: this._svgElemToPresenterObj,
					listener: this,
					createParams: /** @type {PresenterShapeAppendParam} */(param)
				});
			case 'path':
				return pathCreate({
					svgCanvas: this._canvasSvgEl,
					createParams: /** @type {PresenterPathAppendParam} */(param)
				});
		}
	}

	/**
	 * @param {ISvgPresenterElement} elem
	 */
	delete(elem) {
		this._svgElemToPresenterObj.delete(elem.svgEl);
		elem.svgEl.remove();
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
	 * @returns {IPresenter}
	 */
	on(type, listener) {
		this.addEventListener(type, listener);
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
				this._dispatchEvent(
					evt.type,
					evt.currentTarget,
					evt.offsetX,
					evt.offsetY);
				break;
			case 'pointerup':
				this._dispatchEvent(
					evt.type,
					/** @type {SVGGraphicsElement} */(document.elementFromPoint(evt.clientX, evt.clientY)),
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
			this._dispatchEvent('pointerleave', this._pointElem, evt.offsetX, evt.offsetY);
		}

		if (pointElem) {
			this._dispatchEvent('pointerenter', pointElem, evt.offsetX, evt.offsetY);
		}

		/**
		 * @type {SVGGraphicsElement}
		 * @private
		 */
		this._pointElem = pointElem;
	}

	/**
	 * @param {PresenterEventType} type
	 * @param {SVGGraphicsElement} target
	 * @param {number} offsetX
	 * @param {number} offsetY
	 * @private
	 */
	_dispatchEvent(type, target, offsetX, offsetY) {
		let targetPresenterObj = null;
		if (target) {
			targetPresenterObj = this._svgElemToPresenterObj.get((target === this._svg || target.ownerSVGElement !== this._svg)
				? this._canvasSvgEl
				: target);
			// TODO: refactor
			if (!targetPresenterObj) {
				targetPresenterObj = this._svgElemToPresenterObj.get(target.closest('[data-connect]'));
			}
			if (!targetPresenterObj) {
				targetPresenterObj = this._svgElemToPresenterObj.get(target.closest('[data-templ]'));
			}
		}

		this.dispatchEvent(new CustomEvent(type, {
			/** @type {IPresenterEventDetail} */
			detail: {
				target: targetPresenterObj,
				offsetX: offsetX,
				offsetY: offsetY
			}
		}));
	}
}
