import { circle } from './circle.js';
import { path } from './path.js';
import { rect } from './rect.js';

/**
 * @param {Element} svg
 * @param {{position:Point, scale:number, cell:number}} canvasData
 * @returns {Record<number, ShapeType>}
 */
export function shapeTypeMap(svg, canvasData) {
	return {
		0: { create: shapeData => path(svg, canvasData, shapeData) },
		1: { create: shapeData => circle(svg, canvasData, shapeData), center: { x: 0, y: 0 } },
		2: { create: shapeData => rect(svg, canvasData, shapeData), center: { x: 48, y: 24 } }
	};
}

/** @typedef { {x:number, y:number} } Point */
/**
@typedef {{
create: (shapeData)=>SVGGraphicsElement
center?: Point
}} ShapeType
*/
