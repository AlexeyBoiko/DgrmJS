import { textareaCreate } from '../infrastructure/svg-text-area.js';
import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
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

	/**
	 * @template T
	 * @param {string} key
	 * @returns T
	 */
	const child = (key) => /** @type {T} */(svgGrp.querySelector(`[data-key="${key}"]`));

	/** @type {SVGTextElement} */
	const textEl = child('text');

	const connectorsInnerPosition = {
		outright: { dir: 'right', position: { x: 48, y: 0 } },
		outleft: { dir: 'left', position: { x: -48, y: 0 } },
		outbottom: { dir: 'bottom', position: { x: 0, y: 48 } },
		outtop: { dir: 'top', position: { x: 0, y: -48 } }
	};

	function resize() {
		connectorsInnerPosition.outright.position.x = circleData.r;
		connectorsInnerPosition.outleft.position.x = -circleData.r;
		connectorsInnerPosition.outbottom.position.y = circleData.r;
		connectorsInnerPosition.outtop.position.y = -circleData.r;

		for (const connectorKey in connectorsInnerPosition) {
			crclPos(child(connectorKey), connectorsInnerPosition[connectorKey].position);
		}

		crclR(child('outer'), circleData.r + 24);
		crclR(child('main'), circleData.r);
	}

	if (!!circleData.r && circleData.r !== 48) { resize(); }
	svgTextDraw(textEl, circleData.title, 0);

	function onTextChange(txt) { circleData.title = txt; }
	let textEditorDispose;
	shapeEvtProc(svg, canvasData, svgGrp, circleData.position, /** @type {ConnectorsData} */(connectorsInnerPosition),
		// onEdit
		() => { textEditorDispose = textareaCreate(textEl, 0, circleData.title, onTextChange, onTextChange); },
		// onEditStop
		() => {
			textEditorDispose();
			textEditorDispose = null;
		}
	);

	return svgGrp;
}

/**
 * @param {SVGCircleElement} crcl
 * @param {number} r
 */
function crclR(crcl, r) { crcl.r.baseVal.value = r; }

/**
 * @param {SVGCircleElement} crcl
 * @param {Point} pos
 */
function crclPos(crcl, pos) { crcl.cx.baseVal.value = pos.x; crcl.cy.baseVal.value = pos.y; }

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc.js').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc.js').ConnectorsData } ConnectorsData */
/** @typedef { {position: Point, title?: string, r?:number} } CircleData */
