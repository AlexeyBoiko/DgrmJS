import { pathCreate } from './svg-path/svg-path-factory.js';
import { SvgShape } from './svg-shape/svg-shape.js';

/** @implements {IPresenter} */
export class SvgPresenter extends EventTarget {
	/**
	 * @param {SVGSVGElement} svg
	 * @param {ISvgPresenterShapeFuctory} shapeFuctory
	 * */
	constructor(svg, shapeFuctory) {
		super();

		/** @private */
		this._shapeFuctory = shapeFuctory;

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
		this._canvasSvgEl = svg.querySelector('[data-key="canvas"]');
		this._svgElemToPresenterObj.set(this._canvasSvgEl, new SvgShape({ svgEl: this._canvasSvgEl, type: 'canvas' }));
	}

	/**
	 * @param {PresenterChildAddType} type
	 * @param {PresenterShapeAppendParam | PresenterPathAppendParam} param
	 * @returns {IPresenterElement}
	 */
	append(type, param) {
		switch (type) {
			case 'shape': {
				const shape = this._shapeFuctory({
					svgCanvas: this._canvasSvgEl,
					svgElemToPresenterObj: this._svgElemToPresenterObj,
					listener: this,
					createParams: /** @type {PresenterShapeAppendParam} */(param)
				});
				return shape;
			}
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
	 * @param {PresenterEventType} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @returns {this}
	 */
	on(type, listener) {
		this.addEventListener(type, listener);
		return this;
	}

	/**
	 * @param {PointerEvent & { currentTarget: SVGGraphicsElement, target: SVGGraphicsElement }} evt
	 */
	handleEvent(evt) {
		evt.stopPropagation();
		switch (evt.type) {
			case 'pointermove': {
				this._dispatchEnterLeave(evt);
				this._dispatchEvent(evt, 'pointermove', null);
				break;
			}
			case 'pointerdown':
				this._dispatchEvent(
					evt,
					evt.type,
					evt.target.hasAttribute('data-no-click')
						? /** @type {SVGGraphicsElement} */(document.elementsFromPoint(evt.clientX, evt.clientY)[1])
						: evt.currentTarget);
				break;
			case 'pointerup': {
				const elems = document.elementsFromPoint(evt.clientX, evt.clientY);
				this._dispatchEvent(
					evt,
					evt.type,
					/** @type {SVGGraphicsElement} */(elems[0].hasAttribute('data-no-click') ? elems[1] : elems[0]));
				break;
			}
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
			this._dispatchEvent(evt, 'pointerleave', this._pointElem);
		}

		if (pointElem) {
			this._dispatchEvent(evt, 'pointerenter', pointElem);
		}

		/**
		 * @type {SVGGraphicsElement}
		 * @private
		 */
		this._pointElem = pointElem;
	}

	/**
	 * @param {PointerEvent & { currentTarget: SVGGraphicsElement }} parentEvt DOM event that trigger dispatching
	 * @param {PresenterEventType} type
	 * @param {SVGGraphicsElement} target
	 * @private
	 */
	_dispatchEvent(parentEvt, type, target) {
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
				clientX: parentEvt.clientX,
				clientY: parentEvt.clientY
			}
		}));
	}
}
