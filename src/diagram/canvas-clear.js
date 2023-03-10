import { CanvasSmbl } from '../infrastructure/canvas-smbl.js';
import { PathSmbl } from '../shapes/path-smbl.js';
import { ShapeSmbl } from '../shapes/shape-smbl.js';

/** @param {CanvasElement} canvas */
export function canvasClear(canvas) {
	while (canvas.firstChild) {
		(canvas.firstChild[ShapeSmbl] || canvas.firstChild[PathSmbl]).del();
	}
	canvas[CanvasSmbl].move(0, 0, 1);
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

/** @typedef { import('../infrastructure/move-scale-applay.js').CanvasElement } CanvasElement */
