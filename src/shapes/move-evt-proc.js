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
export function moveEvtProc(element, canvasScale, shapePosition, onMoveStart, onMove, onMoveEnd, onClick, onOutdown) {
	/** @type {Point} */
	let pointDownShift;

	/** @type {Point} */
	let pointDown;

	let isMoved = false;

	/** @type {Element} */
	let target;

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

	/** @param {PointerEvent & {target: Element}} docEvt */
	function docDown(docEvt) {
		if (!element.contains(activeElemFromPoint(docEvt))) {
			onOutdown();
		}
	}

	/**
	 * @param {DgrmEvent} evt
	 */
	function init(evt) {
		if (evt[ProcessedSmbl] || !evt.isPrimary || pointDownShift) {
			return;
		}

		evt[ProcessedSmbl] = true;
		target = /** @type {Element} */(evt.target);
		target.setPointerCapture(evt.pointerId);
		target.addEventListener('pointercancel', cancel, { passive: true, once: true });
		target.addEventListener('pointerup', cancel, { passive: true, once: true });
		target.addEventListener('pointermove', move, { passive: true });

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
		target.removeEventListener('pointercancel', cancel);
		target.removeEventListener('pointermove', move);
		target.removeEventListener('pointerup', cancel);
		element.removeEventListener('pointerdown', docDown, { capture: true });
		target = null;
		pointDownShift = null;
		pointDown = null;
		isMoved = false;
	}

	return reset;
}

/** @param {HTMLElement} elem */
export function evtRouteApplay(elem) {
	elem.addEventListener('pointerdown', /** @param {DgrmEvent} evt */ evt => {
		if (!evt.isPrimary || evt[RouteedSmbl]) { return; }

		evt[ProcessedSmbl] = true;

		const newEvt = new PointerEvent('pointerdown', evt);
		newEvt[RouteedSmbl] = true;

		activeElemFromPoint(evt).dispatchEvent(newEvt);
	}, { capture: true, passive: true });
}

/** @param { {clientX:number, clientY:number} } evt */
export function activeElemFromPoint(evt) {
	return elemFromPointByPrioity(evt).find(el => !el.hasAttribute('data-evt-no'));
}

/** @param { {clientX:number, clientY:number} } evt */
export function priorityElemFromPoint(evt) {
	return elemFromPointByPrioity(evt)[0];
}

/** @param { {clientX:number, clientY:number} } evt */
function elemFromPointByPrioity(evt) {
	return document.elementsFromPoint(evt.clientX, evt.clientY)
		.sort((a, b) => a.getAttribute('data-evt-index') > b.getAttribute('data-evt-index') ? -1 : 1);
}

export const ProcessedSmbl = Symbol('processed');
const RouteedSmbl = Symbol('routeed');
/** @typedef {PointerEvent & { [ProcessedSmbl]?: boolean, [RouteedSmbl]?: boolean }} DgrmEvent */

/** @typedef { {x:number, y:number} } Point */
