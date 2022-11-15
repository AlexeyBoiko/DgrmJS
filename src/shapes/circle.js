/**
 * @param {PositionScale} canvasPostionScale
 * @param {CircleOptions} circleOptions
 */
export function circle(canvasPostionScale, circleOptions) {
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

	shapeEventsProcess(canvasPostionScale, svgGrp, circleOptions.position);

	return svgGrp;
}

/**
 * @param {PositionScale} canvasPostionScale
 * @param {SVGGraphicsElement} svgGrp
 * @param {Point} shapePosition
 */
function shapeEventsProcess(canvasPostionScale, svgGrp, shapePosition) {
	function transform() {
		svgGrp.style.transform = `translate(${shapePosition.x}px, ${shapePosition.y}px)`;
	};
	transform();

	/** @type {Point} */
	let pointDownShift;

	/** @param {PointerEvent} evt */
	function onMove(evt) {
		if (pointDownShift) {
			shapePosition.x = (evt.clientX + pointDownShift.x) / canvasPostionScale.scale;
			shapePosition.y = (evt.clientY + pointDownShift.y) / canvasPostionScale.scale;
			transform();
		}
	}

	function cancel() {
		pointDownShift = null;
		svgGrp.removeEventListener('pointermove', onMove);
	}

	svgGrp.querySelector('[data-key="main"]').addEventListener('pointerdown', /** @param {PointerEvent} evt */ evt => {
		evt.stopPropagation();
		svgGrp.setPointerCapture(evt.pointerId);
		svgGrp.addEventListener('pointercancel', cancel, { passive: true, once: true });
		svgGrp.addEventListener('pointerup', cancel, { passive: true, once: true });
		svgGrp.addEventListener('pointermove', onMove, { passive: true });

		pointDownShift = {
			x: shapePosition.x * canvasPostionScale.scale - evt.clientX,
			y: shapePosition.y * canvasPostionScale.scale - evt.clientY
		};
	}, { passive: true });
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {position: Point, title?: string} } CircleOptions */
/** @typedef { {position:Point, scale:number} } PositionScale */
