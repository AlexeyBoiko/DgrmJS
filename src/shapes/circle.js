/**
 * @param {CanvasData} canvasData
 * @param {CircleData} circleData
 */
export function circle(canvasData, circleData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.innerHTML =
		`<circle data-key="outer" r="72" fill="transparent" stroke="red" stroke-width="1" />
		<circle data-key="main" r="48" fill="#ff6600" stroke="#fff" stroke-width="1" class="main" data-text-for="text" />

		<text data-key="text" data-line-height="20" data-vertical-middle="10" x="0" y="0" text-anchor="middle" style="pointer-events: none;"
			alignment-baseline="central" fill="#fff">&nbsp;</text>

		<circle data-key="outright" data-connect="out" data-connect-point="48,0" data-connect-dir="right" r="10" cx="48" cy="0" />
		<circle data-key="outleft" data-connect="out" data-connect-point="-48,0" data-connect-dir="left" r="10" cx="-48" cy="0" />
		<circle data-key="outbottom" data-connect="out" data-connect-point="0,48" data-connect-dir="bottom" r="10" cx="0" cy="48" />
		<circle data-key="outtop" data-connect="out" data-connect-point="0,-48" data-connect-dir="top" r="10" cx="0" cy="-48" />

		<circle data-key="inright" data-connect="in" data-connect-point="48,0" data-connect-dir="right" r="10" cx="48" cy="0" />
		<circle data-key="inleft" data-connect="in" data-connect-point="-48,0" data-connect-dir="left" r="10" cx="-48" cy="0" />
		<circle data-key="inbottom" data-connect="in" data-connect-point="0,48" data-connect-dir="bottom" r="10" cx="0" cy="48" />
		<circle data-key="intop" data-connect="in" data-connect-point="0,-48" data-connect-dir="top" r="10" cx="0" cy="-48" />`;

	shapeEventsProcess(canvasData, svgGrp, circleData.position);

	return svgGrp;
}

/**
 * @param {CanvasData} canvasData
 * @param {SVGGraphicsElement} svgGrp
 * @param {Point} shapePosition
 */
function shapeEventsProcess(canvasData, svgGrp, shapePosition) {
	function transform() {
		svgGrp.style.transform = `translate(${shapePosition.x}px, ${shapePosition.y}px)`;
	};
	transform();

	const reset = moveEventProcess(
		// svgGrp.querySelector('[data-key="main"]'),
		svgGrp,
		canvasData,
		shapePosition,
		// onMoveStart
		evt => {
			if (document.elementFromPoint(evt.clientX, evt.clientY).hasAttribute('data-connect')) {
				reset();
				svgGrp.classList.remove('selected');

				const connectorElem = connector(canvasData, { x: evt.clientX, y: evt.clientY });
				svgGrp.ownerSVGElement.append(connectorElem);
				connectorElem.setPointerCapture(evt.pointerId);
			}
		},
		// onMove
		() => {
			svgGrp.classList.remove('selected');
			transform();
		},
		// onMoveEnd
		() => {
			shapePosition.x = placeToCell(shapePosition.x);
			shapePosition.y = placeToCell(shapePosition.y);
			transform();
		},
		// onClick
		() => {
			svgGrp.classList.add('selected');
		},
		// onOutdown
		() => {
			svgGrp.classList.remove('selected');
		});

	const cellSizeHalf = canvasData.cell / 2;
	/** @param {number} coordinate */
	function placeToCell(coordinate) {
		const coor = (Math.round(coordinate / canvasData.cell) * canvasData.cell);
		return (coordinate - coor > 0) ? coor + cellSizeHalf : coor - cellSizeHalf;
	}
}

/**
 * @param {CanvasData} canvasData
 * @param { Point } position
 */
function connector(canvasData, position) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.innerHTML = '<circle r="10" fill="transparent" stroke="red" stroke-width="1" />';

	function transform() {
		svgGrp.style.transform = `translate(${position.x}px, ${position.y}px)`;
	};
	transform();

	moveEventProcess(
		svgGrp,
		canvasData,
		position,
		// onMoveStart
		evt => {
			// if (document.elementFromPoint(evt.clientX, evt.clientY).hasAttribute('data-connect')) {
			// 	reset();
			// }
		},
		// onMove
		() => {
			// svgGrp.classList.remove('selected');
			transform();
		},
		// onMoveEnd
		() => {
			// shapePosition.x = placeToCell(shapePosition.x);
			// shapePosition.y = placeToCell(shapePosition.y);
			// transform();
		},
		// onClick
		() => {
			// svgGrp.classList.add('selected');
		},
		// onOutdown
		() => {
			// svgGrp.classList.remove('selected');
		});

	return svgGrp;
}

/**
 * @param { Element } element
 * @param { {scale:number} } canvasScale
 * @param { Point } shapePosition
 * @param { {(evt:PointerEvent):void} } onMoveStart
 * @param { {():void} } onMove
 * @param { {():void} } onMoveEnd
 * @param { {():void} } onClick
 * @param { {():void} } onOutdown
 */
function moveEventProcess(element, canvasScale, shapePosition, onMoveStart, onMove, onMoveEnd, onClick, onOutdown) {
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
		onMove();
	}

	function cancel() {
		if (isMoved) {
			onMoveEnd();
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

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {position: Point, title?: string} } CircleData */
/** @typedef { {scale:number, cell:number} } CanvasData */

export const processed = Symbol(0);
/** @typedef {PointerEvent & { [processed]?: boolean }} DgrmEvent */
