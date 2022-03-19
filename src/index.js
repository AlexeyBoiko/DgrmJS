import { svgDiagramCreate } from './svg-diagram-factory.js';
import { connectorEqual } from './index-helpers.js';
import { serialize } from './serialize/serialize.js';
import { SvgShapeTextEditorDecorator } from './diagram-extensions/shapes/svg-shape-texteditor-decorator.js';

// elements
import './elements/panel/panel.js';

//
// bind

/** @type {IPanel} */(document.getElementById('panel'))
	.on('shapeAddByKey', add)
	.on('generateLink', generateLink);

const diagram = svgDiagramCreate(
	// @ts-ignore
	document.getElementById('diagram'),
	function(shape, param) {
		// the way to add custom logic inside shapes - decorators
		return new SvgShapeTextEditorDecorator(shape, param.createParams.props)
			.on('update', update)
			.on('del', del);
	})
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
	const shape = diagram.shapeAdd(param);
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

/** @param { CustomEvent<IDiagramShapeEventUpdateDetail>} evt */
function del(evt) {
	shapeData.delete(evt.detail.target);
	connectors = connectors
		.filter(el => el.start.shape !== evt.detail.target && el.end.shape !== evt.detail.target);

	diagram.shapeDel(evt.detail.target);
}

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
