import { child, classAdd, classDel, classHas, listen, listenDel, svgEl } from '../infrastructure/util.js';
import { moveEvtProc, movementApplay, priorityElemFromPoint } from '../infrastructure/move-evt-proc.js';
import { settingsPnlCreate } from './shape-settings.js';
import { pointInCanvas } from '../infrastructure/move-scale-applay.js';
import { ShapeSmbl } from './shape-smbl.js';
import { placeToCell } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {{position:Point, scale:number, cell: number}} canvasData
 * @param {PathData} pathData
 */
export function path(svg, canvasData, pathData) {
	const svgGrp = svgEl('g', `
		<path data-key="outer" d="M0 0" stroke="transparent" stroke-width="20" fill="none" />
		<path data-key="path" class="path" d="M0 0" stroke="#495057" stroke-width="1.8" fill="none" style="pointer-events: none;" />
		<path data-key="selected" d="M0 0" stroke="transparent" stroke-width="10" fill="none" style="pointer-events: none;" />
		<g data-key="start">
			<circle data-evt-index="1" class="path-end" r="10" stroke-width="0" fill="transparent" />
		</g>
		<g data-key="end">
			<circle data-evt-index="1" class="path-end" r="10" stroke-width="0" fill="transparent" />
			<path class="path" d="M-7 7 l 7 -7 l -7 -7" stroke="#495057" stroke-width="1.8" fill="none" style="pointer-events: none;"></path>
		</g>`);

	const paths = childs(svgGrp, 'path', 'outer', 'selected');

	/** @type {SVGElement} */const start = child(svgGrp, 'start');
	/** @type {SVGElement} */const end = child(svgGrp, 'end');

	function draw() {
		if (!pathData.s.shape || !pathData.e.shape) {
			const endDir = dirByAngle(pathData.s.data.position, pathData.e.data.position);
			if (!pathData.e.shape) { pathData.e.data.dir = endDir; }
			if (!pathData.s.shape) { pathData.s.data.dir = dirReverse(endDir); }
		}

		// path
		const dAttr = pathCalc(pathData);
		paths.forEach(pp => pp.setAttribute('d', dAttr));

		// ends
		endDraw(start, pathData.s.data);
		endDraw(end, pathData.e.data);
	}

	/** @param {PathEnd} pathEnd */
	function pathDelFromShape(pathEnd) { shapeObj(pathEnd.shape)?.pathDel(svgGrp); }

	/** @param {PathEnd} pathEnd */
	function pathAddToShape(pathEnd) {
		if (pathEnd.shape) {
			pathEnd.data = shapeObj(pathEnd.shape).pathAdd(pathEnd.shape.connectorKey, svgGrp);
		}
	};

	/** @type { {position:(bottomX:number, bottomY:number)=>void, del:()=>void} } */
	let settingsPnl;
	function del() {
		settingsPnl?.del(); settingsPnl = null;
		reset();
		pathDelFromShape(pathData.s);
		pathDelFromShape(pathData.e);
		svgGrp.remove();
	}

	/** @param {PointerEvent} evt */
	function select(evt) {
		// in edit mode
		if (classHas(svgGrp, 'select') && settingsPnl) { return; }

		// to edit mode
		if (classHas(svgGrp, 'select') && !settingsPnl) {
			settingsPnl = settingsPnlCreate(evt.clientX - 10, evt.clientY - 10, evt => {
				switch (evt.detail.cmd) {
					case 'style':
						classDel(svgGrp, pathData.style);
						classAdd(svgGrp, evt.detail.arg);
						pathData.style = evt.detail.arg;
						break;
					case 'del':
						del();
						break;
				}
			});
			return;
		}

		// to select mode
		classAdd(svgGrp, 'select');
		start.firstElementChild.setAttribute('data-evt-index', '2');
		end.firstElementChild.setAttribute('data-evt-index', '2');
	};

	/** @type { {():void} } */
	let hoverEmulateDispose;
	function unSelect() {
		classDel(svgGrp, 'select');
		start.firstElementChild.setAttribute('data-evt-index', '1');
		end.firstElementChild.setAttribute('data-evt-index', '1');

		settingsPnl?.del();
		settingsPnl = null;

		if (hoverEmulateDispose) {
			hoverEmulateDispose();
			hoverEmulateDispose = null;
			svgGrp.style.pointerEvents = 'unset';
		}
	};

	/** @type {'s'|'e'} */
	let movedEnd;

	const reset = moveEvtProc(
		svg,
		svgGrp,
		canvasData,
		// data.end.position,
		{
			get x() { return pathData[movedEnd]?.data.position.x; },
			set x(val) { if (movedEnd) { pathData[movedEnd].data.position.x = val; } },

			get y() { return pathData[movedEnd]?.data.position.y; },
			set y(val) { if (movedEnd) { pathData[movedEnd].data.position.y = val; } }
		},
		// onMoveStart
		/** @param {PointerEvent & { target: Element} } evt */ evt => {
			unSelect();

			movedEnd = end.contains(evt.target) ? 'e' : start.contains(evt.target) ? 's' : null;

			//
			// move whole path
			if (!movedEnd) {
				return;
			}

			//
			// move path end

			// disconnect from shape
			if (pathData[movedEnd].shape) {
				if (pathData[movedEnd].shape.shapeEl !== pathData[movedEnd === 's' ? 'e' : 's'].shape?.shapeEl) {
					pathDelFromShape(pathData[movedEnd]);
				}
				pathData[movedEnd].shape = null;
				pathData[movedEnd].data = {
					dir: pathData[movedEnd].data.dir,
					position: pointInCanvas(canvasData, evt.clientX, evt.clientY)
				};
			}

			// hover emulation - start
			svgGrp.style.pointerEvents = 'none';
			hoverEmulateDispose = hoverEmulate(svgGrp.parentElement);
		},
		// onMove
		/** @param {PointerEventFixMovement} evt */
		evt => {
			if (!movedEnd) {
				moveWholePath(canvasData, pathData, draw, evt);
			} else {
				draw();
			}
		},
		// onMoveEnd
		evt => {
			if (!movedEnd) {
				moveWholePathFinish(canvasData, pathData, draw);
			} else {
				// connect to shape
				const elemFromPoint = priorityElemFromPoint(evt);
				const connectorKey = elemFromPoint?.getAttribute('data-connect');
				if (connectorKey) {
					// @ts-ignore
					pathData[movedEnd].shape = { shapeEl: elemFromPoint.parentElement, connectorKey };
					pathAddToShape(pathData[movedEnd]);
				} else {
					placeToCell(pathData[movedEnd].data.position, canvasData.cell);
				}
				draw();
			}

			// hover emulation - end
			unSelect();
		},
		// onClick
		select,
		// onOutdown
		unSelect
	);

	svgGrp[PathSmbl] = {
		draw,
		/** @param {PointerEventInit} evt */
		pointerCapture: evt => end.dispatchEvent(new PointerEvent('pointerdown', evt)),
		del,
		data: pathData
	};

	if (pathData.style) { classAdd(svgGrp, pathData.style); }
	pathAddToShape(pathData.s);
	pathAddToShape(pathData.e);
	draw();

	return svgGrp;
}

/**
 * @param {{scale:number}} canvasData
 * @param {PathData} pathData
 * @param {{():void}} draw
 * @param {PointerEventFixMovement} evt
 */
function moveWholePath(canvasData, pathData, draw, evt) {
	/** @param {Point} point */
	const move = point => movementApplay(point, canvasData.scale, evt);
	moveShapeOrEnd(pathData.s, move);
	moveShapeOrEnd(pathData.e, move);

	// if any shape connected - shape will draw connected path
	if (!pathData.s.shape && !pathData.e.shape) { draw(); }
}

/**
 * @param {{cell:number}} canvasData
 * @param {PathData} pathData
 * @param {{():void}} draw
 */
function moveWholePathFinish(canvasData, pathData, draw) {
	/** @param {Point} point */
	const toCell = point => placeToCell(point, canvasData.cell);
	moveShapeOrEnd(pathData.s, toCell);
	moveShapeOrEnd(pathData.e, toCell);

	if (!pathData.s.shape || !pathData.e.shape) { draw(); }
}

/**
 * applay moveFn to connected shape or to path end point
 * @param {PathEnd} pathEnd, @param {{(point:Point):void}} moveFn */
function moveShapeOrEnd(pathEnd, moveFn) {
	if (pathEnd.shape) {
		moveFn(shapeObj(pathEnd.shape).data.position);
		shapeObj(pathEnd.shape).drawPosition();
	} else {
		moveFn(pathEnd.data.position);
	}
}

/** @param {PathConnectedShape} pathConnectedShape */
const shapeObj = pathConnectedShape => pathConnectedShape?.shapeEl[ShapeSmbl];

/** @param {SVGElement} endEl, @param {{position: Point, dir: Dir}} endData */
function endDraw(endEl, endData) {
	endEl.style.transform = `translate(${endData.position.x}px, ${endData.position.y}px) rotate(${arrowAngle(endData.dir)}deg)`;
}

/** @param {Dir} dir */
const arrowAngle = dir => dir === 'right'
	? 180
	: dir === 'left'
		? 0
		: dir === 'bottom'
			? 270
			: 90;

/** @param {Dir} dir, @return {Dir} */
export const dirReverse = dir =>	dir === 'left'
	? 'right'
	: dir === 'right'
		? 'left'
		: dir === 'top' ? 'bottom' : 'top';

/** @param {Point} s, @param {Point} e, @return {Dir} */
function dirByAngle(s, e) {
	const rad = Math.atan2(e.y - s.y, e.x - s.x);
	return numInRangeIncludeEnds(rad, -0.8, 0.8)
		? 'left'
		: numInRangeIncludeEnds(rad, 0.8, 2.4)
			? 'top'
			: numInRangeIncludeEnds(rad, 2.4, 3.2) || numInRangeIncludeEnds(rad, -3.2, -2.4) ? 'right' : 'bottom';
}

/** @param {PathData} data */
function pathCalc(data) {
	let coef = Math.hypot(
		data.s.data.position.x - data.e.data.position.x,
		data.s.data.position.y - data.e.data.position.y) * 0.5;
	coef = coef > 70
		? 70
		: coef < 15 ? 15 : coef;

	/** @param {PathEndData} pathEnd */
	function cx(pathEnd) {
		return (pathEnd.dir === 'right' || pathEnd.dir === 'left')
			? pathEnd.dir === 'right' ? pathEnd.position.x + coef : pathEnd.position.x - coef
			: pathEnd.position.x;
	}

	/** @param {PathEndData} pathEnd */
	function cy(pathEnd) {
		return (pathEnd.dir === 'right' || pathEnd.dir === 'left')
			? pathEnd.position.y
			: pathEnd.dir === 'bottom' ? pathEnd.position.y + coef : pathEnd.position.y - coef;
	}

	return `M ${data.s.data.position.x} ${data.s.data.position.y} C ${cx(data.s.data)} ${cy(data.s.data)}, ` +
		`${cx(data.e.data)} ${cy(data.e.data)}, ${data.e.data.position.x} ${data.e.data.position.y}`;
}

/** @param {Element} element */
function hoverEmulate(element) {
	/** @type {Element} */
	let elemFromPoint = null;

	/** @param {PointerEvent} evt */
	function move(evt) {
		const elemFromPointNew = priorityElemFromPoint(evt);
		if (elemFromPoint !== elemFromPointNew) {
			if (classHas(elemFromPointNew, 'hovertrack')) {
				classAdd(elemFromPointNew, 'hover');
			}
			let parentHover = false;
			if (classHas(elemFromPointNew?.parentElement, 'hovertrack')) {
				classAdd(elemFromPointNew.parentElement, 'hover');
				parentHover = true;
			}

			classDel(elemFromPoint, 'hover');
			if (elemFromPoint?.parentElement !== elemFromPointNew?.parentElement || !parentHover) {
				classDel(elemFromPoint?.parentElement, 'hover');
			}

			elemFromPoint = elemFromPointNew;
		}
	}

	listen(element, 'pointermove', move);
	// dispose fn
	return function() {
		listenDel(element, 'pointermove', move);
		classDel(elemFromPoint, 'hover');
		classDel(elemFromPoint?.parentElement, 'hover');
		elemFromPoint = null;
	};
}

/** @param {Element} el, @param  {...string} keys */
const childs = (el, ...keys) => keys.map(kk => child(el, kk));

/** @param {number} num, @param {number} a, @param {number} b */
const numInRangeIncludeEnds = (num, a, b) => a <= num && num <= b;

/** @typedef { {x:number, y:number} } Point */
/** @typedef { 'left' | 'right' | 'top' | 'bottom' } Dir */
/** @typedef { {shapeEl: ShapeElement, connectorKey: string} } PathConnectedShape */
/** @typedef { {position: Point, dir: Dir}} PathEndData */
/** @typedef { {shape?:PathConnectedShape, data?:PathEndData} } PathEnd */
/**
@typedef {{
	s: PathEnd,
	e: PathEnd,
	style?: string,
}} PathData
*/
/** @typedef { {shape?:PathConnectedShape, data?:PathEndData, oppositeShape?:PathConnectedShape, type:number} } MovedEnd */
/**
@typedef {{
	draw():void
	pointerCapture:(evt:PointerEventInit)=>void
	del():void
	data: PathData
}} Path
 */
export const PathSmbl = Symbol('path');
/** @typedef {SVGGraphicsElement & { [PathSmbl]?: Path }} PathElement */

/** @typedef { import('./shape-evt-proc.js').ShapeElement } ShapeElement */
/** @typedef { import('./shape-evt-proc.js').Shape } Shape */
/** @typedef { import('../infrastructure/move-evt-mobile-fix.js').PointerEventFixMovement } PointerEventFixMovement */
