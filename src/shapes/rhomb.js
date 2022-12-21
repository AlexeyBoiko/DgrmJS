import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { child, classAdd, positionSet } from '../infrastructure/util.js';
import { shapeEditEvtProc } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {RhombData} rectData
 */
export function rhomb(svg, canvasData, rectData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	classAdd(svgGrp, 'shrhomb');
	classAdd(svgGrp, 'hovertrack');
	svgGrp.innerHTML = `
		<path data-key="outer" data-evt-no data-evt-index="1" d="M-24 48 L48 -24 L120 48 L48 120 Z" stroke-width="1" stroke="red" fill="transparent" />
		<path data-key="border" d="M9 48 L48 9 L87 48 L48 87 Z" stroke-width="20" stroke="#fff"	fill="transparent" stroke-linejoin="round" />
		<path data-key="main" d="M9 48 L48 9 L87 48 L48 87 Z" stroke-width="18" stroke-linejoin="round"	stroke="#1D809F" fill="#1D809F" />

		<text data-key="text" x="48" y="24" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>

		<circle data-key="right" 	data-connect="right" 	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(96px, 48px);" />
		<circle data-key="left"		data-connect="left"		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, 48px);" />
		<circle data-key="bottom" 	data-connect="bottom"	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 96px);" />
		<circle data-key="top" 		data-connect="top" 		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 0);" />`;

	/** @type {ConnectorsData} */
	const connectorsInnerPosition = {
		right: { dir: 'right', position: { x: 96, y: 48 } },
		left: { dir: 'left', position: { x: 0, y: 48 } },
		bottom: { dir: 'bottom', position: { x: 48, y: 96 } },
		top: { dir: 'top', position: { x: 48, y: 0 } }
	};

	const textSettings = {
		/** @type {SVGTextElement} */
		el: child(svgGrp, 'text'),
		/** vericale middle, em */
		vMid: 3
	};

	const shapeProc = shapeEditEvtProc(svg, canvasData, svgGrp, rectData, connectorsInnerPosition, textSettings,
		// onTextChange
		() => {
			// const textBox = textSettings.el.getBBox();
			// const newWidth = ceil(96, 48, textBox.width + (rectData.t ? 6 : 0)); // 6 px right padding for text shape
			// const newHeight = ceil(48, 48, textBox.height);

			// if (rectData.w !== newWidth || rectData.h !== newHeight) {
			// 	rectData.w = newWidth;
			// 	rectData.h = newHeight;
			// 	resizeAndDraw();
			// }
		}
	);

	function resizeAndDraw() {
		const connectors = rhombCalc(96, 96, rectData.w + 18, 0); // 96 = 24 * 4
		connectorsInnerPosition.right.position.x = connectors.r.x;
		connectorsInnerPosition.left.position.x = connectors.l.x;
		connectorsInnerPosition.bottom.position.y = connectors.b.y;
		connectorsInnerPosition.top.position.y = connectors.t.y;
		for (const connectorKey in connectorsInnerPosition) {
			positionSet(child(svgGrp, connectorKey), connectorsInnerPosition[connectorKey].position);
		}

		const mainRhomb = rhombCalc(78, 78, rectData.w, 9);
		rhombSet(svgGrp, 'main', mainRhomb);
		rhombSet(svgGrp, 'border', mainRhomb);
		rhombSet(svgGrp, 'outer', rhombCalc(78, 78, rectData.w + 48 + 18, 9));

		shapeProc.draw();
	}

	if (!!rectData.w && rectData.w !== 96) { resizeAndDraw(); } else { shapeProc.draw(); }
	svgTextDraw(textSettings.el, textSettings.vMid, rectData.title);

	return svgGrp;
}

/**
 * @param {Element} svgGrp, @param {string} key,
 * @param {RhombPoints} rhomb
 */
function rhombSet(svgGrp, key, rhomb) {
	/** @type {SVGPathElement} */(child(svgGrp, key)).setAttribute('d', `M${rhomb.l.x} ${rhomb.l.y} L${rhomb.t.x} ${rhomb.t.y} L${rhomb.r.x} ${rhomb.r.y} L${rhomb.b.x} ${rhomb.b.y} Z`);
}

/**
 * @param {number} baseWidth, @param {number} baseHeight
 * @param {number} width, @param {number} margin
 * @returns {RhombPoints}
 */
function rhombCalc(baseWidth, baseHeight, width, margin) {
	const incrm = (width - baseWidth) / 2;
	const incrmNeg = -1 * incrm;
	return {
		l: { x: incrmNeg + margin, y: baseHeight / 2 + margin },
		t: { x: baseWidth / 2 + margin, y: incrmNeg + margin },
		r: { x: baseWidth + incrm + margin, y: baseHeight / 2 + margin },
		b: { x: baseWidth / 2 + margin, y: baseHeight + incrm + margin }
	};
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc.js').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc.js').ConnectorsData } ConnectorsData */
/**
@typedef {{
type:number, position: Point, title?: string, style?: string,
w?:number
}} RhombData
*/
/** @typedef { { l:Point, t:Point, r:Point, b:Point } } RhombPoints */
