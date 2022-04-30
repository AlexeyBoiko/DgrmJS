import { AppDiagramSerializable } from './app-diagram-serializable.js';

// elements
import './elements/menu-shape/menu-shape.js';
import './elements/file-options/file-options.js';

//
// bind

/** @type{SVGSVGElement} */
// @ts-ignore
const svg = document.getElementById('diagram');

/** @type {IAppDiagramSerializable & IAppPngExportable} */
// @ts-ignore
const diagram = new AppDiagramSerializable(svg)
	.on('shapeAdd', _ => document.getElementById('tip')?.remove());

/** @type {IFileOptions} */
(document.getElementById('file-options')).init(diagram);

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

if (window.location.hash) {
	diagram.dataSet(JSON.parse(decodeURIComponent(window.location.hash.substring(1))));
	history.replaceState(null, null, ' ');
}
