import { PathSmbl } from '../shapes/path';
import { ShapeSmbl } from '../shapes/shape-evt-proc.js';

export function serialize() {
	const canvas = document.getElementById('canvas');

	const res = [];

	const shapes = /** @type {Array<ShapeElement & PathElement>} */([...canvas.children]);
	for (const shape of shapes) {
		if (shape[ShapeSmbl]) {
			res.push(shape[ShapeSmbl].data);
		} else {
			const pathData = shape[PathSmbl].data;
			if (!pathData.startShape || !pathData.endShape) { continue; }
			res.push({
				s: shapes.indexOf(pathData.startShape.shapeEl),
				sk: pathData.startShape.connectorKey,
				e: shapes.indexOf(pathData.endShape.shapeEl),
				ek: pathData.endShape.connectorKey,
				c: pathData.style
			});
		}
	}

	console.log(res);
	console.log(JSON.stringify(res));
}

/** @typedef { import("../shapes/shape-evt-proc").ShapeElement } ShapeElement */
/** @typedef { import("../shapes/path").PathElement } PathElement */
