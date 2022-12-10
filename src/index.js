import { moveScaleApplay } from './infrastructure/move-scale-applay.js';
import { evtRouteApplay } from './infrastructure/move-evt-proc.js';
import { circle } from './shapes/circle.js';
import { path } from './shapes/path.js';
import './ui/menu.js';

/** @type {SVGGElement} */
// @ts-ignore
const canvas = document.getElementById('canvas');
const canvasData = {
	position: { x: 0, y: 0 },
	scale: 1,
	cell: 24
};

evtRouteApplay(canvas.ownerSVGElement);
moveScaleApplay(canvas, canvasData);

/** @type { import('./ui/menu').Menu } */(document.getElementById('menu')).init(canvas, canvasData);

//
// Generate

(function() {
	let posX = 60;
	let posY = 60;
	let counter = 1;

	// const t0 = performance.now();

	let prevShapeSvgElement;
	for (let row = 0; row < 1; row++) {
		for (let ii = 0; ii < 2; ii++) {
			const shapeSvgElement = circle(canvas.ownerSVGElement, canvasData, {
				type: 1,
				position: { x: posX += 120, y: posY },
				// title: `${counter.toString()}`,
				// r: 72,
				title: `${counter.toString()}\n1\n1\n1`
				// style: 'cl-red'
			});
			if (counter > 400) {
			// 	// circle.style.display = 'none';
				// continue;
			}
			canvas.append(shapeSvgElement);

			if (prevShapeSvgElement) {
				const pathShape = path(canvas.ownerSVGElement, canvasData, {
					startShape: { shapeEl: prevShapeSvgElement, connectorKey: 'right' },
					endShape: { shapeEl: shapeSvgElement, connectorKey: 'left' }
					// style: 'cl-red'
				});
				canvas.append(pathShape);
			}
			prevShapeSvgElement = shapeSvgElement;

			counter++;
		}
		posX = 60;
		posY += 120;
	}

	// const t1 = performance.now();
	// alert(`${t1 - t0} milliseconds.`);
})();
