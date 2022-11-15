import { moveScaleApplay } from './move-scale-applay.js';
import { circle } from './shapes/circle.js';

const canvas = document.getElementById('canvas');

//
// move, scale

const svg = document.getElementById('diagram');
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

	for (let row = 0; row < 1; row++) {
		for (let ii = 0; ii < 2; ii++) {
			const shapeSvgElement = circle(
				canvasData,
				{
					position: { x: posX += 120, y: posY },
					title: counter.toString()
				});
			if (counter > 400) {
			// 	// circle.style.display = 'none';
				// continue;
			}
			canvas.append(shapeSvgElement);
			counter++;
		}
		posX = 60;
		posY += 120;
	}

	// const t1 = performance.now();
	// alert(`${t1 - t0} milliseconds.`);
})();
