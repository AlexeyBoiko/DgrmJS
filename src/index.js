import { svgDiagramCreate } from './diagram/svg-presenter/svg-diagram-fuctory.js';

//
// html bind

const settingsPanel = document.getElementById('panel');
const textField = /** @type {HTMLInputElement} */(document.getElementById('text'));
textField.addEventListener('input', _ => shapeUpdate());
textField.addEventListener('change', _ => shapeUpdate());
document.getElementById('del').addEventListener('click', evt => { evt.preventDefault(); shapeDel(); });
document.getElementById('gear').addEventListener('click', evt => { evt.preventDefault(); menuToggle(); });
document.getElementById('menu').querySelectorAll('[data-shape]')
	.forEach(itm => itm.addEventListener('click', /** @param {PointerEvent & { currentTarget: Element }} evt */evt => {
		evt.preventDefault(); shapeAdd(evt.currentTarget.getAttribute('data-shape'));
	}));

//
// logic

/** @type {WeakMap<IDiagramShape, string>} */
const shapeData = new WeakMap();

/** @type {IDiagramShape} */
let selecterShape;

/** @ts-ignore */
const diagram = svgDiagramCreate(document.getElementById('diagram'))
	.on('select', /** @param { CustomEvent<IDiagramEventSelectDetail> } evt */ evt => shapeSelect(evt.detail.target));

/** @param {string} templateKey */
function shapeAdd(templateKey) {
	shapeData.set(diagram.shapeAdd({
		templateKey: templateKey,
		position: { x: 120, y: 120 },
		props: {
			text: { textContent: 'Title' }
		}
	}),
	'Title');
}

function shapeDel() {
	if (!selecterShape) { return; }

	shapeData.delete(selecterShape);
	diagram.shapeDel(selecterShape);
	shapeSelect(null);
}

function shapeUpdate() {
	if (!selecterShape) { return; }

	shapeData.set(selecterShape, textField.value);
	selecterShape.update({
		props: {
			text: { textContent: textField.value }
		}
	});
}

/** @param {IDiagramShape} shape */
function shapeSelect(shape) {
	if (shape && shape.type === 'shape') {
		selecterShape = shape;
		settingsPanel.classList.add('selected');

		if (shapeData.has(shape)) {
			textField.value = shapeData.get(shape);
			textField.disabled = false;
		} else {
			textField.value = null;
			textField.disabled = true;
		}
	} else {
		selecterShape = null;
		settingsPanel.classList.remove('selected');
	}
}

function menuToggle() {
	if (settingsPanel.classList.contains('open')) {
		settingsPanel.classList.remove('open');
	} else {
		settingsPanel.classList.add('open');
	}
}

//
// example cancel connect/disconnect

// diagram
// 	.on('connect', evt => { console.log(evt); evt.preventDefault(); })
// 	.on('disconnect', evt => { console.log(evt); evt.preventDefault(); });

//
// example connect shapes

// const shape1 = diagram.shapeAdd({
// 	templateKey: 'circle',
// 	position: { x: 120, y: 120 },
// 	props: {
// 		text: { textContent: 'Title1' }
// 	}
// });

// const shape2 = diagram.shapeAdd({
// 	templateKey: 'circle',
// 	position: { x: 220, y: 220 },
// 	props: {
// 		text: { textContent: 'Title2' }
// 	}
// });

// diagram.shapeConnect({
// 	start: { shape: shape1, connector: 'outright' },
// 	end: { shape: shape2, connector: 'inright' }
// });

//
// example restore diagram from data

// /** @type {DiagramData} */
// const diagramData = {
// 	shapes: [
// 		{
// 			templateKey: 'circle',
// 			position: { x: 120, y: 120 },
// 			props: {
// 				text: { textContent: 'Title1' }
// 			}
// 		},
// 		{
// 			templateKey: 'circle',
// 			position: { x: 220, y: 220 },
// 			props: {
// 				text: { textContent: 'Title2' }
// 			}
// 		},
// 		{
// 			templateKey: 'circle',
// 			position: { x: 320, y: 320 },
// 			props: {
// 				text: { textContent: 'Title3' }
// 			}
// 		}
// 	],
// 	cons: [
// 		{ start: { index: 0, connector: 'outright' }, end: { index: 1, connector: 'inright' } },
// 		{ start: { index: 0, connector: 'outright' }, end: { index: 2, connector: 'inright' } }
// 	]
// };

// for (const con of diagramData.cons) {
// 	if (!diagramData.shapes[con.start.index].ref) {
// 		diagramData.shapes[con.start.index].ref = diagram.shapeAdd(diagramData.shapes[con.start.index]);
// 	}
// 	if (!diagramData.shapes[con.end.index].ref) {
// 		diagramData.shapes[con.end.index].ref = diagram.shapeAdd(diagramData.shapes[con.end.index]);
// 	}
// 	diagram.shapeConnect({
// 		start: { shape: diagramData.shapes[con.start.index].ref, connector: con.start.connector },
// 		end: { shape: diagramData.shapes[con.end.index].ref, connector: con.end.connector }
// 	});
// }
// for (const shape of diagramData.shapes) {
// 	if (!shape.ref) { diagram.shapeAdd(shape); }
// }
