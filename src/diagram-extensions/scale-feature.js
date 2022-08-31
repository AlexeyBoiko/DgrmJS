import { ensureTransform, svgPositionGet, svgPositionSet } from '../diagram/infrastructure/svg-utils.js';

/** @param {SVGSVGElement} svg */
export function scaleFeature(svg) {
	const scaleStep = 0.5;

	/** @type {SVGGElement} */
	const canvasSvgEl = svg.querySelector('[data-key="canvas"]');

	let scale = 1;
	svg.addEventListener('wheel', /** @param {WheelEvent} evt */ evt => {
		const nextScale = scale + (evt.deltaY < 0 ? scaleStep : -scaleStep);
		if (Math.abs(nextScale) < scaleStep) { return; }

		const canvasPosition = svgPositionGet(canvasSvgEl);

		svgPositionSet(canvasSvgEl, {
			x: nextScale / scale * (canvasPosition.x - evt.clientX) + evt.clientX,
			y: nextScale / scale * (canvasPosition.y - evt.clientY) + evt.clientY
		});

		ensureTransform(canvasSvgEl, SVGTransform.SVG_TRANSFORM_SCALE)
			.setScale(nextScale, nextScale);

		scale = nextScale;
	});
}
