import { svgDiagramCreate } from './svg-diagram-factory.js';
import { connectorEqual } from './index-helpers.js';
import { serialize } from './serialize/serialize.js';

// elements
import './elements/panel/panel.js';

//
// bind

/** @type {IPanel} */(document.getElementById('panel'))
	.on('shapeAddByKey', add)
	.on('generateLink', generateLink);

// @ts-ignore
const diagram = svgDiagramCreate(document.getElementById('diagram'))
	// .on('select', evt => console.log(evt))
	.on('connect', connect)
	.on('disconnect', disconnect);

//
// logic

/** @type {Map<IDiagramShape, SerializeShape<string>>} */
const shapeData = new Map();

/** @type {IDiagramEventConnectDetail[]} */
let connectors = [];

/**
 * @param {SerializeShape} param
 * @returns {IDiagramShape}
 */
function shapeAdd(param) {
	param.props = {
		text: { textContent: param.detail }
	};
	const shape = diagram.shapeAdd(param)
		.on('update', update);
		// .on('click', /** @param {PointerEvent & { target: SVGGraphicsElement }} evt */ evt => click(evt, shape));
	shapeData.set(shape, { templateKey: param.templateKey, detail: param.detail });
	return shape;
}

/** @param {CustomEvent<string>} evt */
function add(evt) {
	shapeAdd({
		templateKey: evt.detail,
		position: { x: 120, y: 120 },
		detail: 'Title'
	});
}

/** @param { CustomEvent<IDiagramShapeEventUpdateDetail>} evt */
function update(evt) {
	shapeData.get(evt.detail.target).detail = /** @type {string} */ (evt.detail.props.text.textContent);
}

// /**
//  * @param {PointerEvent & { target: SVGGraphicsElement }} evt
//  * @param {IDiagramShape} shape
//  */
// function click(evt, shape) {
// 	if (evt.target.getAttribute('data-cmd') !== 'del') { return; }

// 	shapeData.delete(shape);
// 	connectors = connectors
// 		.filter(el => el.start.shape !== shape && el.end.shape !== shape);

// 	diagram.shapeDel(shape);
// }

/** @param { CustomEvent<IDiagramEventConnectDetail> } evt */
function connect(evt) {
	connectors.push(evt.detail);
}

/** @param { CustomEvent<IDiagramEventConnectDetail> } evt */
function disconnect(evt) {
	connectors.splice(connectors.findIndex(el => connectorEqual(el, evt.detail)), 1);
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

				connectors.push({
					start: { type: 'connector', key: con.s.c, shape: shapes[con.s.i] },
					end: { type: 'connector', key: con.e.c, shape: shapes[con.e.i] }
				});
			}
		}
	}

	history.replaceState(null, null, ' ');
}
