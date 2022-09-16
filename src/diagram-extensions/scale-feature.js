/**
 * @param {IDiagram} diagram
 * @param {SVGSVGElement} svg
 */
export function scaleFeature(diagram, svg) {
	// mouse wheel, trackpad pitch
	svg.addEventListener('wheel', /** @param {WheelEvent} evt */ evt => {
		evt.preventDefault();

		const delta = evt.deltaY || evt.deltaX;
		const scaleStep = Math.abs(delta) < 50
			? 0.05 // trackpad pitch
			: 0.25; // mouse wheel
		scale(diagram, (delta < 0 ? scaleStep : -scaleStep), evtPos(evt));
	});

	// multi touch screen
	scaleTouchScreen(diagram, svg);
}

/**
 * Scale for multi touch screen
 * @param {IDiagram} diagram
 * @param {SVGSVGElement} svg
 */
function scaleTouchScreen(diagram, svg) {
	/** @type {Point} */
	let mainPointerPos;

	/** @type { {id:number, pos?:Point} } */
	let secondPointer;

	/** @type {number} */
	let distance;

	/** @type {Point} */
	let center;

	const cancel = function() {
		secondPointer = null;
		mainPointerPos = null;
		distance = null;
		center = null;
	};

	svg.addEventListener('pointerdown', evt => {
		if (evt.isPrimary) {
			mainPointerPos = evtPos(evt);
		} else if (!secondPointer) {
			secondPointer = { id: evt.pointerId, pos: evtPos(evt) };
		}
	});
	svg.addEventListener('pointermove', /** @type {PointerEvent} */ evt => {
		if (!secondPointer || !(evt.isPrimary || secondPointer.id === evt.pointerId)) { return; }

		const distanceNew = Math.hypot(mainPointerPos.x - secondPointer.pos.x, mainPointerPos.y - secondPointer.pos.y);
		const centerNew = {
			x: (mainPointerPos.x + secondPointer.pos.x) / 2,
			y: (mainPointerPos.y + secondPointer.pos.y) / 2
		};

		// not first move
		if (distance) {
			const canvasPosition = diagram.canvasPosition;
			diagram.canvasPosition = {
				x: canvasPosition.x + centerNew.x - center.x,
				y: canvasPosition.y + centerNew.y - center.y
			};

			scale(
				diagram,
				(distanceNew - distance) * 0.01,
				centerNew);
		}

		distance = distanceNew;
		center = centerNew;

		if (evt.isPrimary) {
			mainPointerPos = evtPos(evt);
		} else {
			secondPointer.pos = evtPos(evt);
		}
	});
	svg.addEventListener('pointerleave', cancel);
	svg.addEventListener('pointerout', cancel);
	svg.addEventListener('pointercancel', cancel);
	svg.addEventListener('pointerup', cancel);
}

/**
 * @param {IDiagram} diagram
 * @param {number} scaleDelta
 * @param {Point} fixedPoint
 */
function scale(diagram, scaleDelta, fixedPoint) {
	const scale = diagram.scale + scaleDelta;
	if (scale < 0.25 || scale > 4) { return; }
	diagram.selected = null;
	diagram.scaleSet(scale, fixedPoint);
}

/**
 * @param { {clientX:number, clientY:number} } evt
 * @return {Point}
 */
function evtPos(evt) { return { x: evt.clientX, y: evt.clientY }; }
