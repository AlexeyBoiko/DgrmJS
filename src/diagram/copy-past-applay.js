import { CanvasSmbl } from '../infrastructure/canvas-smbl.js';
import { placeToCell, pointInCanvas } from '../infrastructure/move-scale-applay.js';
import { listen } from '../infrastructure/util.js';
import { tipShow } from '../ui/ui.js';

/** @param {CanvasElement} canvas, @param {Record<number, ShapeType>} shapeTypeMap */
export function copyPastApplay(canvas, shapeTypeMap) {
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
			canvas.append(shapeTypeMap[/** @type {ShapeData} */(data).type].create(data));
		}

		tipShow(false);
	});
}

/** @typedef {import('../infrastructure/canvas-smbl.js').CanvasElement} CanvasElement */
/** @typedef {import('../shapes/shape-type-map.js').ShapeType} ShapeType */
/** @typedef {import('../shapes/shape-evt-proc.js').ShapeData} ShapeData */
