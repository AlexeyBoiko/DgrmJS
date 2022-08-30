import { ensureTransform, svgPositionGet, svgPositionSet } from '../diagram/infrastructure/svg-utils.js';

export class ScaleFeature {
	/**
	 * @param {SVGSVGElement} svg
	 */
	constructor(svg) {
		/**
		 * @type {SVGGElement}
		 * @private
		 */
		this._canvasSvgEl = svg.querySelector('[data-key="canvas"]');

		/** @private */
		this._scale = 1;

		svg.addEventListener('wheel', this);
	}

	/**
	 * @param {WheelEvent} evt
	 */
	handleEvent(evt) {
		const nextScale = this._scale + (evt.deltaY < 0 ? 0.5 : -0.5);
		if (nextScale <= 0) { return; }

		const canvasPosition = svgPositionGet(this._canvasSvgEl);
		const svgRect = this._canvasSvgEl.ownerSVGElement.getBoundingClientRect();
		console.log(canvasPosition.x, (svgRect.width * nextScale - svgRect.width) / 2);
		svgPositionSet(this._canvasSvgEl, {
			x: canvasPosition.x - (svgRect.width * nextScale - svgRect.width * this._scale) / 2,
			y: canvasPosition.y - (svgRect.height * nextScale - svgRect.height * this._scale) / 2
		});

		ensureTransform(this._canvasSvgEl, SVGTransform.SVG_TRANSFORM_SCALE)
			.setScale(nextScale, nextScale);

		this._scale = nextScale;
	}
}
