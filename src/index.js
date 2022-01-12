import { svgDiagramCreate } from './diagram/svg-presenter/svg-diagram-fuctory.js';

// @ts-ignore
const diagram = svgDiagramCreate(document.getElementById('diagram'));

//
// add shape

function shapeAdd(evt) {
	diagram.shapeAdd('shape', {
		templateKey: evt.currentTarget.getAttribute('data-shape'),
		position: { x: 120, y: 120 } //,
		// props: {
		// 	text: { textContent: 'Mars' }
		// }
	});
};
document.getElementById('menu')
	.querySelectorAll('[data-shape]')
	.forEach(itm => itm.addEventListener('click', shapeAdd));

//
// edit shape

// function shapeDel
