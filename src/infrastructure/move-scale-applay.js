import { ProcessedSmbl } from './move-evt-proc.js';
import { listen, listenDel } from './util.js';

/**
 * Get point in canvas given the scale and position of the canvas
 * @param {{position:{x:number, y:number}, scale:number}} canvasData
 * @param {number} x, @param {number} y
 */
export const pointInCanvas = (canvasData, x, y) => ({
	x: (x - canvasData.position.x) / canvasData.scale,
	y: (y - canvasData.position.y) / canvasData.scale
});

/**
 * @param {Point} point
 * @param {number} cell
 */
export function placeToCell(point, cell) {
	const cellSizeHalf = cell / 2;
	function placeToCell(coordinate) {
		const coor = (Math.round(coordinate / cell) * cell);
		return (coordinate - coor > 0) ? coor + cellSizeHalf : coor - cellSizeHalf;
	}

	point.x = placeToCell(point.x);
	point.y = placeToCell(point.y);
}

/**
 * @param { CanvasElement } canvas
 * @param { {position:Point, scale:number, cell: number} } canvasData
 */
export function moveScaleApplay(canvas, canvasData) {
	const gripUpdate = applayGrid(canvas.ownerSVGElement, canvasData);

	function transform() {
		canvas.style.transform = `matrix(${canvasData.scale}, 0, 0, ${canvasData.scale}, ${canvasData.position.x}, ${canvasData.position.y})`;
		gripUpdate();
	}

	/**
	 * @param {number} nextScale
	 * @param {Point} originPoint
	 */
	function scale(nextScale, originPoint) {
		if (nextScale < 0.25 || nextScale > 4) { return; }

		const divis = nextScale / canvasData.scale;
		canvasData.scale = nextScale;

		canvasData.position.x = divis * (canvasData.position.x - originPoint.x) + originPoint.x;
		canvasData.position.y = divis * (canvasData.position.y - originPoint.y) + originPoint.y;

		transform();
	}

	// move, scale with fingers
	applayFingers(canvas.ownerSVGElement, canvasData, scale, transform);

	// scale with mouse wheel
	canvas.ownerSVGElement.addEventListener('wheel', /** @param {WheelEvent} evt */ evt => {
		evt.preventDefault();
		const delta = evt.deltaY || evt.deltaX;
		const scaleStep = Math.abs(delta) < 50
			? 0.05 // trackpad pitch
			: 0.25; // mouse wheel

		scale(
			canvasData.scale + (delta < 0 ? scaleStep : -scaleStep),
			evtPoint(evt));
	});

	canvas[CanvasSmbl] = {
		/** @param {number} x, @param {number} y, @param {number} scale */
		move: (x, y, scale) => {
			canvasData.position.x = x;
			canvasData.position.y = y;
			canvasData.scale = scale;
			transform();
		}
	};
}

/**
 * @param { SVGSVGElement } svg
 * @param { {position:Point, scale:number} } canvasData
 * @param { {(nextScale:number, originPoint:Point):void} } scaleFn
 * @param { {():void} } transformFn
 * @return
 */
function applayFingers(svg, canvasData, scaleFn, transformFn) {
	/** @type { Pointer } */
	let firstPointer;

	/** @type { Pointer} */
	let secondPointer;

	/** @type {number} */
	let distance;

	/** @type {Point} */
	let center;

	/** @param {PointerEvent} evt */
	function cancel(evt) {
		distance = null;
		center = null;
		if (firstPointer?.id === evt.pointerId) { firstPointer = null; }
		if (secondPointer?.id === evt.pointerId) { secondPointer = null; }

		if (!firstPointer && !secondPointer) {
			listenDel(svg, 'pointermove', move);
			listenDel(svg, 'pointercancel', cancel);
			listenDel(svg, 'pointerup', cancel);
		}
	};

	/** @param {PointerEvent} evt */
	function move(evt) {
		if (evt[ProcessedSmbl]) { return; }

		if ((firstPointer && !secondPointer) || (!firstPointer && secondPointer)) {
			// move with one pointer
			canvasData.position.x = evt.clientX + (firstPointer || secondPointer).shift.x;
			canvasData.position.y = evt.clientY + (firstPointer || secondPointer).shift.y;
			transformFn();
			return;
		}

		if (!secondPointer || !firstPointer || (secondPointer?.id !== evt.pointerId && firstPointer?.id !== evt.pointerId)) { return; }

		const distanceNew = Math.hypot(firstPointer.pos.x - secondPointer.pos.x, firstPointer.pos.y - secondPointer.pos.y);
		const centerNew = {
			x: (firstPointer.pos.x + secondPointer.pos.x) / 2,
			y: (firstPointer.pos.y + secondPointer.pos.y) / 2
		};

		// not first move
		if (distance) {
			canvasData.position.x = canvasData.position.x + centerNew.x - center.x;
			canvasData.position.y = canvasData.position.y + centerNew.y - center.y;

			scaleFn(
				canvasData.scale / distance * distanceNew,
				centerNew);
		}

		distance = distanceNew;
		center = centerNew;

		if (firstPointer.id === evt.pointerId) { firstPointer = evtPointer(evt, canvasData); }
		if (secondPointer.id === evt.pointerId) { secondPointer = evtPointer(evt, canvasData); }
	}

	listen(svg, 'pointerdown', /** @param {PointerEvent} evt */ evt => {
		if (evt[ProcessedSmbl] || (!firstPointer && !evt.isPrimary) || (firstPointer && secondPointer)) {
			return;
		}

		svg.setPointerCapture(evt.pointerId);
		if (!firstPointer) {
			listen(svg, 'pointermove', move);
			listen(svg, 'pointercancel', cancel);
			listen(svg, 'pointerup', cancel);
		}

		if (!firstPointer) { firstPointer = evtPointer(evt, canvasData); return; }
		if (!secondPointer) { secondPointer = evtPointer(evt, canvasData); }
	});
}

/**
 * @param { SVGSVGElement } svg
 * @param { {position:Point, scale:number, cell: number} } canvasData
 */
function applayGrid(svg, canvasData) {
	let curOpacity;
	/** @param {number} opacity */
	function backImg(opacity) {
		if (curOpacity !== opacity) {
			curOpacity = opacity;
			svg.style.backgroundImage = `radial-gradient(rgb(73 80 87 / ${opacity}) 1px, transparent 0)`;
		}
	}

	backImg(0.7);
	svg.style.backgroundSize = `${canvasData.cell}px ${canvasData.cell}px`;

	return function() {
		const size = canvasData.cell * canvasData.scale;

		if (canvasData.scale < 0.5) { backImg(0); } else
		if (canvasData.scale <= 0.9) { backImg(0.3); } else { backImg(0.7); }

		svg.style.backgroundSize = `${size}px ${size}px`;
		svg.style.backgroundPosition = `${canvasData.position.x}px ${canvasData.position.y}px`;
	};
}

/**
 * @param {PointerEvent | MouseEvent} evt
 * @return {Point}
 */
function evtPoint(evt) { return { x: evt.clientX, y: evt.clientY }; }

/**
 * @param { PointerEvent } evt
 * @param { {position:Point, scale:number} } canvasData
 * @return { Pointer }
 */
function evtPointer(evt, canvasData) {
	return {
		id: evt.pointerId,
		pos: evtPoint(evt),
		shift: {
			x: canvasData.position.x - evt.clientX,
			y: canvasData.position.y - evt.clientY
		}
	};
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {id:number, pos:Point, shift:Point} } Pointer */

/** @typedef {import("./move-evt-proc").ProcEvent} DgrmEvent */

export const CanvasSmbl = Symbol('Canvas');
/** @typedef {SVGGElement & { [CanvasSmbl]?: {move(x:number, y:number, scale:number):void} }} CanvasElement */
