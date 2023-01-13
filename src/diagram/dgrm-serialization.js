import { PathSmbl } from '../shapes/path.js';
import { ShapeSmbl } from '../shapes/shape-smbl.js';
import { dgrmClear } from './dgrm-clear.js';

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
			const pathJson = { type: 0	};

			// start
			if (pathData.startShape) {
				pathJson.s = shapes.indexOf(pathData.startShape.shapeEl);
				pathJson.sk = pathData.startShape.connectorKey;
			} else {
				pathJson.sp = pathData.start;
			}

			// end
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
 * @param {SVGGElement} canvas
 * @param {Record<number, {create :(shapeData)=>SVGGraphicsElement}>} shapeTypeMap
 * @param {DiagramSerialized} data
 */
export function deserialize(canvas, shapeTypeMap, data) {
	if (data.v !== '1') { alert('Wrong format'); return false; }
	dgrmClear(canvas);

	/** @type {Map<ShapeData, SVGGraphicsElement>} */
	const shapeDataToElem = new Map();

	/** @param {ShapeData} shapeData */
	function shapeEnsure(shapeData) {
		let shapeEl = shapeDataToElem.get(shapeData);
		if (!shapeEl) {
			shapeEl = shapeTypeMap[shapeData.type].create(shapeData);
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
				const pathData = { style: pathSerialized.c };

				// start
				if (!pathSerialized.sp) {
					pathData.startShape = { shapeEl: shapeByIndex(pathSerialized.s), connectorKey: pathSerialized.sk };
				} else {
					pathData.start = pathSerialized.sp;
				}

				// end
				if (!pathSerialized.ep) {
					pathData.endShape = { shapeEl: shapeByIndex(pathSerialized.e), connectorKey: pathSerialized.ek };
				} else {
					pathData.end = pathSerialized.ep;
				}

				canvas.append(shapeTypeMap[0].create(pathData));
				break;
			}
			default: shapeEnsure(/** @type {ShapeData} */(shape)); break;
		}
	}

	return true;
}

/** @typedef {{v:string, s: Array<ShapeData | PathSerialized>}} DiagramSerialized */

/** @typedef { import("../shapes/shape-evt-proc").ShapeElement } ShapeElement */
/** @typedef { import('../shapes/shape-evt-proc.js').ShapeData } ShapeData */

/** @typedef { import("../shapes/path").PathElement } PathElement */
/** @typedef { import('../shapes/path.js').PathData } PathData */
/** @typedef { import("../shapes/path").PathEnd } PathEnd */
/** @typedef { {type:number, s?:number, sk?:string, sp?:PathEnd, e?:number, ek?:string, ep?:PathEnd, c?:string} } PathSerialized */

/** @typedef { import('../shapes/shape-evt-proc.js').CanvasData } CanvasData */
