import { pngChunkSet } from '../infrastructure/png-chunk.js';
import { svgToPng } from '../infrastructure/svg-to-png.js';

/**
 * @param {SVGGElement} canvas
 * @param {{position:Point, scale:number}} canvasData
 * @param {string} dgrmChunkVal
 * @param {BlobCallback} callBack
 */
export function pngCreate(canvas, canvasData, dgrmChunkVal, callBack) {
	// /** @type{SVGGraphicsElement} */
	// const canvasEl = svg.querySelector('[data-key="canvas"]');
	const rectToShow = canvas.getBoundingClientRect();
	// const scale = first(canvasEl.transform.baseVal, tt => tt.type === SVGTransform.SVG_TRANSFORM_SCALE)?.matrix.a ?? 1;

	// TODO: optimize: svgPositionSet and svgScale both change position

	const svgVirtual = /** @type {SVGSVGElement} */(canvas.ownerSVGElement.cloneNode(true));
	svgVirtual.style.backgroundImage = null;
	svgVirtual.querySelectorAll('.select, .highlight').forEach(el => el.classList.remove('select', 'highlight'));

	// diagram to left corner
	const canvasElVirtual = /** @type{SVGGraphicsElement} */(svgVirtual.children[1]); // svgVirtual.querySelector('[data-key="canvas"]');
	// const canvasElVirtualPosition = svgPositionGet(canvasElVirtual);
	// svgPositionSet(canvasElVirtual,
	// 	{
	// 		x: canvasElVirtualPosition.x + 15 * canvasData.scale - rectToShow.x, // padding 15px
	// 		y: canvasElVirtualPosition.y + 15 * canvasData.scale - rectToShow.y
	// 	});
	// svgScale(canvasElVirtual, { x: 0, y: 0 }, scale, 1);

	// padding 15px
	canvasElVirtual.style.transform = `matrix(1, 0, 0, 1, ${canvasData.position.x + 15 * canvasData.scale - rectToShow.x}, ${canvasData.position.y + 15 * canvasData.scale - rectToShow.y})`;

	svgToPng(svgVirtual,
		{ x: 0, y: 0, height: rectToShow.height / canvasData.scale + 30, width: rectToShow.width / canvasData.scale + 30 },
		// scale
		3,
		// callBack
		async blob => callBack(await pngChunkSet(blob, 'dgRm', new TextEncoder().encode(dgrmChunkVal)))
	);
}

/** @typedef { {x:number, y:number} } Point */
