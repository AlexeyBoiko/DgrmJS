import { svgScale } from '../infrastructure/svg-utils.js';

export const scaleSymbol = Symbol(0);
/** @typedef { IDiagram & {[scaleSymbol]?: number } } DiagramScalable */

/**
 * @param {DiagramScalable} diagram
 * @param {SVGSVGElement} svg
 */
export function scaleFeature(diagram, svg) {
	const scaleStep = 0.25;
	diagram[scaleSymbol] = 1;

	/** @type {SVGGElement} */
	const canvasSvgEl = svg.querySelector('[data-key="canvas"]');

	svg.addEventListener('wheel', /** @param {WheelEvent} evt */ evt => {
		diagram.selected = null;

		const nextScale = diagram[scaleSymbol] + (evt.deltaY < 0 ? scaleStep : -scaleStep);
		if (nextScale < scaleStep || nextScale > 4) { return; }

		svgScale(
			// svgEl
			canvasSvgEl,
			// fixedPoint
			{ x: evt.clientX, y: evt.clientY },
			// scale
			diagram[scaleSymbol],
			// nextScale
			nextScale);

		diagram[scaleSymbol] = nextScale;
	});
}
