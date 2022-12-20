import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { child, classAdd } from '../infrastructure/util.js';
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
		<path data-key="outer" data-evt-no data-evt-index="1" d="M-24 48 L48 -24 L120 48 L48 120 Z" stroke-width="1" stroke="transparent" fill="transparent" />
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
		// const mainX = rectData.t ? 0 : (96 - rectData.w) / 2;
		// const mainY = (48 - rectData.h) / 2;

		// const middleX = rectData.w / 2 + mainX;
		// const middleY = rectData.h / 2 + mainY;

		// connectorPositionSet(connectorsInnerPosition.right, rectData.w + mainX, middleY);
		// connectorPositionSet(connectorsInnerPosition.left, mainX, middleY);
		// connectorPositionSet(connectorsInnerPosition.bottom, middleX, rectData.h + mainY);
		// connectorPositionSet(connectorsInnerPosition.top, middleX, mainY);
		// for (const connectorKey in connectorsInnerPosition) {
		// 	positionSet(child(svgGrp, connectorKey), connectorsInnerPosition[connectorKey].position);
		// }

		// rectSet(svgGrp, 'main', rectData.w, rectData.h, mainX, mainY);
		// rectSet(svgGrp, 'outer', rectData.w + 48, rectData.h + 48, mainX - 24, mainY - 24);

		shapeProc.draw();
	}

	if (!!rectData.w && rectData.w !== 96) { resizeAndDraw(); } else { shapeProc.draw(); }
	svgTextDraw(textSettings.el, textSettings.vMid, rectData.title);

	return svgGrp;
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
