import { fileOpen, fileSave } from '../diagram-extensions/infrastructure/file-utils.js';
import { AppDiagramSerializable } from './app-diagram-serializable.js';

// elements
import './elements/menu-shape/menu-shape.js';
import './elements/file-options/file-options.js';

//
// bind

// const tip = document.getElementById('tip');

/** @type{SVGSVGElement} */
// @ts-ignore
const svg = document.getElementById('diagram');

/** @type {IAppDiagramSerializable & IAppPngExportable} */
// @ts-ignore
const diagram = new AppDiagramSerializable(svg);

/** @type {IFileOptions} */(document.getElementById('file-options'))
	.on('dgrmNew', _ => diagram.clear())
	.on('dgrmGenerateLink', generateLink)
	.on('dgrmSave', save)
	.on('dgrmOpen', open);

/** @type {IMenuShape} */(document.getElementById('menu-shape'))
	.on('shapeDragOut', shapeAddingDragOut)
	.on('shapeMove', shapeAddingMoveMobile);

//
// logic

//
// adding shape with drag

/** @type {Point} */ let addingShapeCenter;
/** @type {IDiagramShape} */ let addingShape;
/** @type {Point} */ let shapeAddingCanvasPositionForMobile; // needed only for mobile

/** @param { CustomEvent<IMenuShapeDragOutEventDetail> } evt */
function shapeAddingDragOut(evt) {
	const point = svg.querySelector(`[data-templ='${evt.detail.shape}']`).getAttribute('data-center').split(',');
	addingShapeCenter = { x: parseFloat(point[0]), y: parseFloat(point[1]) };
	addingShape = diagram.shapeAdd({
		templateKey: evt.detail.shape,
		position: { x: evt.detail.clientX - addingShapeCenter.x, y: evt.detail.clientY - addingShapeCenter.y },
		props: {
			text: { textContent: 'Title' }
		}
	});

	diagram.shapeSetMoving(
		addingShape,
		// cursorPosition
		{ x: evt.detail.clientX, y: evt.detail.clientY });

	// remember canvas position for mobile
	const shapePosition = addingShape.positionGet();
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
	diagram.shapeUpdate(
		addingShape,
		{
			position: {
				x: evt.detail.clientX - addingShapeCenter.x - shapeAddingCanvasPositionForMobile.x,
				y: evt.detail.clientY - addingShapeCenter.y - shapeAddingCanvasPositionForMobile.y
			}
		});
}

//
// file operations: new/save/open/serialize

function save() {
	diagram.pngCreate(png => {
		if (!png) { alert('Diagram is empty'); return; }
		fileSave(png, 'dgrm.png');
	});
}

// open: from file dialog and drag'n'drop file to browser

const cantOpenMsg = 'File cannot be read. Use the exact image file you got from the application.';
function open() {
	fileOpen('.png', async png => {
		if (!await diagram.pngLoad(png)) { alert(cantOpenMsg); }
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

	if (!await diagram.pngLoad(evt.dataTransfer.items[0].getAsFile())) { alert(cantOpenMsg); }
});

async function generateLink() {
	const diagramData = diagram.dataGet();
	if (!diagramData) { alert('Diagram is empty'); return; }

	const url = new URL(window.location.href);
	url.hash = encodeURIComponent(JSON.stringify(diagramData));
	await navigator.clipboard.writeText(url.toString());
	alert('Link to diagram copied to clipboard');
}

if (window.location.hash) {
	diagram.dataSet(JSON.parse(decodeURIComponent(window.location.hash.substring(1))));
	history.replaceState(null, null, ' ');
}
