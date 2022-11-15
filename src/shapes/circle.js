/**
 * @param {CanvasData} canvasData
 * @param {CircleData} circleData
 */
export function circle(canvasData, circleData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.innerHTML =
	`<g>
		<circle r="72" fill="transparent" stroke="transparent" stroke-width="1" />
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
		<circle data-key="intop" data-connect="in" data-connect-point="0,-48" data-connect-dir="top" r="10" cx="0" cy="-48" />
	</g>`;

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

	moveEventProcess(
		svgGrp.querySelector('[data-key="main"]'),
		canvasData,
		shapePosition,
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
 * @param { Element } element
 * @param { {scale:number} } canvasScale
 * @param { Point } shapePosition
 * @param { {():void} } onMove
 * @param { {():void} } onMoveEnd
 * @param { {():void} } onClick
 * @param { {():void} } onOutdown
 */
function moveEventProcess(element, canvasScale, shapePosition, onMove, onMoveEnd, onClick, onOutdown) {
	/** @type {Point} */
	let pointDownShift;

	/** @type {Point} */
	let pointDown;

	let isMoved = false;

	/** @param {PointerEvent} evt */
	function move(evt) {
		// fix old android
		if (!pointDown ||
			Math.abs(pointDown.x - evt.clientX) > 3 ||
			Math.abs(pointDown.y - evt.clientY) > 3) {
			pointDown = null;

			if (pointDownShift) {
				shapePosition.x = (evt.clientX + pointDownShift.x) / canvasScale.scale;
				shapePosition.y = (evt.clientY + pointDownShift.y) / canvasScale.scale;
				isMoved = true;
				onMove();
			}
		}
	}

	function cancel() {
		element.removeEventListener('pointermove', onMove);
		pointDownShift = null;
		if (isMoved) {
			onMoveEnd();
		}
		isMoved = false;
	}

	element.addEventListener('pointerdown', /** @param {DgrmEvent} evt */ evt => {
		if (!evt.isPrimary) {
			return;
		}

		evt[processed] = true;
		element.setPointerCapture(evt.pointerId);
		element.addEventListener('pointercancel', cancel, { passive: true, once: true });
		element.addEventListener('pointermove', move, { passive: true });

		element.addEventListener('pointerup', _ => {
			if (!isMoved) {
				onClick();
			}
			cancel();
		}, { passive: true, once: true });

		document.addEventListener('pointerdown', docEvt => {
			if (docEvt.target !== element) {
				onOutdown();
			}
		}, { passive: true, once: true, capture: true });

		pointDownShift = {
			x: shapePosition.x * canvasScale.scale - evt.clientX,
			y: shapePosition.y * canvasScale.scale - evt.clientY
		};

		pointDown = {
			x: evt.clientX,
			y: evt.clientY
		};
	}, { passive: true });
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {position: Point, title?: string} } CircleData */
/** @typedef { {scale:number, cell:number} } CanvasData */

export const processed = Symbol(0);
/** @typedef {PointerEvent & { [processed]?: boolean }} DgrmEvent */
