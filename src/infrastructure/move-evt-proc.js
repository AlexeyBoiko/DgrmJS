import { MovementXSmbl, MovementYSmbl } from './move-evt-mobile-fix.js';
import { listenDel, listen } from './util.js';

/**
 * @param { Element } elemTrackOutdown poitdows in this element will be tracking to fire {onOutdown} callback
 * @param { Element } elem
 * @param { {scale:number} } canvasScale
 * @param { Point } shapePosition
 * @param { {(evt:PointerEvent):void} } onMoveStart
 * @param { {(evt:PointerEvent):void} } onMove
 * @param { {(evt:PointerEvent):void} } onMoveEnd
 * @param { {(evt:PointerEvent):void} } onClick
 * @param { {():void} } onOutdown
 */
export function moveEvtProc(elemTrackOutdown, elem, canvasScale, shapePosition, onMoveStart, onMove, onMoveEnd, onClick, onOutdown) {
	let isMoved = false;
	let isInit = false;
	/** @type {Element} */ let target;

	/** @param {PointerEventFixMovement} evt */
	function move(evt) {
		if (!isInit) { return; }

		if (!isMoved) {
			onMoveStart(evt);

			// if reset
			if (!isInit) { return; }
		}

		movementApplay(shapePosition, canvasScale.scale, evt);
		isMoved = true;
		onMove(evt);
	}

	/** @param {PointerEvent} evt */
	function cancel(evt) {
		if (isMoved) {
			onMoveEnd(evt);
		} else {
			onClick(evt);
		}
		reset(true);
	}

	/** @param {PointerEvent & { target:Node}} docEvt */
	function docDown(docEvt) {
		if (!elem.contains(docEvt.target)) {
			reset();
			onOutdown();
		}
	}

	function wheel() {
		reset();
		onOutdown();
	}

	/**
	 * @param {ProcEvent} evt
	 */
	function init(evt) {
		if (evt[ProcessedSmbl] || !evt.isPrimary) {
			return;
		}

		evt[ProcessedSmbl] = true;
		target = /** @type {Element} */(evt.target);
		target.setPointerCapture(evt.pointerId);
		listen(target, 'pointercancel', cancel, true);
		listen(target, 'pointerup', cancel, true);
		listen(target, 'pointermove', move);

		listen(elemTrackOutdown, 'wheel', wheel, true);
		listen(elemTrackOutdown, 'pointerdown', docDown);

		isInit = true;
	}

	listen(elem, 'pointerdown', init);

	/** @param {boolean=} saveOutTrack */
	function reset(saveOutTrack) {
		listenDel(target, 'pointercancel', cancel);
		listenDel(target, 'pointerup', cancel);
		listenDel(target, 'pointermove', move);
		if (!saveOutTrack) {
			listenDel(elemTrackOutdown, 'pointerdown', docDown);
			listenDel(elemTrackOutdown, 'wheel', wheel);
		}
		target = null;
		isMoved = false;
		isInit = false;
	}

	return reset;
}

/** @param {Point} point, @param {number} scale, @param {PointerEventFixMovement} evt */
export function movementApplay(point, scale, evt) {
	point.x += evt[MovementXSmbl] / scale;
	point.y += evt[MovementYSmbl] / scale;
}

/** @param {Element} elem */
export function evtRouteApplay(elem) {
	elem.addEventListener('pointerdown', /** @param {ProcEvent} evt */ evt => {
		if (!evt.isPrimary || evt[RouteedSmbl] || !evt.isTrusted) { return; }

		evt.stopImmediatePropagation();

		const newEvt = new PointerEvent('pointerdown', evt);
		newEvt[RouteedSmbl] = true;
		activeElemFromPoint(evt).dispatchEvent(newEvt);
	}, { capture: true, passive: true });
}

/** @param { {clientX:number, clientY:number} } evt */
function activeElemFromPoint(evt) {
	return elemFromPointByPrioity(evt).find(el => !el.hasAttribute('data-evt-no'));
}

/** @param { {clientX:number, clientY:number} } evt */
export function priorityElemFromPoint(evt) {
	return elemFromPointByPrioity(evt)[0];
}

/** @param { {clientX:number, clientY:number} } evt */
function elemFromPointByPrioity(evt) {
	return document.elementsFromPoint(evt.clientX, evt.clientY)
		.sort((a, b) => {
			const ai = a.getAttribute('data-evt-index');
			const bi = b.getAttribute('data-evt-index');
			return (ai === bi) ? 0 : ai > bi ? -1 : 1;
		});
}

export const ProcessedSmbl = Symbol('processed');
const RouteedSmbl = Symbol('routeed');
/** @typedef {PointerEvent & { [ProcessedSmbl]?: boolean, [RouteedSmbl]?: boolean }} ProcEvent */

/** @typedef {import('./move-evt-mobile-fix.js').PointerEventFixMovement} PointerEventFixMovement */
/** @typedef { {x:number, y:number} } Point */
