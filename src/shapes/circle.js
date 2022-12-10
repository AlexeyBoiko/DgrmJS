import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { ceil, child } from '../infrastructure/util.js';
import { shapeEditEvtProc } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {CircleData} circleData
 */
export function circle(svg, canvasData, circleData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.classList.add('hovertrack');
	svgGrp.innerHTML = `
		<circle data-key="outer" data-evt-no data-evt-index="1" r="72" fill="transparent" stroke-width="0" />
		<circle data-key="main" r="48" fill="#ff6600" stroke="#fff" stroke-width="1" />

		<text data-key="text" x="0" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>

		<circle data-key="right" 	data-connect="right" 	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 0);" />
		<circle data-key="left"		data-connect="left"		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(-48px, 0);" />
		<circle data-key="bottom" 	data-connect="bottom"	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, 48px);" />
		<circle data-key="top" 		data-connect="top" 		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, -48px);" />`;

	/** @type {ConnectorsData} */
	const connectorsInnerPosition = {
		right: { dir: 'right', position: { x: 48, y: 0 } },
		left: { dir: 'left', position: { x: -48, y: 0 } },
		bottom: { dir: 'bottom', position: { x: 0, y: 48 } },
		top: { dir: 'top', position: { x: 0, y: -48 } }
	};

	/** @type {SVGTextElement} */
	const textEl = child(svgGrp, 'text');

	const shapeProc = shapeEditEvtProc(svg, canvasData, svgGrp, circleData, connectorsInnerPosition, textEl,
		// onTextChange
		() => {
			const newRadius = textElRadius(textEl, 48, 24);
			if (newRadius !== circleData.r) {
				circleData.r = newRadius;
				resizeAndDraw();
			}
		}
	);

	function resizeAndDraw() {
		connectorsInnerPosition.right.position.x = circleData.r;
		connectorsInnerPosition.left.position.x = -circleData.r;
		connectorsInnerPosition.bottom.position.y = circleData.r;
		connectorsInnerPosition.top.position.y = -circleData.r;

		for (const connectorKey in connectorsInnerPosition) {
			positionSet(child(svgGrp, connectorKey), connectorsInnerPosition[connectorKey].position);
		}

		radiusSet(svgGrp, 'outer', circleData.r + 24);
		radiusSet(svgGrp, 'main', circleData.r);
		shapeProc.draw();
	}

	svgTextDraw(textEl, circleData.title, 0);
	if (!!circleData.r && circleData.r !== 48) { resizeAndDraw(); } else { shapeProc.draw(); }

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
/** @typedef { {type:number, position: Point, title?: string, style?: string, r?:number} } CircleData */
