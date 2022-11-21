import { moveEventProcess } from './move-event-process.js';
import { path } from './path.js';

/**
 * @param {CanvasData} canvasData
 * @param {CircleData} circleData
 */
export function circle(canvasData, circleData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.classList.add('hovertrack');
	svgGrp.innerHTML =
		`<circle data-no-down r="72" fill="transparent" stroke="red" stroke-width="1" />
		<circle r="48" fill="#ff6600" stroke="#fff" stroke-width="1" class="main" data-text-for="text" />

		<text data-key="text" data-line-height="20" data-vertical-middle="10" x="0" y="0" text-anchor="middle" style="pointer-events: none;"
			alignment-baseline="central" fill="#fff">&nbsp;</text>

		<circle data-connect="outright" class="hovertrack" r="10" cx="48" cy="0" />
		<circle data-connect="outleft" class="hovertrack" r="10" cx="-48" cy="0" />
		<circle data-connect="outbottom" class="hovertrack" r="10" cx="0" cy="48" />
		<circle data-connect="outtop" class="hovertrack" r="10" cx="0" cy="-48" />`;

	/** @type {ConnectorsData} */
	const connectorsInnerPosition = {
		outright: { dir: 'right', position: { x: 48, y: 0 } },
		outleft: { dir: 'left', position: { x: -48, y: 0 } },
		outbottom: { dir: 'bottom', position: { x: 0, y: 48 } },
		outtop: { dir: 'top', position: { x: 0, y: -48 } }
	};

	shapeEventsProcess(canvasData, svgGrp, circleData.position, connectorsInnerPosition);

	return svgGrp;
}

/**
 * @param {CanvasData} canvasData
 * @param {SVGGraphicsElement} svgGrp
 * @param {Point} shapePosition
 * @param {ConnectorsData} connectorsInnerPosition
 */
function shapeEventsProcess(canvasData, svgGrp, shapePosition, connectorsInnerPosition) {
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

	const reset = moveEventProcess(
		svgGrp,
		canvasData,
		shapePosition,
		// onMoveStart
		evt => {
			const connectorKey = document.elementFromPoint(evt.clientX, evt.clientY).getAttribute('data-connect');
			if (connectorKey) {
				reset();
				svgGrp.classList.remove('select');

				const pathShape = path(canvasData, {
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
			shapePosition.x = placeToCell(shapePosition.x);
			shapePosition.y = placeToCell(shapePosition.y);
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

	const cellSizeHalf = canvasData.cell / 2;
	/** @param {number} coordinate */
	function placeToCell(coordinate) {
		const coor = (Math.round(coordinate / canvasData.cell) * canvasData.cell);
		return (coordinate - coor > 0) ? coor + cellSizeHalf : coor - cellSizeHalf;
	}

	svgGrp[shape] = {
		/**
		 * @param {string} connectorKey
		 * @param {Path} pathShape
		 */
		pathAdd: function(connectorKey, pathShape) {
			pathShape.data.end = connectorsData[connectorKey];
			paths.add(pathShape);
			pathShape.draw();
		}
	};
}

/**
 * @param { {position:Point, scale:number} } canvasData
 * @param { PointerEvent } evt
 */
function evtCanvasPoint(canvasData, evt) {
	return {
		x: (evt.clientX - canvasData.position.x) / canvasData.scale,
		y: (evt.clientY - canvasData.position.y) / canvasData.scale
	};
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

export const shape = Symbol(0);
/** @typedef {Element & { [shape]?: {pathAdd(connectorKey:string, pathShape:Path):void} }} DgrmElement */
/** @typedef {import('./path.js').Path} Path */
