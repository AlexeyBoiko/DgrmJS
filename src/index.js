import { svgDiagramCreate } from './diagram/svg-presenter/svg-diagram-factory.js';
import { connectorEqual, textContentTrim } from './index-helpers.js';
import { serialize } from './serialize/serialize.js';

// elements
import './elements/menu/menu.js';
import './elements/shape-settings/shape-settings.js';

//
// html bind

const panel = document.getElementById('panel');

/** @type {IMenu} */(document.getElementById('menu'))
	.on('shapeAddByKey', /** @param {CustomEvent<string>} evt */ evt => shapeAddByKey(evt.detail))
	.on('generateLink', generateLink)
	.on('settingsToggle', settingsToggle);

const shapeSettings = /** @type {IShapeSettings} */(document.getElementById('shape-settings'))
	.on('del', shapeDel)
	.on('type', /** @param {CustomEvent<string>} evt */ evt => shapeUpdate(evt.detail));

//
// logic

/** @type {Map<IDiagramShape, SerializeShape<string>>} */
const shapeData = new Map();

/** @type {IDiagramEventConnectDetail[]} */
let connectors = [];

/** @type {IDiagramShape} */
let selectedShape;

/** @ts-ignore */
const diagram = svgDiagramCreate(document.getElementById('diagram'))
	.on('select', /** @param { CustomEvent<IDiagramEventSelectDetail> } evt */ evt => shapeSelect(evt.detail.target))
	.on('connect', /** @param { CustomEvent<IDiagramEventConnectDetail> } evt */ evt => connectors.push(evt.detail))
	.on('disconnect', /** @param { CustomEvent<IDiagramEventConnectDetail> } evt */ evt =>
		connectors.splice(connectors.findIndex(el => connectorEqual(el, evt.detail)), 1));

/**
 * @param {SerializeShape} param
 * @returns {IDiagramShape}
 * */
function shapeAdd(param) {
	param.props = {
		text: { textContent: textContentTrim(param.templateKey, param.detail) }
	};
	const shape = diagram.shapeAdd(param);
	shapeData.set(shape, { templateKey: param.templateKey, detail: param.detail });
	return shape;
}

/** @param {string} templateKey */
function shapeAddByKey(templateKey) {
	shapeAdd({
		templateKey: templateKey,
		position: { x: 120, y: 120 },
		detail: 'Title'
	});
}

function shapeDel() {
	if (!selectedShape) { return; }

	shapeData.delete(selectedShape);
	connectors = connectors
		.filter(el => el.start.shape !== selectedShape && el.end.shape !== selectedShape);

	diagram.shapeDel(selectedShape);
	shapeSelect(null);
}

/**
 * @param {string} text
 */
function shapeUpdate(text) {
	if (!selectedShape) { return; }

	shapeData.get(selectedShape).detail = text;
	selectedShape.update({
		props: {
			text: {
				textContent: textContentTrim(shapeData.get(selectedShape).templateKey, text)
			}
		}
	});
}

/** @param {IDiagramShape} shape */
function shapeSelect(shape) {
	if (shape && shape.type === 'shape') {
		selectedShape = shape;

		if (shapeData.has(shape)) {
			shapeSettings.update({
				selected: true,
				text: shapeData.get(shape).detail,
				disabled: false
			});
		} else {
			shapeSettings.update({
				selected: true,
				text: null,
				disabled: true
			});
		}
	} else {
		selectedShape = null;
		shapeSettings.update({
			selected: false
		});
	}
}

function settingsToggle() {
	if (panel.classList.contains('open')) {
		panel.classList.remove('open');
	} else {
		panel.classList.add('open');
	}
}

function generateLink() {
	const dataStr = serialize(shapeData, connectors);
	if (dataStr) {
		const url = new URL(window.location.href);
		url.hash = encodeURIComponent(dataStr);
		navigator.clipboard.writeText(`${url.toString()}`).then(_ => alert('Link to diagram copied to clipboard'));
		return;
	}

	alert('Nothing to save');
}

if (window.location.hash) {
	/** @type {SerializeData} */
	const data = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));

	if (data.s && data.s.length > 0) {
		const shapes = [];
		for (const shape of data.s) {
			shapes.push(shapeAdd(shape));
		}

		if (data.c && data.c.length > 0) {
			for (const con of data.c) {
				diagram.shapeConnect({
					start: { shape: shapes[con.s.i], connector: con.s.c },
					end: { shape: shapes[con.e.i], connector: con.e.c }
				});
			}
		}
	}

	history.replaceState(null, null, ' ');
}

//
// example cancel connect/disconnect

// diagram
// 	.on('connect', evt => { evt.preventDefault(); })
// 	.on('disconnect', evt => { evt.preventDefault(); });

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
