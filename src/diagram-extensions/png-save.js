import { svgPositionGet, svgPositionSet } from '../diagram/infrastructure/svg-utils.js';
import { getBoundingRect, svgToPng } from './infrastructure/svg-to-png-utils.js';
import { pngChunkSet } from './infrastructure/png-chunk-utils.js';

/**
 * @param {SVGSVGElement} svg
 * @param {string?=} dgrmChunkVal
 */
export function pngSave(svg, dgrmChunkVal) {
	/** @type {SVGSVGElement} */
	// @ts-ignore
	const svgCopy = svg.cloneNode(true);
	svgCopy.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));

	const rectToShow = getBoundingRect(svg, '[data-key="canvas"]');

	// diagram to left corner
	/** @type{SVGGraphicsElement} */
	const rootSvg = svgCopy.querySelector('[data-key="canvas"]');
	const rootPosition = svgPositionGet(rootSvg);
	svgPositionSet(rootSvg,
		{
			x: rectToShow.x * -1 + rootPosition.x + 15, // padding 15px
			y: rectToShow.y * -1 + rootPosition.y + 15
		});

	svgToPng(svgCopy,
		{ x: 0, y: 0, height: rectToShow.height + 30, width: rectToShow.width + 30 },
		3,
		async function(blob) {
			const link = document.createElement('a');
			link.download = 'dgrm.png';
			link.href = URL.createObjectURL(dgrmChunkVal
				? await pngChunkSet(blob, 'dgRm', new TextEncoder().encode(dgrmChunkVal))
				: blob);
			link.click();
			URL.revokeObjectURL(link.href);
		});
}
