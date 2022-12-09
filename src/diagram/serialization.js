import { circle } from '../shapes/circle.js';
import { path, PathSmbl } from '../shapes/path.js';
import { ShapeSmbl } from '../shapes/shape-evt-proc.js';

/** @param {Element} canvas */
export function serialize(canvas) {
	/** @type {DiagramSerialized} */
	const diagramSerialized = { v: '1', s: [] };

	const shapes = /** @type {Array<ShapeElement & PathElement>} */([...canvas.children]);
	for (const shape of shapes) {
		if (shape[ShapeSmbl]) {
			// shape
			diagramSerialized.s.push(shape[ShapeSmbl].data);
		} else {
			// path

			const pathData = shape[PathSmbl].data;
			if (!pathData.startShape || !pathData.endShape) { continue; }
			const pathJson = {
				type: 0,
				s: shapes.indexOf(pathData.startShape.shapeEl),
				sk: pathData.startShape.connectorKey
			};
			if (pathData.endShape) {
				pathJson.e = shapes.indexOf(pathData.endShape.shapeEl);
				pathJson.ek = pathData.endShape.connectorKey;
			} else {
				pathJson.ep = pathData.end;
			}
			if (pathData.style) { pathJson.c = pathData.style; }

			diagramSerialized.s.push(pathJson);
		}
	}

	return diagramSerialized;
}

/**
 * @param {HTMLElement} svg
 * @param {CanvasData} canvasData
 * @param {HTMLElement} canvas
 * @param {DiagramSerialized} data
 */
export function deserialize(svg, canvas, canvasData, data) {
	if (data.v !== '1') { alert('wrong format'); return; }

	/** @param {ShapeData} shapeData */
	function shapeCreate(shapeData) {
		let shapeEl;
		switch (shapeData.type) {
			// circle
			case 1: shapeEl = circle(svg, canvasData, /** @type {ShapeData} */(shapeData)); break;
		}
		canvas.append(shapeEl);
		return shapeEl;
	}

	/** @param {number?} index */
	function ensureShape(index) {
		if (!data.s[index].elem) {
			data.s[index].elem = shapeCreate(/** @type {ShapeData} */(data.s[index]));
		}
		return data.s[index].elem;
	}

	for (const shape of data.s) {
		switch (shape.type) {
			// path
			case 0: {
				const pathSerialized = /** @type {PathSerialized} */(shape);
				/** @type {PathData} */
				const pathData = {
					startShape: { shapeEl: ensureShape(pathSerialized.s), connectorKey: pathSerialized.sk },
					style: pathSerialized.c
				};

				if (!pathSerialized.ep) {
					pathData.endShape = { shapeEl: ensureShape(pathSerialized.e), connectorKey: pathSerialized.ek };
				} else {
					pathData.end = pathSerialized.ep;
				}

				canvas.append(path(svg, canvasData, pathData));
				break;
			}
			default: shapeCreate(/** @type {ShapeData} */(shape)); break;
		}
	}
}

/** @typedef {{v:string, s: Array<(ShapeData | PathSerialized) & {elem?:SVGGraphicsElement}>}} DiagramSerialized */

/** @typedef { import("../shapes/shape-evt-proc").ShapeElement } ShapeElement */
/** @typedef { import('../shapes/shape-evt-proc.js').ShapeData } ShapeData */

/** @typedef { import("../shapes/path").PathElement } PathElement */
/** @typedef { import('../shapes/path.js').PathData } PathData */
/** @typedef { import("../shapes/path").PathEnd } PathEnd */
/** @typedef { {type:number, s:number, sk:string, e?:number, ek?:string, ep?:PathEnd, c?:string} } PathSerialized */

/** @typedef { import('../shapes/shape-evt-proc.js').CanvasData } CanvasData */
