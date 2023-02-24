import { circle } from './circle.js';
import { path } from './path.js';
import { rect } from './rect.js';
import { rhomb } from './rhomb.js';

/**
 * @param {CanvasElement} canvas
 * @returns {Record<number, ShapeType>}
 */
export function shapeTypeMap(canvas) {
	return {
		0: { create: shapeData => path(canvas, shapeData) },
		1: { create: shapeData => circle(canvas, shapeData) },
		2: { create: shapeData => rect(canvas, shapeData) },
		3: { create: shapeData => { /** @type {RectData} */(shapeData).t = true; return rect(canvas, shapeData); } },
		4: { create: shapeData => rhomb(canvas, shapeData) }
	};
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./rect.js').RectData } RectData */
/** @typedef { import('../infrastructure/canvas-smbl.js').CanvasElement } CanvasElement */
/**
@typedef {{
	create: (shapeData)=>SVGGraphicsElement
}} ShapeType
*/
