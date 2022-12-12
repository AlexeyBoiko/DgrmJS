import { ProcessedSmbl } from '../infrastructure/move-evt-proc.js';

/** @param {SVGSVGElement} svg */
export function groupSelectApplay(svg) {
	let timer;
	/** @type {Point} */ let selectStart;
	/** @type {SVGCircleElement} */ let startCircle;
	/** @type {SVGRectElement} */ let selectRect;
	/** @type {Point} */ let selectRectPos;

	/** @param {PointerEvent} evt */
	function onMove(evt) {
		if (evt[ProcessedSmbl] || !selectRect) { reset(); return; }
		evt[ProcessedSmbl] = true;

		if (startCircle) { startCircle.remove(); startCircle = null; }

		// draw rect
		const x = evt.clientX - selectStart.x;
		const y = evt.clientY - selectStart.y;
		selectRect.width.baseVal.value = Math.abs(x);
		selectRect.height.baseVal.value = Math.abs(y);
		if (x < 0) { selectRectPos.x = evt.clientX; }
		if (y < 0) { selectRectPos.y = evt.clientY; }
		selectRect.style.transform = `translate(${selectRectPos.x}px, ${selectRectPos.y}px)`;
	}

	/** @param {PointerEvent} evt */
	function onUp(evt) {
		reset();
	}

	function reset() {
		clearTimeout(timer); timer = null;
		startCircle?.remove(); startCircle = null;
		selectRect?.remove(); selectRect = null;
		svg.removeEventListener('pointermove', onMove);
		svg.removeEventListener('wheel', reset);
		svg.removeEventListener('pointerup', onUp);
	}

	svg.addEventListener('pointerdown', evt => {
		if (evt[ProcessedSmbl] || !evt.isPrimary) { reset(); return; }

		svg.addEventListener('pointermove', onMove, { passive: true });
		svg.addEventListener('wheel', reset, { passive: true, once: true });
		svg.addEventListener('pointerup', onUp, { passive: true, once: true });

		timer = setTimeout(_ => {
			startCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
			startCircle.style.cssText = 'r:10px; fill: rgb(108 187 247 / 51%)';
			startCircle.style.transform = `translate(${evt.clientX}px, ${evt.clientY}px)`;
			svg.append(startCircle);

			selectStart = { x: evt.clientX, y: evt.clientY };
			selectRectPos = { x: evt.clientX, y: evt.clientY };
			selectRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			selectRect.style.cssText = 'rx:10px; fill: rgb(108 187 247 / 51%)';
			selectRect.style.transform = `translate(${selectRectPos.x}px, ${selectRectPos.y}px)`;
			svg.append(selectRect);
		}, 500);
	}, { passive: true });
}

/** @typedef { {x:number, y:number} } Point */
