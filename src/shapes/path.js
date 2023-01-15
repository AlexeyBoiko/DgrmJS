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
		if (!pathData.startShape || !pathData.endShape) {
			const endDir = dirByAngle(pathData.start.position, pathData.end.position);
			if (!pathData.endShape) { pathData.end.dir = endDir; }
			if (!pathData.startShape) { pathData.start.dir = dirReverse(endDir); }
		}

		// path
		const dAttr = pathCalc(pathData);
		paths.forEach(pp => pp.setAttribute('d', dAttr));

		// ends
		endDraw(start, pathData.start);
		endDraw(end, pathData.end);
	}

	/** @type { {position:(bottomX:number, bottomY:number)=>void, del:()=>void} } */
	let settingsPnl;
	function del() {
		settingsPnl?.del(); settingsPnl = null;
		reset();
		shapeObj(pathData.startShape)?.pathDel(svgGrp);
		shapeObj(pathData.endShape)?.pathDel(svgGrp);
		svgGrp.remove();
	}

	/** @type {MovedEnd} */
	let movedEnd;

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

	const reset = moveEvtProc(
		svg,
		svgGrp,
		canvasData,
		// data.end.position,
		{
			get x() { return movedEnd.data.position.x; },
			set x(val) { movedEnd.data.position.x = val; },

			get y() { return movedEnd.data.position.y; },
			set y(val) { movedEnd.data.position.y = val; }
		},
		// onMoveStart
		/** @param {PointerEvent & { target: Element} } evt */ evt => {
			unSelect();

			movedEnd = movedEndCreate(pathData, end.contains(evt.target) ? 1 : start.contains(evt.target) ? 0 : null);

			//
			// move whole path
			if (movedEnd.type == null) {
				return;
			}

			//
			// move path end

			// disconnect from shape
			if (movedEnd.shape) {
				if (movedEnd.shape.shapeEl !== movedEnd.oppositeShape?.shapeEl) {
					shapeObj(movedEnd.shape).pathDel(svgGrp);
				}
				movedEnd.shape = null;
				movedEnd.data = {
					dir: movedEnd.data.dir,
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
			if (movedEnd.type == null) {
				moveWholePath(canvasData, pathData, draw, evt);
			} else {
				draw();
			}
		},
		// onMoveEnd
		evt => {
			if (movedEnd.type == null) {
				moveWholePathFinish(canvasData, pathData, draw);
			} else {
				// connect to shape
				const elemFromPoint = priorityElemFromPoint(evt);
				const connectorKey = elemFromPoint?.getAttribute('data-connect');
				if (connectorKey) {
					// @ts-ignore
					movedEnd.shape = { shapeEl: elemFromPoint.parentElement, connectorKey };
					movedEnd.data = shapeObj(movedEnd.shape).pathAdd(connectorKey, svgGrp);
				} else {
					placeToCell(movedEnd.data.position, canvasData.cell);
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
	if (pathData.startShape) { pathData.start = shapeObj(pathData.startShape).pathAdd(pathData.startShape.connectorKey, svgGrp); }
	if (pathData.endShape) { pathData.end = shapeObj(pathData.endShape).pathAdd(pathData.endShape.connectorKey, svgGrp); }
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
	/** @param {PathConnectedShape} shape, @param {PathEnd} pathEnd */
	function move(shape, pathEnd) {
		if (shape) {
			movementApplay(shapeObj(shape).data.position, canvasData.scale, evt);
			shapeObj(shape).drawPosition();
		} else {
			movementApplay(pathEnd.position, canvasData.scale, evt);
		}
	}

	move(pathData.startShape, pathData.start);
	move(pathData.endShape, pathData.end);

	// if any shape connected - shape will draw connected path
	if (!pathData.startShape && !pathData.endShape) { draw(); }
}

/**
 * @param {{cell:number}} canvasData
 * @param {PathData} pathData
 * @param {{():void}} draw
 */
function moveWholePathFinish(canvasData, pathData, draw) {
	/** @param {PathConnectedShape} shape, @param {PathEnd} pathEnd */
	function toCell(shape, pathEnd) {
		if (shape) {
			placeToCell(shapeObj(shape).data.position, canvasData.cell);
			shapeObj(shape).drawPosition();
		} else {
			placeToCell(pathEnd.position, canvasData.cell);
		}
	}

	toCell(pathData.startShape, pathData.start);
	toCell(pathData.endShape, pathData.end);

	if (!pathData.startShape || !pathData.endShape) { draw(); }
}

/** @param {PathConnectedShape} pathConnectedShape */
const shapeObj = pathConnectedShape => pathConnectedShape?.shapeEl[ShapeSmbl];

/** @param {PathData} pathData, @param {0|1} endType, @returns {MovedEnd} */
const movedEndCreate = (pathData, endType) => endType === 0
	// start
	? {
		type: 0,
		get shape() { return pathData.startShape; },
		set shape(val) { pathData.startShape = val; },

		get data() { return pathData.start; },
		set data(val) { pathData.start = val; },

		get oppositeShape() { return pathData.endShape; }
	}
	: endType === 1
		// end
		? {
			type: 1,
			get shape() { return pathData.endShape; },
			set shape(val) { pathData.endShape = val; },

			get data() { return pathData.end; },
			set data(val) { pathData.end = val; },

			get oppositeShape() { return pathData.startShape; }
		}
		// fake
		// @ts-ignore
		: /** @type {MovedEnd} */ ({
			get data() { return { position: { x: 0, y: 0 } }; }
		});

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
	let coef = Math.hypot(data.start.position.x - data.end.position.x, data.start.position.y - data.end.position.y) * 0.5;
	coef = coef > 70
		? 70
		: coef < 15 ? 15 : coef;

	/** @param {PathEnd} pathEnd */
	function cx(pathEnd) {
		return (pathEnd.dir === 'right' || pathEnd.dir === 'left')
			? pathEnd.dir === 'right' ? pathEnd.position.x + coef : pathEnd.position.x - coef
			: pathEnd.position.x;
	}

	/** @param {PathEnd} pathEnd */
	function cy(pathEnd) {
		return (pathEnd.dir === 'right' || pathEnd.dir === 'left')
			? pathEnd.position.y
			: pathEnd.dir === 'bottom' ? pathEnd.position.y + coef : pathEnd.position.y - coef;
	}

	return `M ${data.start.position.x} ${data.start.position.y} C ${cx(data.start)} ${cy(data.start)}, ` +
		`${cx(data.end)} ${cy(data.end)}, ${data.end.position.x} ${data.end.position.y}`;
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
/** @typedef { {position: Point, dir: Dir}} PathEnd */
/** @typedef { {shape?:PathConnectedShape, data?:PathEnd, oppositeShape?:PathConnectedShape, type:number} } MovedEnd */

/**
@typedef {{
	start?: PathEnd,
	startShape?: PathConnectedShape,
	end?: PathEnd,
	endShape?: PathConnectedShape,
	style?: string,
}} PathData
*/
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
