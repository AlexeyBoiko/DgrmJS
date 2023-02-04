import { CanvasSmbl } from '../infrastructure/move-scale-applay.js';
import { PathSmbl } from '../shapes/path-smbl.js';
import { ShapeSmbl } from '../shapes/shape-smbl.js';

/** @param {CanvasElement} canvas */
export function dgrmClear(canvas) {
	while (canvas.firstChild) {
		(canvas.firstChild[ShapeSmbl] || canvas.firstChild[PathSmbl]).del();
	}
	canvas[CanvasSmbl].move(0, 0, 1);
}

/** @typedef { import('../infrastructure/move-scale-applay.js').CanvasElement } CanvasElement */
