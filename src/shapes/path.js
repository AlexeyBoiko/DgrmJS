import { ShapeSmbl } from './circle.js';
import { evtCanvasPoint } from './evt-canvas-point.js';
import { moveEvtProc, priorityElemFromPoint } from './move-evt-proc.js';

/**
 * @param { {position:Point, scale:number} } canvasData
 * @param { Shape } startShape
 * @param { PathData } data
 */
export function path(canvasData, startShape, data) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.classList.add('path');
	svgGrp.innerHTML =
		`<path data-key="outer" d="M0 0" stroke="transparent" stroke-width="20" fill="none" />
		<path data-key="path" d="M0 0" stroke="#333" stroke-width="1.8" fill="none" style="pointer-events: none;" />
		<path data-key="selected" d="M0 0" stroke="transparent" stroke-width="10" fill="none" style="pointer-events: none;" />
		<g data-key="arrow">
			<circle r="10" stroke-width="0" fill="transparent" data-evt-index="1" />
			<path d="M-7 7 l 7 -7 l -7 -7" stroke="#333" stroke-width="1.8" fill="none" style="pointer-events: none;"></path>
		</g>`;

	const path = svgGrp.querySelector('[data-key="path"]');
	const outer = svgGrp.querySelector('[data-key="outer"]');
	const selected = svgGrp.querySelector('[data-key="selected"]');
	/** @type {SVGElement} */
	const arrow = svgGrp.querySelector('[data-key="arrow"]');

	function draw() {
		// path
		const dAttr = pathCalc(data);
		path.setAttribute('d', dAttr);
		outer.setAttribute('d', dAttr);
		selected.setAttribute('d', dAttr);

		// arrow
		arrow.style.transform = `translate(${data.end.position.x}px, ${data.end.position.y}px) rotate(${arrowAngle(data.end.dir)}deg)`;
	}
	draw();

	const unSelect = () => svgGrp.classList.remove('select');

	/** @type {Shape} */
	let endShape;

	/** @type { {():void} } */
	let hoverEmulateDispose;
	const reset = moveEvtProc(
		svgGrp,
		canvasData,
		// data.end.position,
		{
			get x() { return data.end.position.x; },
			set x(val) { data.end.position.x = val; },

			get y() { return data.end.position.y; },
			set y(val) { data.end.position.y = val; }
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
			if (endShape) {
				if (startShape !== endShape) {
					endShape.pathDel(thisPath);
				}
				endShape = null; // TODO: remove
				data.end = {
					dir: data.end.dir,
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
				endShape = /** @type {DgrmElement} */(elemFromPoint.parentElement)[ShapeSmbl];
				endShape.pathAdd(connectorKey, thisPath);
			}

			// hover emulation - end
			hoverEmulateDispose();
			svgGrp.style.pointerEvents = 'unset';
		},
		// onClick
		() => svgGrp.classList.add('select'),
		// onOutdown
		unSelect
	);

	/** @type {Path} */
	const thisPath = {
		elem: svgGrp,
		data,
		draw,
		setPointerCapture: /** @param {number} pointerId */(pointerId) => {
			arrow.setPointerCapture(pointerId);
		}
	};
	return thisPath;
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
			if (elemFromPointNew?.classList.contains('hovertrack')) {
				elemFromPointNew.classList.add('hover');
			}
			let parentHover = false;
			if (elemFromPointNew?.parentElement.classList.contains('hovertrack')) {
				elemFromPointNew.parentElement.classList.add('hover');
				parentHover = true;
			}

			elemFromPoint?.classList.remove('hover');
			if (elemFromPoint?.parentElement !== elemFromPointNew?.parentElement || !parentHover) {
				elemFromPoint?.parentElement.classList.remove('hover');
			}

			elemFromPoint = elemFromPointNew;
		}
	}

	element.addEventListener('pointermove', move, { passive: true });
	// dispose fn
	return function() {
		element.removeEventListener('pointermove', move);
		elemFromPoint?.classList.remove('hover');
		elemFromPoint?.parentElement.classList.remove('hover');
		elemFromPoint = null;
	};
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { 'left' | 'right' | 'top' | 'bottom' } Dir */
/** @typedef { {position: Point, dir: Dir } } PathEnd */
/** @typedef { {start: PathEnd, end: PathEnd} } PathData */
/** @typedef { {elem: Element, data: PathData, draw():void, setPointerCapture:(pointerId:number)=>void} } Path */
/** @typedef { import('./circle.js').DgrmElement } DgrmElement */
/** @typedef { import('./circle.js').Shape } Shape */
