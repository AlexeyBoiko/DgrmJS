import { evtCanvasPoint } from './evt-canvas-point.js';
import { activeElemFromPoint, moveEvtProc } from './move-evt-proc.js';
import { path } from './path.js';

/**
 * @param {CanvasData} canvasData
 * @param {CircleData} circleData
 */
export function circle(canvasData, circleData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.classList.add('hovertrack');
	svgGrp.innerHTML =
		`<circle data-evt-no data-evt-index="1" r="72" fill="transparent" stroke="red" stroke-width="1" />
		<circle r="48" fill="#ff6600" stroke="#fff" stroke-width="1" class="main" data-text-for="text" />

		<text data-key="text" data-line-height="20" data-vertical-middle="10" x="0" y="0" text-anchor="middle" style="pointer-events: none;"
			alignment-baseline="central" fill="#fff">&nbsp;</text>

		<circle data-connect="outright" class="hovertrack" data-evt-index="2" r="10" cx="48" cy="0" />
		<circle data-connect="outleft" class="hovertrack" data-evt-index="2" r="10" cx="-48" cy="0" />
		<circle data-connect="outbottom" class="hovertrack" data-evt-index="2" r="10" cx="0" cy="48" />
		<circle data-connect="outtop" class="hovertrack" data-evt-index="2" r="10" cx="0" cy="-48" />`;

	/** @type {ConnectorsData} */
	const connectorsInnerPosition = {
		outright: { dir: 'right', position: { x: 48, y: 0 } },
		outleft: { dir: 'left', position: { x: -48, y: 0 } },
		outbottom: { dir: 'bottom', position: { x: 0, y: 48 } },
		outtop: { dir: 'top', position: { x: 0, y: -48 } }
	};

	shapeEvtProc(canvasData, svgGrp, circleData.position, connectorsInnerPosition);

	return svgGrp;
}

/**
 * @param {CanvasData} canvasData
 * @param {SVGGraphicsElement} svgGrp
 * @param {Point} shapePosition
 * @param {ConnectorsData} connectorsInnerPosition
 */
function shapeEvtProc(canvasData, svgGrp, shapePosition, connectorsInnerPosition) {
	/** @type {ConnectorsData} */
	const connectorsData = JSON.parse(JSON.stringify(connectorsInnerPosition));

	/** @type { Set<{draw():void}> } */
	const paths = new Set();

	function draw() {
		svgGrp.style.transform = `translate(${shapePosition.x}px, ${shapePosition.y}px)`;

		// paths
		for (const connectorDataKey in connectorsInnerPosition) {
			connectorsData[connectorDataKey].position = {
				x: connectorsInnerPosition[connectorDataKey].position.x + shapePosition.x,
				y: connectorsInnerPosition[connectorDataKey].position.y + shapePosition.y
			};
		}

		for (const path of paths) {
			path.draw();
		}
	};
	draw();

	const reset = moveEvtProc(
		svgGrp,
		canvasData,
		shapePosition,
		// onMoveStart
		evt => {
			const connectorKey = activeElemFromPoint(evt).getAttribute('data-connect');
			if (connectorKey) {
				reset();
				svgGrp.classList.remove('select');

				const pathShape = path(canvasData, thisShape, {
					start: connectorsData[connectorKey],
					end: {
						dir: reversDir(connectorsData[connectorKey].dir),
						position: evtCanvasPoint(canvasData, evt)
					}
				});
				svgGrp.parentNode.append(pathShape.elem);
				pathShape.setPointerCapture(evt.pointerId);

				paths.add(pathShape);
			}
		},
		// onMove
		() => {
			svgGrp.classList.remove('select');
			draw();
		},
		// onMoveEnd
		_ => {
			placeToCell(shapePosition, canvasData.cell);
			draw();
		},
		// onClick
		() => {
			svgGrp.classList.add('select');
		},
		// onOutdown
		() => {
			svgGrp.classList.remove('select');
		});

	/** @type {Shape} */
	const thisShape = {
		/**
		 * @param {string} connectorKey
		 * @param {Path} pathShape
		 */
		pathAdd: function(connectorKey, pathShape) {
			pathShape.data.end = connectorsData[connectorKey];
			paths.add(pathShape);
			pathShape.draw();
		},

		/** @param {Path} pathShape */
		pathDel: function(pathShape) {
			paths.delete(pathShape);
		}
	};

	svgGrp[ShapeSmbl] = thisShape;
}

/**
 * @param {Point} shapePosition
 * @param {number} cell
 */
function placeToCell(shapePosition, cell) {
	const cellSizeHalf = cell / 2;
	function placeToCell(coordinate) {
		const coor = (Math.round(coordinate / cell) * cell);
		return (coordinate - coor > 0) ? coor + cellSizeHalf : coor - cellSizeHalf;
	}

	shapePosition.x = placeToCell(shapePosition.x);
	shapePosition.y = placeToCell(shapePosition.y);
}

/**
 * @param {PathDir} pathDir
 * @return {PathDir}
 */
function reversDir(pathDir) {
	return pathDir === 'left'
		? 'right'
		: pathDir === 'right'
			? 'left'
			: pathDir === 'top' ? 'bottom' : 'top';
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {position: Point, title?: string} } CircleData */
/** @typedef { {position:Point, scale:number, cell:number} } CanvasData */

/** @typedef { 'left' | 'right' | 'top' | 'bottom' } PathDir */
/** @typedef { {position: Point, dir: PathDir} } PathEnd */
/** @typedef { Object.<string, PathEnd> } ConnectorsData */

/**
 * @typedef {{
 * pathAdd(connectorKey:string, pathShape:Path):void
 * pathDel(pathShape:Path):void
 * }} Shape
 */

export const ShapeSmbl = Symbol('shape');
/** @typedef {Element & { [ShapeSmbl]?: Shape }} DgrmElement */
/** @typedef {import('./path.js').Path} Path */
