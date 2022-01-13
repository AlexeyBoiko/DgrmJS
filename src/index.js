import { svgDiagramCreate } from './diagram/svg-presenter/svg-diagram-fuctory.js';

// @ts-ignore
const diagram = svgDiagramCreate(document.getElementById('diagram'));

/** @type {WeakMap<IPresenterElement, string>} */
const shapeData = new WeakMap();

const settingsPanel = document.getElementById('panel');
const textField = /** @type {HTMLInputElement} */(document.getElementById('text'));

// add shape
document.getElementById('menu')
	.querySelectorAll('[data-shape]')
	.forEach(itm => itm.addEventListener('click', /** @param {PointerEvent & { currentTarget: Element }} evt */evt => {
		shapeData.set(diagram.shapeAdd('shape', {
			templateKey: evt.currentTarget.getAttribute('data-shape'),
			position: { x: 120, y: 120 },
			props: {
				text: { textContent: 'Title' }
			}
		}),
		'Title');
	}));

/** @type {IPresenterShape} */
let selecterShape;
/** @param {IPresenterShape} shape */
function selectShape(shape) {
	if (shape && shape.type === 'shape') {
		selecterShape = shape;
		settingsPanel.classList.add('selected');

		const title = shapeData.get(shape);
		if (title) {
			textField.value = title;
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
diagram.on('select', /** @param { CustomEvent<IDiagramEventDetail> } evt */ evt => selectShape(evt.detail.target));

// delete shape
document.getElementById('del').addEventListener('click', _ => {
	if (selecterShape) {
		shapeData.delete(selecterShape);
		diagram.shapeDel({ shape: selecterShape });
		selectShape(null);
	}
});

// toggle menu
document.getElementById('gear').addEventListener('click', _ => {
	if (settingsPanel.classList.contains('open')) {
		settingsPanel.classList.remove('open');
	} else {
		settingsPanel.classList.add('open');
	}
});
