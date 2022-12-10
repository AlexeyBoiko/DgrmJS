import { child, classAdd, classDel, classHas, evtCanvasPoint } from '../infrastructure/util.js';
import { moveEvtProc, priorityElemFromPoint } from '../infrastructure/move-evt-proc.js';
import { ShapeSmbl } from './shape-evt-proc.js';
import { settingsPnlCreate } from './shape-settings.js';

/**
 * @param {Element} svg
 * @param {{position:Point, scale:number}} canvasData
 * @param {PathData} pathData
 */
export function path(svg, canvasData, pathData) {
	/** @type {PathElement} */
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.innerHTML = `
		<path data-key="outer" d="M0 0" stroke="transparent" stroke-width="20" fill="none" />
		<path data-key="path" class="path" d="M0 0" stroke="#495057" stroke-width="1.8" fill="none" style="pointer-events: none;" />
		<path data-key="selected" d="M0 0" stroke="transparent" stroke-width="10" fill="none" style="pointer-events: none;" />
		<g data-key="arrow">
			<circle r="10" stroke-width="0" fill="transparent" data-evt-index="1" />
			<path class="path" d="M-7 7 l 7 -7 l -7 -7" stroke="#495057" stroke-width="1.8" fill="none" style="pointer-events: none;"></path>
		</g>`;

	const path = child(svgGrp, 'path');
	const outer = child(svgGrp, 'outer');
	const selected = child(svgGrp, 'selected');
	/** @type {SVGElement} */
	const arrow = child(svgGrp, 'arrow');

	function draw() {
		// path
		const dAttr = pathCalc(pathData);
		path.setAttribute('d', dAttr);
		outer.setAttribute('d', dAttr);
		selected.setAttribute('d', dAttr);

		// arrow
		arrow.style.transform = `translate(${pathData.end.position.x}px, ${pathData.end.position.y}px) rotate(${arrowAngle(pathData.end.dir)}deg)`;
	}

	/** @type { {position:(bottomX:number, bottomY:number)=>void, del:()=>void} } */
	let settingsPnl;

	function del() {
		settingsPnl?.del(); settingsPnl = null;
		reset();
		pathData.startShape.shapeEl[ShapeSmbl].pathDel(svgGrp);
		pathData.endShape?.shapeEl[ShapeSmbl].pathDel(svgGrp);
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
		arrow.firstElementChild.setAttribute('data-evt-index', '2');
	};

	function unSelect() {
		classDel(svgGrp, 'select');
		arrow.firstElementChild.setAttribute('data-evt-index', '1');

		settingsPnl?.del(); settingsPnl = null;
	};

	/** @type { {():void} } */
	let hoverEmulateDispose;
	const reset = moveEvtProc(
		svg,
		svgGrp,
		canvasData,
		// data.end.position,
		{
			get x() { return pathData.end.position.x; },
			set x(val) { pathData.end.position.x = val; },

			get y() { return pathData.end.position.y; },
			set y(val) { pathData.end.position.y = val; }
		},
		// onMoveStart
		evt => {
			unSelect();

			// move not arrow
			if (!arrow.contains(/** @type {Node} */(evt.target))) {
				reset();
				return;
			}

			// disconnect from shape
			if (pathData.endShape) {
				if (pathData.endShape.shapeEl !== pathData.startShape.shapeEl) {
					pathData.endShape.shapeEl[ShapeSmbl].pathDel(svgGrp);
				}
				pathData.endShape = null;
				pathData.end = {
					dir: pathData.end.dir,
					position: evtCanvasPoint(canvasData, evt)
				};
			}

			// hover emulation - start
			svgGrp.style.pointerEvents = 'none';
			hoverEmulateDispose = hoverEmulate(svgGrp.parentElement);
		},
		// onMove
		draw,
		// onMoveEnd
		evt => {
			// connect to shape
			const elemFromPoint = priorityElemFromPoint(evt);
			const connectorKey = elemFromPoint?.getAttribute('data-connect');
			if (connectorKey) {
				// @ts-ignore
				pathData.endShape = { shapeEl: elemFromPoint.parentElement, connectorKey };
				pathData.end = pathData.endShape.shapeEl[ShapeSmbl].pathAdd(connectorKey, svgGrp);
				draw();
			}

			// hover emulation - end
			hoverEmulateDispose();
			hoverEmulateDispose = null;
			svgGrp.style.pointerEvents = 'unset';
		},
		// onClick
		select,
		// onOutdown
		unSelect
	);

	svgGrp[PathSmbl] = {
		draw,
		/** @param {PointerEventInit} evt */
		pointerCapture: (evt) => {
			const newEvt = new PointerEvent('pointerdown', evt);
			arrow.dispatchEvent(newEvt);
		},
		del,
		data: pathData
	};

	if (pathData.style) { classAdd(svgGrp, pathData.style); }
	if (pathData.startShape) { pathData.start = pathData.startShape.shapeEl[ShapeSmbl].pathAdd(pathData.startShape.connectorKey, svgGrp); }
	if (pathData.endShape) { pathData.end = pathData.endShape.shapeEl[ShapeSmbl].pathAdd(pathData.endShape.connectorKey, svgGrp); }
	draw();

	return svgGrp;
}

/** @param {Dir} dir */
function arrowAngle(dir) {
	return dir === 'right'
		? 180
		: dir === 'left'
			? 0
			: dir === 'bottom'
				? 270
				: 90;
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

	element.addEventListener('pointermove', move, { passive: true });
	// dispose fn
	return function() {
		element.removeEventListener('pointermove', move);
		classDel(elemFromPoint, 'hover');
		classDel(elemFromPoint?.parentElement, 'hover');
		elemFromPoint = null;
	};
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { 'left' | 'right' | 'top' | 'bottom' } Dir */
/** @typedef { {shapeEl: ShapeElement, connectorKey: string} } PathConnectedShape */
/** @typedef { {position: Point, dir: Dir}} PathEnd */
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
