import { svgDiagramCreate } from './svg-diagram-factory.js';
import { connectorEqual } from './index-helpers.js';
import { serialize } from './serialize/serialize.js';
import { SvgShapeTextEditorDecorator } from './diagram-extensions/svg-shape-texteditor-decorator.js';
import { pngSave } from './diagram-extensions/png-save.js';
import { pngDgrmChunkGet, pngOpen } from './diagram-extensions/png-open.js';

// elements
import './elements/menu-shape/menu-shape.js';
import './elements/file-options/file-options.js';

//
// bind

/** @type {IFileOptions} */(document.getElementById('file-options'))
	.on('dgrmGenerateLink', generateLink)
	.on('dgrmSave', save)
	.on('dgrmOpen', open);

/** @type {IMenuShape} */(document.getElementById('menu-shape'))
	.on('shapeDragOut', shapeAddingDragOut)
	.on('shapeMove', shapeAddingMoveMobile);

/** @type{SVGSVGElement} */
// @ts-ignore
const svg = document.getElementById('diagram');
const diagram = svgDiagramCreate(
	svg,
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

//
// diagram data

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

/**
 * @param {IDiagramShape} shape
 */
function shapeDel(shape) {
	shapeData.delete(shape);
	connectors = connectors
		.filter(el => el.start.shape !== shape && el.end.shape !== shape);

	diagram.shapeDel(shape);
}

//
// adding shape with drag

/** @type {Point} */ let addingShapeCenter;
/** @type {IDiagramShape} */ let addingShape;
/** @type {Point} */ let shapeAddingCanvasPositionForMobile; // needed only for mobile

/** @param { CustomEvent<IMenuShapeDragOutEventDetail> } evt */
function shapeAddingDragOut(evt) {
	const point = svg.querySelector(`[data-templ='${evt.detail.shape}']`).getAttribute('data-center').split(',');
	addingShapeCenter = { x: parseFloat(point[0]), y: parseFloat(point[1]) };
	addingShape = shapeAdd({
		templateKey: evt.detail.shape,
		// shapePosition
		position: { x: evt.detail.clientX - addingShapeCenter.x, y: evt.detail.clientY - addingShapeCenter.y },
		detail: 'Title'
	});

	diagram.shapeSetMoving(
		addingShape,
		// cursorPosition
		{ x: evt.detail.clientX, y: evt.detail.clientY });

	// remember canvas position for mobile
	const shapePosition = addingShape.postionGet();
	shapeAddingCanvasPositionForMobile = {
		x: evt.detail.clientX - addingShapeCenter.x - shapePosition.x,
		y: evt.detail.clientY - addingShapeCenter.y - shapePosition.y
	};
}

/**
 * fire only on mobile
 * @param {CustomEvent<IMenuShapeMoveEventDetail>} evt
 */
function shapeAddingMoveMobile(evt) {
	addingShape.update({
		position: {
			x: evt.detail.clientX - addingShapeCenter.x - shapeAddingCanvasPositionForMobile.x,
			y: evt.detail.clientY - addingShapeCenter.y - shapeAddingCanvasPositionForMobile.y
		}
	});
}

//
// diagram events

/** @param { CustomEvent<ISvgPresenterShapeEventUpdateDetail>} evt */
function update(evt) {
	shapeData.get(evt.detail.target).detail = /** @type {string} */ (evt.detail.props.text.textContent);
}

/** @param { CustomEvent<ISvgPresenterShapeEventUpdateDetail>} evt */
function del(evt) {
	shapeDel(evt.detail.target);
}

/** @param { CustomEvent<IDiagramEventConnectDetail> } evt */
function connect(evt) {
	connectors.push(evt.detail);
}

/** @param { CustomEvent<IDiagramEventConnectDetail> } evt */
function disconnect(evt) {
	connectors.splice(connectors.findIndex(el => connectorEqual(el, evt.detail)), 1);
}

//
// save/open/serialize

function save() {
	if (!shapeData.size) { alert('Nothing to save'); return; }

	pngSave(svg, serialize(shapeData, connectors));
}

// open: from file dialo and drag'n'drop file to browser

const cantOpenMsg = 'File cannot be read. Use the exact image file you got from the application.';
function open() {
	pngOpen(dgrmChunk => {
		if (!dgrmChunk) { alert(cantOpenMsg); return; }
		loadFromJson(dgrmChunk);
	});
}

svg.addEventListener('dragover', evt => { evt.preventDefault(); });
svg.addEventListener('drop', async evt => {
	evt.preventDefault();

	if (evt.dataTransfer?.items?.length !== 1 ||
		evt.dataTransfer.items[0].kind !== 'file' ||
		evt.dataTransfer.items[0].type !== 'image/png') {
		alert(cantOpenMsg); return;
	}

	const dgrmChunk = await pngDgrmChunkGet(evt.dataTransfer.items[0].getAsFile());
	if (!dgrmChunk) { alert(cantOpenMsg); return; }

	loadFromJson(dgrmChunk);
});

async function generateLink() {
	if (!shapeData.size) { alert('Nothing to save'); return; }

	const url = new URL(window.location.href);
	url.hash = encodeURIComponent(serialize(shapeData, connectors));
	await navigator.clipboard.writeText(url.toString());
	alert('Link to diagram copied to clipboard');
}

if (window.location.hash) {
	createFromJson(decodeURIComponent(window.location.hash.substring(1)));
	history.replaceState(null, null, ' ');
}

/**
 * @param {string} json
 */
function loadFromJson(json) {
	shapeData.forEach((_, shape) => shapeDel(shape));
	createFromJson(json);
}

/**
 * @param {string} json
 */
function createFromJson(json) {
	/** @type {SerializeData} */
	const data = JSON.parse(json);

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
}
