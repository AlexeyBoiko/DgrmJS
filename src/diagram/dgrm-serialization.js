import { CanvasSmbl } from '../infrastructure/canvas-smbl.js';
import { PathSmbl } from '../shapes/path-smbl.js';
import { ShapeSmbl } from '../shapes/shape-smbl.js';
import { dgrmClear } from './dgrm-clear.js';

const v = '1.1';

/** @param {Element} canvas */
export const serialize = (canvas) => serializeShapes(/** @type {Array<ShapeElement & PathElement>} */([...canvas.children]));

/** @param {Array<ShapeElement & PathElement>} shapes */
export function serializeShapes(shapes) {
	/** @type {DiagramSerialized} */
	const diagramSerialized = { v, s: [] };
	for (const shape of shapes) {
		if (shape[ShapeSmbl]) {
			// shape
			diagramSerialized.s.push(shape[ShapeSmbl].data);
		} else {
			// path

			/** @param {PathEnd} pathEnd */
			const pathSerialize = pathEnd => pathEnd.shape
				? { s: shapes.indexOf(pathEnd.shape.shapeEl), k: pathEnd.shape.connectorKey }
				: { p: pathEnd.data };

			const pathData = shape[PathSmbl].data;
			const pathJson = { type: 0, s: pathSerialize(pathData.s), e: pathSerialize(pathData.e) };
			if (pathData.styles) { pathJson.c = pathData.styles; }

			diagramSerialized.s.push(pathJson);
		}
	}

	return diagramSerialized;
}

/**
 * @param {CanvasElement} canvas
 * @param {DiagramSerialized} data
 * @param {Boolean=} dontClear
 */
export function deserialize(canvas, data, dontClear) {
	if (data.v !== v) { alert('Wrong format'); return null; }
	if (!dontClear) { dgrmClear(canvas); }

	/** @type {Map<ShapeData, ShapeElement>} */
	const shapeDataToElem = new Map();

	/** @param {ShapeData} shapeData */
	function shapeEnsure(shapeData) {
		let shapeEl = shapeDataToElem.get(shapeData);
		if (!shapeEl) {
			shapeEl = canvas[CanvasSmbl].shapeMap[shapeData.type].create(shapeData);
			canvas.append(shapeEl);
			shapeDataToElem.set(shapeData, shapeEl);
		}
		return shapeEl;
	}

	/** @param {number?} index */
	const shapeByIndex = index => shapeEnsure(/** @type {ShapeData} */(data.s[index]));

	/** @type {PathElement[]} */
	const paths = [];
	for (const shape of data.s) {
		switch (shape.type) {
			// path
			case 0: {
				/** @param {PathEndSerialized} pathEnd */
				const pathDeserialize = pathEnd => pathEnd.p
					? { data: pathEnd.p }
					: { shape: { shapeEl: shapeByIndex(pathEnd.s), connectorKey: pathEnd.k } };

				const path = canvas[CanvasSmbl].shapeMap[0].create({
					styles: /** @type {PathSerialized} */(shape).c,
					s: pathDeserialize(/** @type {PathSerialized} */(shape).s),
					e: pathDeserialize(/** @type {PathSerialized} */(shape).e)
				});
				paths.push(path);
				canvas.append(path);
				break;
			}
			default: shapeEnsure(/** @type {ShapeData} */(shape)); break;
		}
	}

	return [...shapeDataToElem.values(), ...paths];
}

/** @typedef {{v:string, s: Array<ShapeData | PathSerialized>}} DiagramSerialized */

/** @typedef { import("../shapes/shape-smbl").ShapeElement } ShapeElement */
/** @typedef { import('../shapes/shape-evt-proc').ShapeData } ShapeData */

/** @typedef { import("../shapes/path-smbl").PathElement } PathElement */
/** @typedef { import('../shapes/path').PathEndData } PathEndData */
/** @typedef { import('../shapes/path').PathEnd } PathEnd */
/** @typedef { import('../shapes/path').PathData } PathData */

/** @typedef { {s?:number, k?:string, p?:PathEndData} } PathEndSerialized */
/** @typedef { {type:number, c?:string, s:PathEndSerialized, e:PathEndSerialized} } PathSerialized */

/** @typedef { import('../shapes/shape-evt-proc').CanvasData } CanvasData */
/** @typedef { import('../infrastructure/canvas-smbl.js').CanvasElement } CanvasElement */
