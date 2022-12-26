import { listenDel } from './util.js';

/** @param {Element} elem */
export function moveEvtMobileFix(elem) {
	/** @type {Point} */ let pointDown;
	/** @type {number} */ let prevX;
	/** @type {number} */ let prevY;

	/** @param {PointerEventFixMovement} evt */
	function move(evt) {
		if (!evt.isPrimary || !evt.isTrusted) { return; }

		// fix old Android
		if (pointDown &&
				Math.abs(pointDown.x - evt.clientX) < 3 &&
				Math.abs(pointDown.y - evt.clientY) < 3) {
			evt.stopImmediatePropagation();
			return;
		}
		pointDown = null;

		// fix iOS
		if (evt.movementX === undefined) {
			evt[MovementXSmbl] = (prevX ? evt.clientX - prevX : 0);
			evt[MovementYSmbl] = (prevY ? evt.clientY - prevY : 0);
			prevX = evt.clientX;
			prevY = evt.clientY;
		} else {
			evt[MovementXSmbl] = evt.movementX;
			evt[MovementYSmbl] = evt.movementY;
		}
	}

	elem.addEventListener('pointerdown', /** @param {PointerEvent} evt */ evt => {
		pointDown = { x: evt.clientX, y: evt.clientY };
		prevX = null;
		prevY = null;
		elem.addEventListener('pointermove', move, { capture: true, passive: true });

		elem.addEventListener('pointerup', _ => {
			listenDel(elem, 'pointermove', move, true);
		}, { capture: true, once: true, passive: true });
	}, { capture: true, passive: true });
}

export const MovementXSmbl = Symbol('movementX');
export const MovementYSmbl = Symbol('movementY');
/** @typedef {PointerEvent & { [MovementXSmbl]: number, [MovementYSmbl]: number }} PointerEventFixMovement */

/** @typedef { {x:number, y:number} } Point */
