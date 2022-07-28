import { first } from '../infrastructure/iterable-utils.js';
import { SvgShape } from './svg-shape/svg-shape.js';

/** @implements {IPresenter} */
export class SvgPresenter extends EventTarget {
	/**
	 * @param {SVGSVGElement} svg
	 * @param {ISvgPresenterShapeFactory} shapeFactory
	 * */
	constructor(svg, shapeFactory) {
		super();

		/** @private */
		this._shapeFactory = shapeFactory;

		/** @private */
		this._svg = svg;
		this._svg.addEventListener('pointermove', this);
		this._svg.addEventListener('pointerdown', this);
		this._svg.addEventListener('pointerup', this);
		this._svg.addEventListener('pointerleave', this);

		/**
		 * store presenter objects
		 * @type {WeakMap<SVGGraphicsElement, IDiagramElement>}
		 * @private
		 */
		this._svgElemToPresenterObj = new WeakMap();

		/**
		 * @type {SVGGElement}
		 * @private
		 */
		this._canvasSvgEl = svg.querySelector('[data-key="canvas"]');

		/** @type {IPresenterShape} */
		this.canvas = new SvgShape({ svgEl: this._canvasSvgEl, type: 'canvas' });
		this._svgElemToPresenterObj.set(this._canvasSvgEl, this.canvas);
	}

	/**
	 * @param {DiagramChildAddType} type
	 * @param {DiagramShapeAddParam | PresenterPathAppendParam} param
	 * @returns {IPresenterShape | IPresenterPath}
	 */
	append(type, param) {
		return this._shapeFactory(
			type,
			{
				svgCanvas: this._canvasSvgEl,
				svgElemToPresenterObj: this._svgElemToPresenterObj,
				createParams: param
			});
	}

	/**
	 * @param {ISvgPresenterElement} elem
	 */
	delete(elem) {
		if (elem.dispose) { elem.dispose(); }
		this._svgElemToPresenterObj.delete(elem.svgEl);

		if (elem.type === 'shape') {
			for (const connector of /** @type {ISvgPresenterShape} */(elem).connectors) {
				this._svgElemToPresenterObj.delete(connector[1].svgEl);
			}
			if (/** @type {ISvgPresenterShape} */(elem).defaultInConnector) {
				this._svgElemToPresenterObj.delete(/** @type {ISvgPresenterShape} */(elem).defaultInConnector.svgEl);
			}
		}

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
		switch (evt.type) {
			case 'pointermove':
				if (evt.movementX !== 0 || evt.movementY !== 0) { // fix android fire 'pointermove' on 'poinerdown'
					this._dispatchEnterLeave(evt);
					this._dispatchEvent(evt, 'pointermove', null);
				}
				break;
			case 'pointerdown':
			case 'pointerup':
				this._dispatchEvent(
					evt,
					evt.type,
					SvgPresenter._getPointElem(evt, true));
				break;
			case 'pointerleave':
				this.dispatchEvent(new CustomEvent('canvasleave'));
		}
	}

	/**
	 * @param {PointerEvent & { currentTarget: SVGGraphicsElement }} evt
	 */
	_dispatchEnterLeave(evt) {
		const pointElem = SvgPresenter._getPointElem(evt, false);
		if (pointElem === this._pointElem) {
			return;
		}

		// currently don't used
		// if (this._pointElem) {
		// 	this._dispatchEvent(evt, 'pointerleave', this._pointElem);
		// }

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
	 * @private
	 * @param {PointerEvent} evt
	 * @param {Boolean} considerNoClickAttr
	 * @return {SVGGraphicsElement}
	 */
	static _getPointElem(evt, considerNoClickAttr) {
		const elems = document.elementsFromPoint(evt.clientX, evt.clientY);
		if (considerNoClickAttr) {
			return /** @type {SVGGraphicsElement} */(
				first(elems, el => el.hasAttribute('data-evt-z-index') && !el.hasAttribute('data-evt-no-click')) ??
				(elems[0].hasAttribute('data-evt-no-click')
					? elems[1]
					: elems[0])
			);
		}

		return /** @type {SVGGraphicsElement} */(
			first(elems, el => el.hasAttribute('data-evt-z-index')) ?? elems[0]
		);
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
