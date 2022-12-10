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
 * @param {CanvasData} canvasData
 * @param {SVGGElement} canvas
 * @param {DiagramSerialized} data
 */
export function deserialize(canvas, canvasData, data) {
	if (data.v !== '1') { alert('wrong format'); return; }
	dgrmClear(canvas);

	/** @param {ShapeData & {elem?:SVGGraphicsElement}} shapeData */
	function shapeEnsure(shapeData) {
		if (!shapeData.elem) {
			let shapeEl;
			switch (shapeData.type) {
				// circle
				case 1: shapeEl = circle(canvas.ownerSVGElement, canvasData, /** @type {ShapeData} */(shapeData)); break;
			}
			canvas.append(shapeEl);
			shapeData.elem = shapeEl;
		}
		return shapeData.elem;
	}

	/** @param {number?} index */
	const shapeByIndex = (index) => shapeEnsure(/** @type {ShapeData} */(data.s[index]));

	for (const shape of data.s) {
		switch (shape.type) {
			// path
			case 0: {
				const pathSerialized = /** @type {PathSerialized} */(shape);
				/** @type {PathData} */
				const pathData = {
					startShape: { shapeEl: shapeByIndex(pathSerialized.s), connectorKey: pathSerialized.sk },
					style: pathSerialized.c
				};

				if (!pathSerialized.ep) {
					pathData.endShape = { shapeEl: shapeByIndex(pathSerialized.e), connectorKey: pathSerialized.ek };
				} else {
					pathData.end = pathSerialized.ep;
				}

				canvas.append(path(canvas.ownerSVGElement, canvasData, pathData));
				break;
			}
			default: shapeEnsure(/** @type {ShapeData} */(shape)); break;
		}
	}
}

/** @param {SVGGElement} canvas */
function dgrmClear(canvas) {
	// TODO: reset position and scale
	while (canvas.firstChild) {
		/** @type {ShapeElement} */(canvas.firstChild)[ShapeSmbl]?.del();
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
