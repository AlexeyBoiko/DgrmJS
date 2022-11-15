/**
 * @param {HTMLElement} svg
 * @param {HTMLElement} canvas
 * @param {PositionScale} canvasPostionScale
 */
export function moveScaleApplay(svg, canvas, canvasPostionScale) {
	const gripUpdate = applayGrid(svg, canvasPostionScale);

	function transform() {
		canvas.style.transform = `matrix(${canvasPostionScale.scale}, 0, 0, ${canvasPostionScale.scale}, ${canvasPostionScale.position.x}, ${canvasPostionScale.position.y})`;
		gripUpdate();
	}

	/**
	 * @param {number} nextScale
	 * @param {Point} originPoint
	 */
	function scale(nextScale, originPoint) {
		if (nextScale < 0.25 || nextScale > 4) { return; }

		const divis = nextScale / canvasPostionScale.scale;
		canvasPostionScale.scale = nextScale;

		canvasPostionScale.position.x = divis * (canvasPostionScale.position.x - originPoint.x) + originPoint.x;
		canvasPostionScale.position.y = divis * (canvasPostionScale.position.y - originPoint.y) + originPoint.y;

		transform();
	}

	// move, scale with fingers
	applayFingers(svg, canvasPostionScale, scale, transform);

	// scale with mouse wheel
	svg.addEventListener('wheel', /** @param {WheelEvent} evt */ evt => {
		evt.preventDefault();
		const delta = evt.deltaY || evt.deltaX;
		const scaleStep = Math.abs(delta) < 50
			? 0.05 // trackpad pitch
			: 0.25; // mouse wheel

		scale(
			canvasPostionScale.scale + (delta < 0 ? scaleStep : -scaleStep),
			evtPoint(evt));
	});
}

/**
 * @param {HTMLElement} svg
 * @param {PositionScale} canvasPostionScale
 * @param {{(nextScale:number, originPoint:Point):void}} scaleFn
 * @param {{():void}} transformFn
 * @return
 */
function applayFingers(svg, canvasPostionScale, scaleFn, transformFn) {
	/** @type {Pointer} */
	let firstPointer;

	/** @type {Pointer} */
	let secondPointer;

	/** @type {number} */
	let distance;

	/** @type {Point} */
	let center;

	/** @type {Point} */
	let firstPoinerShift;

	/** @param {PointerEvent} evt */
	function onMove(evt) {
		if (firstPoinerShift && !secondPointer) {
			// move with one poiner
			canvasPostionScale.position.x = evt.clientX + firstPoinerShift.x;
			canvasPostionScale.position.y = evt.clientY + firstPoinerShift.y;
			transformFn();
			return;
		}

		// move and scale with two pointers

		if (!secondPointer || !firstPointer || (secondPointer?.id !== evt.pointerId && firstPointer?.id !== evt.pointerId)) { return; }

		const distanceNew = Math.hypot(firstPointer.pos.x - secondPointer.pos.x, firstPointer.pos.y - secondPointer.pos.y);
		const centerNew = {
			x: (firstPointer.pos.x + secondPointer.pos.x) / 2,
			y: (firstPointer.pos.y + secondPointer.pos.y) / 2
		};

		// not first move
		if (distance) {
			// move
			canvasPostionScale.position.x = canvasPostionScale.position.x + centerNew.x - center.x;
			canvasPostionScale.position.y = canvasPostionScale.position.x + centerNew.y - center.y;

			// scale
			scaleFn(
				canvasPostionScale.scale / distance * distanceNew,
				evtPoint(evt));
		}

		distance = distanceNew;
		center = centerNew;

		if (firstPointer.id === evt.pointerId) { firstPointer.pos = evtPoint(evt); }
		if (secondPointer.id === evt.pointerId) { secondPointer.pos = evtPoint(evt); }
	}

	/** @param {PointerEvent} evt */
	function cancel(evt) {
		distance = null;
		center = null;

		if (firstPointer?.id === evt.pointerId) {
			firstPointer = null;
			firstPoinerShift = null;
		}

		if (secondPointer?.id === evt.pointerId) {
			secondPointer = null;
		}

		if (!firstPointer && !secondPointer) {
			svg.removeEventListener('pointermove', onMove);
		}
	};

	svg.addEventListener('pointerdown', evt => {
		svg.setPointerCapture(evt.pointerId);
		if (!firstPointer && !secondPointer) {
			svg.addEventListener('pointercancel', cancel, { passive: true, once: true });
			svg.addEventListener('pointerup', cancel, { passive: true, once: true });
			svg.addEventListener('pointermove', onMove, { passive: true });
		}

		if (!firstPointer) {
			firstPointer = evtPointer(evt);
			firstPoinerShift = {
				x: canvasPostionScale.position.x - firstPointer.pos.x,
				y: canvasPostionScale.position.y - firstPointer.pos.y
			};
			return;
		}

		if (!secondPointer) {
			secondPointer = evtPointer(evt);
		}
	}, { passive: true });

	/**
	 * @param {PointerEvent} evt
	 * @return { {id:number, pos?:Point} }
	 */
	function evtPointer(evt) {
		return {
			id: evt.pointerId,
			pos: evtPoint(evt)
		};
	}
}

/**
 * @param {HTMLElement} svg
 * @param {PositionScale} canvasPostionScale
 */
function applayGrid(svg, canvasPostionScale) {
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
		const size = cellSize * canvasPostionScale.scale;

		if (canvasPostionScale.scale < 0.5) { backImg(0); } else
		if (canvasPostionScale.scale <= 0.9) { backImg(0.3); } else { backImg(0.7); }

		svg.style.backgroundSize = `${size}px ${size}px`;
		svg.style.backgroundPosition = `${canvasPostionScale.position.x}px ${canvasPostionScale.position.y}px`;
	};
}

/**
 * @param {PointerEvent | MouseEvent} evt
 * @return {Point}
 */
function evtPoint(evt) { return { x: evt.clientX, y: evt.clientY }; }

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {id:number, pos?:Point} } Pointer */
/** @typedef { {position:Point, scale:number} } PositionScale */
