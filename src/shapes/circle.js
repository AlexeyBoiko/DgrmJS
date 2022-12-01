import { evtCanvasPoint } from '../infrastructure/evt-canvas-point.js';
import { moveEvtProc } from '../infrastructure/move-evt-proc.js';
import { textareaCreate } from '../infrastructure/svg-text-area.js';
import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { path } from './path.js';

/**
 * @param {CanvasData} canvasData
 * @param {CircleData} circleData
 */
export function circle(canvasData, circleData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.classList.add('hovertrack');
	svgGrp.innerHTML = `
		<circle data-key="outer" data-evt-no data-evt-index="1" r="72" fill="transparent" stroke="red" stroke-width="1" />
		<circle data-key="main" r="48" fill="#ff6600" stroke="#fff" stroke-width="1" />

		<text data-key="text" x="0" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>

		<circle data-key="outright" data-connect="outright" class="hovertrack" data-evt-index="2" r="10" cx="48" cy="0" />
		<circle data-key="outleft" data-connect="outleft" class="hovertrack" data-evt-index="2" r="10" cx="-48" cy="0" />
		<circle data-key="outbottom" data-connect="outbottom" class="hovertrack" data-evt-index="2" r="10" cx="0" cy="48" />
		<circle data-key="outtop" data-connect="outtop" class="hovertrack" data-evt-index="2" r="10" cx="0" cy="-48" />`;

	/**
	 * @template T
	 * @param {string} key
	 * @returns T
	 */
	const child = (key) => /** @type {T} */(svgGrp.querySelector(`[data-key="${key}"]`));

	const connectorsInnerPosition = {
		outright: { dir: 'right', position: { x: 48, y: 0 } },
		outleft: { dir: 'left', position: { x: -48, y: 0 } },
		outbottom: { dir: 'bottom', position: { x: 0, y: 48 } },
		outtop: { dir: 'top', position: { x: 0, y: -48 } }
	};

	function resize() {
		connectorsInnerPosition.outright.position.x = circleData.r;
		connectorsInnerPosition.outleft.position.x = -circleData.r;
		connectorsInnerPosition.outbottom.position.y = circleData.r;
		connectorsInnerPosition.outtop.position.y = -circleData.r;

		for (const connectorKey in connectorsInnerPosition) {
			crclPos(child(connectorKey), connectorsInnerPosition[connectorKey].position);
		}

		crclR(child('outer'), circleData.r + 24);
		crclR(child('main'), circleData.r);
	}
	if (!!circleData.r && circleData.r !== 48) { resize(); }

	svgTextDraw(child('text'), circleData.title || '', 0);
	shapeEvtProc(canvasData, svgGrp, circleData.position, /** @type {ConnectorsData} */(connectorsInnerPosition),
		// onEdit
		() => {
			textareaCreate(child('text'), 0, circleData.title || '',
				// onchange
				_ => {},
				// onblur
				_ => {}
			);
		}
	);

	return svgGrp;
}

/**
 * @param {SVGCircleElement} crcl
 * @param {number} r
 */
function crclR(crcl, r) { crcl.r.baseVal.value = r; }

/**
 * @param {SVGCircleElement} crcl
 * @param {Point} pos
 */
function crclPos(crcl, pos) { crcl.cx.baseVal.value = pos.x; crcl.cy.baseVal.value = pos.y; }

/**
 * @param {CanvasData} canvasData
 * @param {SVGGraphicsElement} svgGrp
 * @param {Point} shapePosition
 * @param {ConnectorsData} connectorsInnerPosition
 * @param {{():void}} onEdit
 */
function shapeEvtProc(canvasData, svgGrp, shapePosition, connectorsInnerPosition, onEdit) {
	/** @type {ConnectorsData} */
	const connectorsData = JSON.parse(JSON.stringify(connectorsInnerPosition));

	/** @type { Set<{draw():void}> } */
	const paths = new Set();

	function draw() {
		svgGrp.style.transform = `translate(${shapePosition.x}px, ${shapePosition.y}px)`;

		// paths
		for (const connectorKey in connectorsInnerPosition) {
			connectorsData[connectorKey].position = {
				x: connectorsInnerPosition[connectorKey].position.x + shapePosition.x,
				y: connectorsInnerPosition[connectorKey].position.y + shapePosition.y
			};
		}

		for (const path of paths) {
			path.draw();
		}
	};
	draw();

	const classAdd = cl => svgGrp.classList.add(cl);
	const classDel = cl => svgGrp.classList.remove(cl);
	const classHas = cl => svgGrp.classList.contains(cl);
	function unSelect() {
		classDel('select');
		classDel('highlight');
	}

	const reset = moveEvtProc(
		svgGrp,
		canvasData,
		shapePosition,
		// onMoveStart
		/** @param {PointerEvent & { target: Element} } evt */
		evt => {
			unSelect();

			const connectorKey = evt.target.getAttribute('data-connect');
			if (connectorKey) {
				reset();
				unSelect();

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
		draw,
		// onMoveEnd
		_ => {
			placeToCell(shapePosition, canvasData.cell);
			draw();
		},
		// onClick
		() => {
			if (classHas('highlight')) { return; }

			if (classHas('select') && !classHas('highlight')) {
				classDel('select');
				classAdd('highlight');
				// edit mode
				onEdit();
				return;
			}

			classAdd('select');
		},
		// onOutdown
		unSelect);

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
/** @typedef { {position: Point, title?: string, r?:number} } CircleData */
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
