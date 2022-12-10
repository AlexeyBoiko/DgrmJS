import { pngChunkGet, pngChunkSet } from '../infrastructure/png-chunk.js';
import { svgToPng } from '../infrastructure/svg-to-png.js';

/**
 * @param {SVGGElement} canvas
 * @param {{position:Point, scale:number}} canvasData
 * @param {string} dgrmChunkVal
 * @param {BlobCallback} callBack
 */
export function dgrmPngCreate(canvas, canvasData, dgrmChunkVal, callBack) {
	const rectToShow = canvas.getBoundingClientRect();
	const svgVirtual = /** @type {SVGSVGElement} */(canvas.ownerSVGElement.cloneNode(true));
	svgVirtual.style.backgroundImage = null;
	svgVirtual.querySelectorAll('.select, .highlight').forEach(el => el.classList.remove('select', 'highlight'));

	const nonSvgElems = svgVirtual.getElementsByTagName('foreignObject');
	while (nonSvgElems[0]) { nonSvgElems[0].parentNode.removeChild(nonSvgElems[0]); }

	// diagram to left corner
	const canvasElVirtual = /** @type{SVGGraphicsElement} */(svgVirtual.children[1]);
	const divis = 1 / canvasData.scale;
	canvasElVirtual.style.transform = `matrix(1, 0, 0, 1, ${divis * (canvasData.position.x + 15 * canvasData.scale - rectToShow.x)}, ${divis * (canvasData.position.y + 15 * canvasData.scale - rectToShow.y)})`;

	svgToPng(svgVirtual,
		{ x: 0, y: 0, height: rectToShow.height / canvasData.scale + 30, width: rectToShow.width / canvasData.scale + 30 },
		// scale
		3,
		// callBack
		async blob => callBack(await pngChunkSet(blob, 'dgRm', new TextEncoder().encode(dgrmChunkVal)))
	);
}

/**
 * @param {Blob} png
 * @returns {Promise<string|null>}
 */
export async function dgrmPngChunkGet(png) {
	const dgrmChunkVal = await pngChunkGet(png, 'dgRm');
	return dgrmChunkVal ? new TextDecoder().decode(dgrmChunkVal) : null;
}

/** @typedef { {x:number, y:number} } Point */
