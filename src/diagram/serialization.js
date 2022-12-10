import { CanvasSmbl } from '../infrastructure/move-scale-applay.js';
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

	/** @type {Map<ShapeData, SVGGraphicsElement>} */
	const shapeDataToElem = new Map();

	/** @param {ShapeData} shapeData */
	function shapeEnsure(shapeData) {
		let shapeEl = shapeDataToElem.get(shapeData);
		if (!shapeEl) {
			switch (shapeData.type) {
				// circle
				case 1: shapeEl = circle(canvas.ownerSVGElement, canvasData, /** @type {ShapeData} */(shapeData)); break;
			}
			canvas.append(shapeEl);
			shapeDataToElem.set(shapeData, shapeEl);
		}
		return shapeEl;
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

/** @param {CanvasElement} canvas */
function dgrmClear(canvas) {
	while (canvas.firstChild) {
		/** @type {ShapeElement} */(canvas.firstChild)[ShapeSmbl]?.del();
	}
	canvas[CanvasSmbl].move(0, 0, 1);
}

/** @typedef {{v:string, s: Array<ShapeData | PathSerialized>}} DiagramSerialized */

/** @typedef { import("../shapes/shape-evt-proc").ShapeElement } ShapeElement */
/** @typedef { import('../shapes/shape-evt-proc.js').ShapeData } ShapeData */
/** @typedef { import('../infrastructure/move-scale-applay.js').CanvasElement } CanvasElement */

/** @typedef { import("../shapes/path").PathElement } PathElement */
/** @typedef { import('../shapes/path.js').PathData } PathData */
/** @typedef { import("../shapes/path").PathEnd } PathEnd */
/** @typedef { {type:number, s:number, sk:string, e?:number, ek?:string, ep?:PathEnd, c?:string} } PathSerialized */

/** @typedef { import('../shapes/shape-evt-proc.js').CanvasData } CanvasData */
