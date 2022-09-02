import { svgPositionGet, svgPositionSet } from '../diagram/infrastructure/svg-utils.js';
import { svgToPng } from './infrastructure/svg-to-png-utils.js';
import { pngChunkGet, pngChunkSet } from './infrastructure/png-chunk-utils.js';

/**
 * @param {SVGSVGElement} svg
 * @param {BlobCallback} callBack
 * @param {string?=} dgrmChunkVal
 */
export function pngDgrmCreate(svg, callBack, dgrmChunkVal) {
	const rectToShow = svg.querySelector('[data-key="canvas"]').getBoundingClientRect();

	/** @type {SVGSVGElement} */
	// @ts-ignore
	const svgCopy = svg.cloneNode(true);
	svgCopy.querySelectorAll('.selected, .highlighted').forEach(el => el.classList.remove('selected', 'highlighted'));

	// diagram to left corner
	/** @type{SVGGraphicsElement} */
	const rootSvg = svgCopy.querySelector('[data-key="canvas"]');
	const rootPosition = svgPositionGet(rootSvg);
	console.log(rootPosition);
	svgPositionSet(rootSvg,
		{
			x: rectToShow.x * -1 + rootPosition.x + 15, // padding 15px
			y: rectToShow.y * -1 + rootPosition.y + 15
		});

	svgToPng(svgCopy,
		{ x: 0, y: 0, height: rectToShow.height + 30, width: rectToShow.width + 30 },
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
