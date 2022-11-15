import { processed } from './shapes/circle.js';

/**
 * @param {HTMLElement} svg
 * @param {HTMLElement} canvas
 * @param {PositionScale} canvasPositionScale
 */
export function moveScaleApplay(svg, canvas, canvasPositionScale) {
	const gripUpdate = applayGrid(svg, canvasPositionScale);

	function transform() {
		canvas.style.transform = `matrix(${canvasPositionScale.scale}, 0, 0, ${canvasPositionScale.scale}, ${canvasPositionScale.position.x}, ${canvasPositionScale.position.y})`;
		gripUpdate();
	}

	/**
	 * @param {number} nextScale
	 * @param {Point} originPoint
	 */
	function scale(nextScale, originPoint) {
		if (nextScale < 0.25 || nextScale > 4) { return; }

		const divis = nextScale / canvasPositionScale.scale;
		canvasPositionScale.scale = nextScale;

		canvasPositionScale.position.x = divis * (canvasPositionScale.position.x - originPoint.x) + originPoint.x;
		canvasPositionScale.position.y = divis * (canvasPositionScale.position.y - originPoint.y) + originPoint.y;

		transform();
	}

	// move, scale with fingers
	applayFingers(svg, canvasPositionScale, scale, transform);

	// scale with mouse wheel
	svg.addEventListener('wheel', /** @param {WheelEvent} evt */ evt => {
		evt.preventDefault();
		const delta = evt.deltaY || evt.deltaX;
		const scaleStep = Math.abs(delta) < 50
			? 0.05 // trackpad pitch
			: 0.25; // mouse wheel

		scale(
			canvasPositionScale.scale + (delta < 0 ? scaleStep : -scaleStep),
			evtPoint(evt));
	});
}

/**
 * @param {HTMLElement} svg
 * @param {PositionScale} canvasPositionScale
 * @param {{(nextScale:number, originPoint:Point):void}} scaleFn
 * @param {{():void}} transformFn
 * @return
 */
function applayFingers(svg, canvasPositionScale, scaleFn, transformFn) {
	/** @type { Pointer } */
	let firstPointer;

	/** @type { Pointer} */
	let secondPointer;

	/** @type {number} */
	let distance;

	/** @type {Point} */
	let center;

	const cancel = function(evt) {
		distance = null;
		center = null;
		if (firstPointer?.id === evt.pointerId) { firstPointer = null; }
		if (secondPointer?.id === evt.pointerId) { secondPointer = null; }
	};

	svg.addEventListener('pointerdown', evt => {
		if (evt[processed] || (!firstPointer && !evt.isPrimary)) {
			return;
		}

		if (!firstPointer) { firstPointer = evtPointer(evt, canvasPositionScale); return; }
		if (!secondPointer) { secondPointer = evtPointer(evt, canvasPositionScale); }
	});
	svg.addEventListener('pointermove', /** @type {PointerEvent} */ evt => {
		if ((firstPointer && !secondPointer) || (!firstPointer && secondPointer)) {
			// move with one poiner
			canvasPositionScale.position.x = evt.clientX + (firstPointer || secondPointer).shift.x;
			canvasPositionScale.position.y = evt.clientY + (firstPointer || secondPointer).shift.y;
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
			canvasPositionScale.position.x = canvasPositionScale.position.x + centerNew.x - center.x;
			canvasPositionScale.position.y = canvasPositionScale.position.y + centerNew.y - center.y;

			scaleFn(
				canvasPositionScale.scale / distance * distanceNew,
				centerNew);
		}

		distance = distanceNew;
		center = centerNew;

		if (firstPointer.id === evt.pointerId) { firstPointer = evtPointer(evt, canvasPositionScale); }
		if (secondPointer.id === evt.pointerId) { secondPointer = evtPointer(evt, canvasPositionScale); }
	});
	svg.addEventListener('pointerleave', cancel);
	svg.addEventListener('pointerout', cancel);
	svg.addEventListener('pointercancel', cancel);
	svg.addEventListener('pointerup', cancel);
}

/**
 * @param {HTMLElement} svg
 * @param {PositionScale} canvasPositionScale
 */
function applayGrid(svg, canvasPositionScale) {
	const cellSize = 24;

	let curOpacity;
	/** @param {number} opacity */
	function backImg(opacity) {
		if (curOpacity !== opacity) {
			curOpacity = opacity;
			svg.style.backgroundImage = `radial-gradient(rgb(73 80 87 / ${opacity}) 1px, transparent 0)`;
		}
	}

	backImg(0.7);
	svg.style.backgroundSize = `${cellSize}px ${cellSize}px`;

	return function() {
		const size = cellSize * canvasPositionScale.scale;

		if (canvasPositionScale.scale < 0.5) { backImg(0); } else
		if (canvasPositionScale.scale <= 0.9) { backImg(0.3); } else { backImg(0.7); }

		svg.style.backgroundSize = `${size}px ${size}px`;
		svg.style.backgroundPosition = `${canvasPositionScale.position.x}px ${canvasPositionScale.position.y}px`;
	};
}

/**
 * @param {PointerEvent | MouseEvent} evt
 * @return {Point}
 */
function evtPoint(evt) { return { x: evt.clientX, y: evt.clientY }; }

/**
 * @param { PointerEvent } evt
 * @param { PositionScale } canvasPositionScale
 * @return { Pointer }
 */
function evtPointer(evt, canvasPositionScale) {
	return {
		id: evt.pointerId,
		pos: evtPoint(evt),
		shift: {
			x: canvasPositionScale.position.x - evt.clientX,
			y: canvasPositionScale.position.y - evt.clientY
		}
	};
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {id:number, pos:Point, shift:Point} } Pointer */
/** @typedef { {position:Point, scale:number} } PositionScale */

/** @typedef {import("./shapes/circle").DgrmEvent} DgrmEvent */
