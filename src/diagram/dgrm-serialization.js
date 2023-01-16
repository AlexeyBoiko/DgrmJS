import { PathSmbl } from '../shapes/path.js';
import { ShapeSmbl } from '../shapes/shape-smbl.js';
import { dgrmClear } from './dgrm-clear.js';

/** @param {Element} canvas */
export function serialize(canvas) {
	/** @type {DiagramSerialized} */
	const diagramSerialized = { v: '1.1', s: [] };

	const shapes = /** @type {Array<ShapeElement & PathElement>} */([...canvas.children]);
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
				/** @param {PathEndSerialized} pathEnd */
				const pathDeserialize = pathEnd => pathEnd.p
					? { data: pathEnd.p }
					: { shape: { shapeEl: shapeByIndex(pathEnd.s), connectorKey: pathEnd.k } };

				canvas.append(shapeTypeMap[0].create({
					style: /** @type {PathSerialized} */(shape).c,
					s: pathDeserialize(/** @type {PathSerialized} */(shape).s),
					e: pathDeserialize(/** @type {PathSerialized} */(shape).e)
				}));
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
/** @typedef { import('../shapes/path.js').PathEndData } PathEndData */
/** @typedef { import('../shapes/path.js').PathEnd } PathEnd */
/** @typedef { import('../shapes/path.js').PathData } PathData */

/** @typedef { {s?:number, k?:string, p?:PathEndData} } PathEndSerialized */
/** @typedef { {type:number, c?:string, s:PathEndSerialized, e:PathEndSerialized} } PathSerialized */

/** @typedef { import('../shapes/shape-evt-proc.js').CanvasData } CanvasData */
