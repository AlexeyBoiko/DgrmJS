import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { ceil, child, classAdd, classDel } from '../infrastructure/util.js';
import { shapeEditEvtProc } from './shape-evt-proc.js';

/**
 * @param {HTMLElement} svg
 * @param {CanvasData} canvasData
 * @param {CircleData} circleData
 */
export function circle(svg, canvasData, circleData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.classList.add('hovertrack');
	svgGrp.innerHTML = `
		<circle data-key="outer" data-evt-no data-evt-index="1" r="72" fill="transparent" stroke="red" stroke-width="1" />
		<circle data-key="main" r="48" fill="#ff6600" stroke="#fff" stroke-width="1" />

		<text data-key="text" x="0" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>

		<circle data-key="outright" 	data-connect="outright" 	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 0);" />
		<circle data-key="outleft" 		data-connect="outleft" 		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(-48px, 0);" />
		<circle data-key="outbottom" 	data-connect="outbottom" 	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, 48px);" />
		<circle data-key="outtop" 		data-connect="outtop" 		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, -48px);" />`;

	/** @type {ConnectorsData} */
	const connectorsInnerPosition = {
		outright: { dir: 'right', position: { x: 48, y: 0 } },
		outleft: { dir: 'left', position: { x: -48, y: 0 } },
		outbottom: { dir: 'bottom', position: { x: 0, y: 48 } },
		outtop: { dir: 'top', position: { x: 0, y: -48 } }
	};

	/** @type {SVGTextElement} */
	const textEl = child(svgGrp, 'text');

	const draw = shapeEditEvtProc(svg, canvasData, svgGrp, circleData, connectorsInnerPosition, textEl,
		// onTextChange
		() => {
			const newRadius = textElRadius(textEl, 48, 24);
			if (newRadius !== circleData.r) {
				circleData.r = newRadius;
				resizeAndDraw();
			}
		},
		// onCmd
		evt => {
			switch (evt.detail.cmd) {
				case 'style':
					classDel(svgGrp, circleData.style);
					classAdd(svgGrp, evt.detail.arg);
					circleData.style = evt.detail.arg;
					break;
				case 'del':
					break;
			}
		}
	);

	function resizeAndDraw() {
		connectorsInnerPosition.outright.position.x = circleData.r;
		connectorsInnerPosition.outleft.position.x = -circleData.r;
		connectorsInnerPosition.outbottom.position.y = circleData.r;
		connectorsInnerPosition.outtop.position.y = -circleData.r;

		for (const connectorKey in connectorsInnerPosition) {
			positionSet(child(svgGrp, connectorKey), connectorsInnerPosition[connectorKey].position);
		}

		radiusSet(svgGrp, 'outer', circleData.r + 24);
		radiusSet(svgGrp, 'main', circleData.r);
		draw();
	}

	svgTextDraw(textEl, circleData.title, 0);
	if (!!circleData.r && circleData.r !== 48) { resizeAndDraw(); } else { draw(); }

	return svgGrp;
}

/**
 * @param {Element} svgGrp
 * @param {string} key
 * @param {number} r
 */
function radiusSet(svgGrp, key, r) { child(svgGrp, key).r.baseVal.value = r; }

/**
 * @param {SVGCircleElement} crcl
 * @param {Point} pos
 */
function positionSet(crcl, pos) { crcl.style.transform = `translate(${pos.x}px, ${pos.y}px)`; }

/**
 * calc radius that cover SVGTextElement bbox
 * @param {SVGTextElement} textEl
 * @param {*} minR
 * @param {*} step
 */
function textElRadius(textEl, minR, step) {
	let maxRadiusQrt = 0;
	for (const span of textEl.getElementsByTagName('tspan')) {
		for (const point of boxPoints(span.getBBox())) {
			const r = point.x ** 2 + point.y ** 2;
			if (r > maxRadiusQrt) { maxRadiusQrt = r; }
		}
	}
	return ceil(minR, step, Math.sqrt(maxRadiusQrt));
}

/** @param {DOMRect} box */
const boxPoints = (box) => [
	{ x: box.x, y: box.y },
	{ x: box.right, y: box.y },
	{ x: box.x, y: box.bottom },
	{ x: box.right, y: box.bottom }
];

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc.js').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc.js').ConnectorsData } ConnectorsData */
/** @typedef { {position: Point, title?: string, style?: string, r?:number} } CircleData */
