import { CanvasSmbl } from '../infrastructure/canvas-smbl.js';
import { placeToCell, pointInCanvas } from '../infrastructure/move-scale-applay.js';
import { pointShift } from '../infrastructure/util.js';

/** @param {CanvasElement} canvas, @param {DiagramSerialized} data */
export function groupMoveToCenter(canvas, data) {
	const screenCenter = pointInCanvas(canvas[CanvasSmbl].data, window.innerWidth / 2, window.innerHeight / 2);
	placeToCell(screenCenter, canvas[CanvasSmbl].data.cell);

	const shift = pointShift(screenCenter, centerCalc(data), -1);
	iteratePoints(data, point => { if (point) { pointShift(point, shift); } });
}

/** @param {DiagramSerialized} data */
function centerCalc(data) {
	const minMax = maxAndMinPoint(data);
	return {
		x: minMax.min.x + (minMax.max.x - minMax.min.x) / 2,
		y: minMax.min.y + (minMax.max.y - minMax.min.y) / 2
	};
}

/** @param {DiagramSerialized} data */
function maxAndMinPoint(data) {
	/** @type {Point} */
	const min = { x: Infinity, y: Infinity };

	/** @type {Point} */
	const max = { x: -Infinity, y: -Infinity };

	iteratePoints(data, point => {
		if (!point) { return; }

		if (min.x > point.x) { min.x = point.x; }
		if (min.y > point.y) { min.y = point.y; }

		if (max.x < point.x) { max.x = point.x; }
		if (max.y < point.y) { max.y = point.y; }
	});
	return { min, max };
}

/** @param {DiagramSerialized} data, @param {(point:Point)=>void} callbackfn */
function iteratePoints(data, callbackfn) {
	data.s.forEach(shapeOrPath => {
		if (shapeOrPath.type === 0) {
			// path
			callbackfn(/** @type {PathSerialized} */(shapeOrPath).s.p?.position);
			callbackfn(/** @type {PathSerialized} */(shapeOrPath).e.p?.position);
		} else {
			// shape
			callbackfn(/** @type {ShapeData} */(shapeOrPath).position);
		}
	});
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('../infrastructure/canvas-smbl.js').CanvasElement } CanvasElement */
/** @typedef { import('./dgrm-serialization.js').DiagramSerialized } DiagramSerialized */
/** @typedef { import('./dgrm-serialization.js').PathSerialized } PathSerialized */
/** @typedef { import('../shapes/shape-evt-proc.js').ShapeData } ShapeData */
