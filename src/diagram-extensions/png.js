import { svgPositionGet, svgPositionSet, svgScale } from '../diagram/infrastructure/svg-utils.js';
import { svgToPng } from './infrastructure/svg-to-png-utils.js';
import { pngChunkGet, pngChunkSet } from './infrastructure/png-chunk-utils.js';
import { first } from '../diagram/infrastructure/iterable-utils.js';

/**
 * @param {SVGSVGElement} svg
 * @param {BlobCallback} callBack
 * @param {string?=} dgrmChunkVal
 */
export function pngDgrmCreate(svg, callBack, dgrmChunkVal) {
	/** @type{SVGGraphicsElement} */
	const canvasEl = svg.querySelector('[data-key="canvas"]');
	const rectToShow = canvasEl.getBoundingClientRect();
	const scale = first(canvasEl.transform.baseVal, tt => tt.type === SVGTransform.SVG_TRANSFORM_SCALE)?.matrix.a ?? 1;

	// TODO: optimize: svgPositionSet and svgScale both change position

	/** @type {SVGSVGElement} */
	// @ts-ignore
	const svgVirtual = svg.cloneNode(true);
	svgVirtual.style.backgroundImage = null;
	svgVirtual.querySelectorAll('.selected, .highlighted').forEach(el => el.classList.remove('selected', 'highlighted'));

	// diagram to left corner
	/** @type{SVGGraphicsElement} */
	const canvasElVirtual = svgVirtual.querySelector('[data-key="canvas"]');
	const canvasElVirtualPosition = svgPositionGet(canvasElVirtual);
	svgPositionSet(canvasElVirtual,
		{
			x: canvasElVirtualPosition.x + 15 * scale - rectToShow.x, // padding 15px
			y: canvasElVirtualPosition.y + 15 * scale - rectToShow.y
		});
	svgScale(canvasElVirtual, { x: 0, y: 0 }, scale, 1);

	svgToPng(svgVirtual,
		{ x: 0, y: 0, height: rectToShow.height / scale + 30, width: rectToShow.width / scale + 30 },
		// scale
		3,
		// callBack
		!dgrmChunkVal
			? callBack
			: async function(blob) {
				callBack(await pngChunkSet(blob, 'dgRm', new TextEncoder().encode(dgrmChunkVal)));
			}
	);
}

/**
 * @param {Blob} png
 * @returns {Promise<string|null>}
 */
export async function pngDgrmChunkGet(png) {
	const dgrmChunkVal = await pngChunkGet(png, 'dgRm');
	if (!dgrmChunkVal) { return null; }
	return new TextDecoder().decode(dgrmChunkVal);
}
