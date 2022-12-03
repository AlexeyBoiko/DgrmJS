import { textareaCreate } from '../infrastructure/svg-text-area.js';
import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { ceil, child } from '../infrastructure/util.js';
import { shapeEvtProc } from './shape-evt-proc.js';

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

		<circle data-key="outright" data-connect="outright" class="hovertrack" data-evt-index="2" r="10" cx="48" cy="0" />
		<circle data-key="outleft" data-connect="outleft" class="hovertrack" data-evt-index="2" r="10" cx="-48" cy="0" />
		<circle data-key="outbottom" data-connect="outbottom" class="hovertrack" data-evt-index="2" r="10" cx="0" cy="48" />
		<circle data-key="outtop" data-connect="outtop" class="hovertrack" data-evt-index="2" r="10" cx="0" cy="-48" />`;

	const connectorsInnerPosition = {
		outright: { dir: 'right', position: { x: 48, y: 0 } },
		outleft: { dir: 'left', position: { x: -48, y: 0 } },
		outbottom: { dir: 'bottom', position: { x: 0, y: 48 } },
		outtop: { dir: 'top', position: { x: 0, y: -48 } }
	};

	/** @type {SVGTextElement} */
	const textEl = child(svgGrp, 'text');

	let textEditorDispose;
	const draw = shapeEvtProc(svg, canvasData, svgGrp, circleData.position, /** @type {ConnectorsData} */(connectorsInnerPosition),
		// onEdit
		() => { textEditorDispose = textareaCreate(textEl, 0, circleData.title, onTextChange, onTextChange); },
		// onEditStop
		() => {
			textEditorDispose();
			textEditorDispose = null;
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

	/** @param {string} txt */
	function onTextChange(txt) {
		circleData.title = txt;

		// resize
		const newRadius = textElRadius(textEl, 48, 24);
		if (newRadius !== circleData.r) {
			circleData.r = newRadius;
			resizeAndDraw();
			// this.panelUpdPos();
		}
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
function positionSet(crcl, pos) { crcl.cx.baseVal.value = pos.x; crcl.cy.baseVal.value = pos.y; }

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
/** @typedef { {position: Point, title?: string, r?:number} } CircleData */
