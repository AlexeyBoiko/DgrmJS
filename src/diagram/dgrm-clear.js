import { CanvasSmbl } from '../infrastructure/move-scale-applay.js';
import { ShapeSmbl } from '../shapes/shape-evt-proc.js';

/** @param {CanvasElement} canvas */
export function dgrmClear(canvas) {
	while (canvas.firstChild) {
		/** @type {ShapeElement} */(canvas.firstChild)[ShapeSmbl]?.del();
	}
	canvas[CanvasSmbl].move(0, 0, 1);
}

/** @typedef { import("../shapes/shape-evt-proc").ShapeElement } ShapeElement */
/** @typedef { import('../infrastructure/move-scale-applay.js').CanvasElement } CanvasElement */
