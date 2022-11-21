/**
 * @param { Element } element
 * @param { {scale:number} } canvasScale
 * @param { Point } shapePosition
 * @param { {(evt:PointerEvent):void} } onMoveStart
 * @param { {(evt:PointerEvent):void} } onMove
 * @param { {(evt:PointerEvent):void} } onMoveEnd
 * @param { {():void} } onClick
 * @param { {():void} } onOutdown
 */
export function moveEventProcess(element, canvasScale, shapePosition, onMoveStart, onMove, onMoveEnd, onClick, onOutdown) {
	/** @type {Point} */
	let pointDownShift;

	/** @type {Point} */
	let pointDown;

	let isMoved = false;

	/** @param {PointerEvent} evt */
	function move(evt) {
		if (!pointDownShift ||
			// fix old android
			(pointDown &&
				Math.abs(pointDown.x - evt.clientX) < 3 &&
				Math.abs(pointDown.y - evt.clientY) < 3)) {
			return;
		}
		pointDown = null;

		if (!isMoved) {
			onMoveStart(evt);

			// if reset
			if (!pointDownShift) { return; }
		}

		shapePosition.x = (evt.clientX + pointDownShift.x) / canvasScale.scale;
		shapePosition.y = (evt.clientY + pointDownShift.y) / canvasScale.scale;
		isMoved = true;
		onMove(evt);
	}

	/** @param {PointerEvent} evt */
	function cancel(evt) {
		if (isMoved) {
			onMoveEnd(evt);
		} else {
			onClick();
		}
		reset();
	}

	/** @param {PointerEvent} docEvt */
	function docDown(docEvt) {
		if (!element.contains(/** @type {Element} */(docEvt.target))) {
			onOutdown();
		}
	}

	/**
	 * @param {DgrmEvent} evt
	 */
	function init(evt) {
		if (!evt.isPrimary || pointDownShift) {
			return;
		}

		evt[processed] = true;
		element.setPointerCapture(evt.pointerId);
		element.addEventListener('pointercancel', cancel, { passive: true, once: true });
		element.addEventListener('pointerup', cancel, { passive: true, once: true });
		element.addEventListener('pointermove', move, { passive: true });

		document.addEventListener('pointerdown', docDown, { passive: true, once: true, capture: true });

		pointDownShift = {
			x: shapePosition.x * canvasScale.scale - evt.clientX,
			y: shapePosition.y * canvasScale.scale - evt.clientY
		};

		pointDown = {
			x: evt.clientX,
			y: evt.clientY
		};
	}

	element.addEventListener('gotpointercapture', init, { passive: true });
	element.addEventListener('pointerdown', init, { passive: true });

	function reset() {
		element.removeEventListener('pointercancel', cancel);
		element.removeEventListener('pointermove', move);
		element.removeEventListener('pointerup', cancel);
		element.removeEventListener('pointerdown', docDown, { capture: true });
		pointDownShift = null;
		pointDown = null;
		isMoved = false;
	}

	return reset;
}

export const processed = Symbol(0);
/** @typedef {PointerEvent & { [processed]?: boolean }} DgrmEvent */

/** @typedef { {x:number, y:number} } Point */
