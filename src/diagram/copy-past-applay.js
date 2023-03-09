import { CanvasSmbl } from '../infrastructure/canvas-smbl.js';
import { listen } from '../infrastructure/util.js';
import { tipShow } from '../ui/ui.js';

/** @param {CanvasElement} canvas */
export function copyPastApplay(canvas) {
	listen(document, 'paste', /** @param {ClipboardEvent & {target:HTMLElement | SVGElement}} evt */ evt => {
		if (evt.target.tagName.toUpperCase() === 'TEXTAREA') { return; }
		// if (document.activeElement !== canvas.ownerSVGElement) { return; }

		// const dataStr = evt.clipboardData.getData('dgrm');
		// if (!dataStr) { return; }

		// const data = JSON.parse(dataStr);
		// if (data.type === 0) {
		// 	// path
		// } else {
		// 	// shape
		// 	const center = pointInCanvas(canvas[CanvasSmbl].data, window.innerWidth / 2, window.innerHeight / 2);
		// 	placeToCell(center, canvas[CanvasSmbl].data.cell);
		// 	/** @type {ShapeData} */(data).position = center;
		// }

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

/** @typedef { import('../infrastructure/canvas-smbl.js').CanvasElement } CanvasElement */
