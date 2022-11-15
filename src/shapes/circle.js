/**
 * @param {CanvasData} canvasData
 * @param {CircleOptions} circleOptions
 */
export function circle(canvasData, circleOptions) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.innerHTML =
	`<g data-templ="circle" data-center="0,0" id="circle">
		<circle data-key="outer" data-evt-no-click="" data-evt-z-index="1" r="72" fill="transparent"
			stroke="transparent" stroke-width="1" />
		<circle data-key="main" r="48" fill="#ff6600" stroke="#fff" stroke-width="1" class="main" data-text-for="text" />

		<text data-key="text" data-line-height="20" data-vertical-middle="10" x="0" y="0" text-anchor="middle" style="pointer-events: none;"
			alignment-baseline="central" fill="#fff">&nbsp;</text>

		<circle data-key="outright" data-connect="out" data-connect-point="48,0" data-connect-dir="right"
			data-evt-z-index="1" r="10" cx="48" cy="0" />
		<circle data-key="outleft" data-connect="out" data-connect-point="-48,0" data-connect-dir="left"
			data-evt-z-index="1" r="10" cx="-48" cy="0" />
		<circle data-key="outbottom" data-connect="out" data-connect-point="0,48" data-connect-dir="bottom"
			data-evt-z-index="1" r="10" cx="0" cy="48" />
		<circle data-key="outtop" data-connect="out" data-connect-point="0,-48" data-connect-dir="top"
			data-evt-z-index="1" r="10" cx="0" cy="-48" />

		<circle data-key="inright" data-connect="in" data-connect-point="48,0" data-connect-dir="right"
			data-evt-z-index="1" r="10" cx="48" cy="0" />
		<circle data-key="inleft" data-connect="in" data-connect-point="-48,0" data-connect-dir="left"
			data-evt-z-index="1" r="10" cx="-48" cy="0" />
		<circle data-key="inbottom" data-connect="in" data-connect-point="0,48" data-connect-dir="bottom"
			data-evt-z-index="1" r="10" cx="0" cy="48" />
		<circle data-key="intop" data-connect="in" data-connect-point="0,-48" data-connect-dir="top"
			data-evt-z-index="1" r="10" cx="0" cy="-48" />
	</g>`;

	shapeEventsProcess(canvasData, svgGrp, circleOptions.position);

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
		transform,
		// onMoveEnd
		() => {
			shapePosition.x = placeToCell(shapePosition.x);
			shapePosition.y = placeToCell(shapePosition.y);
			transform();
		});

	const cellSizeHalf = canvasData.cell / 2;
	/** @param {number} coordinate */
	function placeToCell(coordinate) {
		const coor = (Math.round(coordinate / canvasData.cell) * canvasData.cell);
		return (coordinate - coor > 0) ? coor + cellSizeHalf : coor - cellSizeHalf;
	}
}

/**
 * @param {Element} element
 * @param {CanvasData} canvasScale
 * @param {Point} shapePosition
 * @param {{():void}} onMove
 * @param {{():void}} onMoveEnd
 */
function moveEventProcess(element, canvasScale, shapePosition, onMove, onMoveEnd) {
	/** @type {Point} */
	let pointDownShift;

	let isMoved = false;

	/** @param {PointerEvent} evt */
	function move(evt) {
		if (pointDownShift) {
			shapePosition.x = (evt.clientX + pointDownShift.x) / canvasScale.scale;
			shapePosition.y = (evt.clientY + pointDownShift.y) / canvasScale.scale;
			isMoved = true;
			onMove();
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

	element.addEventListener('pointerdown', /** @param {PointerEvent} evt */ evt => {
		evt.stopPropagation();
		element.setPointerCapture(evt.pointerId);
		element.addEventListener('pointercancel', cancel, { passive: true, once: true });
		element.addEventListener('pointerup', cancel, { passive: true, once: true });
		element.addEventListener('pointermove', move, { passive: true });

		pointDownShift = {
			x: shapePosition.x * canvasScale.scale - evt.clientX,
			y: shapePosition.y * canvasScale.scale - evt.clientY
		};
	}, { passive: true });
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {position: Point, title?: string} } CircleOptions */
/** @typedef { {scale:number, cell:number} } CanvasData */
