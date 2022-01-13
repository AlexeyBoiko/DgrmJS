import { svgDiagramCreate } from './diagram/svg-presenter/svg-diagram-fuctory.js';

// @ts-ignore
const diagram = svgDiagramCreate(document.getElementById('diagram'));

//
// add shape

/** @param {PointerEvent & { currentTarget: Element }} evt */
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

/** @type {IPresenterShape} */
let selecterShape;
diagram.on('select', /** @param { CustomEvent<IDiagramEventDetail> } evt */ evt => {
	if (evt.detail.target.type === 'shape') {
		selecterShape = evt.detail.target;
	}
});

document.getElementById('del').addEventListener('pointerdown', _ => {
	if (selecterShape) {
		diagram.shapeDel({ shape: selecterShape });
	}
});
