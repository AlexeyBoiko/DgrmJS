import { moveScaleApplay } from './infrastructure/move-scale-applay.js';
import { circle } from './shapes/circle.js';
import { evtRouteApplay } from './infrastructure/move-evt-proc.js';

import './ui/menu.js';
import { path } from './shapes/path.js';

const svg = document.getElementById('diagram');
const canvas = document.getElementById('canvas');

evtRouteApplay(svg);

const canvasData = {
	position: { x: 0, y: 0 },
	scale: 1,
	cell: 24
};
moveScaleApplay(svg, canvas, canvasData);

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
			const shapeSvgElement = circle(svg, canvasData, {
				type: 0,
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
				const pathShape = path(svg, canvasData, {
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
