import { circle } from './circle.js';
import { path } from './path.js';

/**
 * @param {Element} svg
 * @param {{position:{x:number, y:number}, scale:number, cell:number}} canvasData
 * @returns {Record<number, {create :(shapeData)=>SVGGraphicsElement}>}
 */
export function shapeTypeMap(svg, canvasData) {
	return {
		0: { create: shapeData => path(svg, canvasData, shapeData) },
		1: { create: shapeData => circle(svg, canvasData, shapeData) }
	};
}
