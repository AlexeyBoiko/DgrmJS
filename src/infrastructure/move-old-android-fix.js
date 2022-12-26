/** @param {Element} elem */
export function moveOldAndoidFixApplay(elem) {
	/** @type {Point} */ let pointDown;

	elem.addEventListener('pointerdown', /** @param {PointerEvent} evt */ evt => {
		pointDown = { x: evt.clientX, y: evt.clientY };
	}, { capture: true, passive: true });

	elem.addEventListener('pointermove', /** @param {PointerEvent} evt */ evt => {
		if (!evt.isPrimary || !evt.isTrusted) { return; }

		if (pointDown &&
				Math.abs(pointDown.x - evt.clientX) < 3 &&
				Math.abs(pointDown.y - evt.clientY) < 3) {
			evt.stopImmediatePropagation();
			return;
		}
		pointDown = null;
	}, { capture: true, passive: true });
}

/** @typedef { {x:number, y:number} } Point */
