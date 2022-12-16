import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { child, positionSet } from '../infrastructure/util.js';
import { shapeEditEvtProc } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {RectData} rectData
 */
export function rect(svg, canvasData, rectData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	svgGrp.classList.add('hovertrack');
	svgGrp.innerHTML = `
		<rect data-key="outer" data-evt-no data-evt-index="1" width="144" height="96" rx="15" ry="15" x="-24" y="-24" fill="transparent" stroke="transparent" stroke-width="1" />
		<rect data-key="main" width="96" height="48" rx="15" ry="15" fill="#1aaee5" stroke="#fff" stroke-width="1" />

		<text data-key="text" x="48" y="24" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>

		<circle data-key="right" 	data-connect="right" 	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(96px, 24px);" />
		<circle data-key="left"		data-connect="left"		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, 24px);" />
		<circle data-key="bottom" 	data-connect="bottom"	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 48px);" />
		<circle data-key="top" 		data-connect="top" 		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 0);" />`;

	/** @type {ConnectorsData} */
	const connectorsInnerPosition = {
		right: { dir: 'right', position: { x: 96, y: 24 } },
		left: { dir: 'left', position: { x: 0, y: 24 } },
		bottom: { dir: 'bottom', position: { x: 48, y: 48 } },
		top: { dir: 'top', position: { x: 48, y: 0 } }
	};

	/** @type {SVGTextElement} */
	const textEl = child(svgGrp, 'text');

	const shapeProc = shapeEditEvtProc(svg, canvasData, svgGrp, rectData, connectorsInnerPosition, textEl,
		// onTextChange
		() => {
			// const newRadius = textElRadius(textEl, 48, 24);
			// if (newRadius !== circleData.r) {
			// 	circleData.r = newRadius;
			// 	resizeAndDraw();
			// }
		}
	);

	function resizeAndDraw() {
		// connectorsInnerPosition.right.position.x = circleData.r;
		// connectorsInnerPosition.left.position.x = -circleData.r;
		// connectorsInnerPosition.bottom.position.y = circleData.r;
		// connectorsInnerPosition.top.position.y = -circleData.r;

		for (const connectorKey in connectorsInnerPosition) {
			positionSet(child(svgGrp, connectorKey), connectorsInnerPosition[connectorKey].position);
		}

		// radiusSet(svgGrp, 'outer', circleData.r + 24);
		// radiusSet(svgGrp, 'main', circleData.r);
		shapeProc.draw();
	}

	svgTextDraw(textEl, rectData.title, 0);
	if (!!rectData.w && (rectData.w !== 96 || rectData.h !== 48)) { resizeAndDraw(); } else { shapeProc.draw(); }

	return svgGrp;
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc.js').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc.js').ConnectorsData } ConnectorsData */
/** @typedef { {type:number, position: Point, title?: string, style?: string, w?:number, h?:number} } RectData */
