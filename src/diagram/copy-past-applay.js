import { CanvasSmbl } from '../infrastructure/canvas-smbl.js';
import { placeToCell, pointInCanvas } from '../infrastructure/move-scale-applay.js';
import { deepCopy, listen, pointShift } from '../infrastructure/util.js';
import { tipShow } from '../ui/ui.js';
import { deserialize, serializeShapes } from './dgrm-serialization.js';
import { groupSelect } from './group-select-applay.js';

/** @param {CanvasElement} canvas */
export function copyPastApplay(canvas) {
	listen(document, 'paste', /** @param {ClipboardEvent & {target:HTMLElement | SVGElement}} evt */ evt => {
		if (evt.target.tagName.toUpperCase() === 'TEXTAREA') { return; }
		// if (document.activeElement !== canvas.ownerSVGElement) { return; }

		const dataStr = evt.clipboardData.getData('dgrm');
		if (!dataStr) { return; }

		const data = JSON.parse(dataStr);
		if (data.type === 0) {
			// path
		} else {
			// shape
			const center = pointInCanvas(canvas[CanvasSmbl].data, window.innerWidth / 2, window.innerHeight / 2);
			placeToCell(center, canvas[CanvasSmbl].data.cell);
			/** @type {ShapeData} */(data).position = center;
		}

		tipShow(false);
	});
}

//
// selection clear function

/** @param {CanvasElement} canvas */
export function canvasSelectionClear(canvas) {
	if (canvas[CanvasSmbl].selectClear) { canvas[CanvasSmbl].selectClear(); };
}

/** @param {CanvasElement} canvas, @param {()=>void} clearFn */
export function canvasSelectionClearSet(canvas, clearFn) {
	canvas[CanvasSmbl].selectClear = clearFn;
}

//
// copy past

/** @param {CanvasElement} canvas, @param {Array<ShapeElement & PathElement>} shapes */
export const copyAndPast = (canvas, shapes) => past(canvas, copyDataCreate(shapes));

/** @param {Array<ShapeElement & PathElement>} shapes */
const copyDataCreate = shapes => deepCopy(serializeShapes(shapes));

/** @param {CanvasElement} canvas, @param {DiagramSerialized} data */
function past(canvas, data) {
	canvasSelectionClear(canvas);
	shiftToCenter(canvas, data);
	groupSelect(canvas, deserialize(canvas, data, true));
}

//
// move shapes

/** @param {CanvasElement} canvas, @param {DiagramSerialized} data */
function shiftToCenter(canvas, data) {
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
/** @typedef { import('../shapes/shape-type-map.js').ShapeType } ShapeType */
/** @typedef { import('../shapes/shape-evt-proc.js').ShapeData } ShapeData */
/** @typedef { import('./dgrm-serialization.js').DiagramSerialized } DiagramSerialized */
/** @typedef { import('../shapes/path-smbl').PathElement } PathElement */
/** @typedef { import('../shapes/shape-smbl').ShapeElement } ShapeElement */
/** @typedef { import('./dgrm-serialization.js').PathSerialized } PathSerialized */
