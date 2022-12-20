import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { ceil, child, classAdd, positionSet } from '../infrastructure/util.js';
import { shapeEditEvtProc } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {RectData} rectData
 */
export function rect(svg, canvasData, rectData) {
	const svgGrp = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	classAdd(svgGrp, 'hovertrack');
	if (rectData.t) { classAdd(svgGrp, 'shtxt'); }
	svgGrp.innerHTML = `
		<rect data-key="outer" data-evt-no data-evt-index="1" width="144" height="96" x="-24" y="-24" fill="transparent" stroke="transparent" stroke-width="1" />
		<rect data-key="main" width="96" height="48" rx="15" ry="15" fill="#1aaee5" stroke="#fff" stroke-width="1" />

		<text data-key="text" y="24" ${rectData.t ? 'x="8"' : 'x="48" text-anchor="middle"'} style="pointer-events: none;" fill="#fff">&nbsp;</text>

		<circle data-key="right" 	data-connect="right" 	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(96px, 24px);" />
		<circle data-key="left"		data-connect="left"		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, 24px);" />
		<circle data-key="bottom" 	data-connect="bottom"	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 48px);" />
		<circle data-key="top" 		data-connect="top" 		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 0);" />`;

	rectData.w = rectData.w ?? 96;
	rectData.h = rectData.h ?? 48;

	/** @type {ConnectorsData} */
	const connectorsInnerPosition = {
		right: { dir: 'right', position: { x: 96, y: 24 } },
		left: { dir: 'left', position: { x: 0, y: 24 } },
		bottom: { dir: 'bottom', position: { x: 48, y: 48 } },
		top: { dir: 'top', position: { x: 48, y: 0 } }
	};

	const textSettings = {
		/** @type {SVGTextElement} */
		el: child(svgGrp, 'text'),
		/** vericale middle, em */
		vMid: 1.5
	};

	const shapeProc = shapeEditEvtProc(svg, canvasData, svgGrp, rectData, connectorsInnerPosition, textSettings,
		// onTextChange
		() => {
			const textBox = textSettings.el.getBBox();
			const newWidth = ceil(96, 48, textBox.width + (rectData.t ? 6 : 0)); // 6 px right padding for text shape
			const newHeight = ceil(48, 48, textBox.height);

			if (rectData.w !== newWidth || rectData.h !== newHeight) {
				rectData.w = newWidth;
				rectData.h = newHeight;
				resizeAndDraw();
			}
		}
	);

	function resizeAndDraw() {
		const mainX = rectData.t ? 0 : (96 - rectData.w) / 2;
		const mainY = (48 - rectData.h) / 2;

		const middleX = rectData.w / 2 + mainX;
		const middleY = rectData.h / 2 + mainY;

		connectorPositionSet(connectorsInnerPosition.right, rectData.w + mainX, middleY);
		connectorPositionSet(connectorsInnerPosition.left, mainX, middleY);
		connectorPositionSet(connectorsInnerPosition.bottom, middleX, rectData.h + mainY);
		connectorPositionSet(connectorsInnerPosition.top, middleX, mainY);
		for (const connectorKey in connectorsInnerPosition) {
			positionSet(child(svgGrp, connectorKey), connectorsInnerPosition[connectorKey].position);
		}

		rectSet(svgGrp, 'main', rectData.w, rectData.h, mainX, mainY);
		rectSet(svgGrp, 'outer', rectData.w + 48, rectData.h + 48, mainX - 24, mainY - 24);

		shapeProc.draw();
	}

	if (!!rectData.w && (rectData.w !== 96 || rectData.h !== 48)) { resizeAndDraw(); } else { shapeProc.draw(); }
	svgTextDraw(textSettings.el, textSettings.vMid, rectData.title);

	return svgGrp;
}

/**
 * @param {Element} svgGrp, @param {string} key,
 * @param {number} w, @param {number} h
 * @param {number} x, @param {number} y
 */
function rectSet(svgGrp, key, w, h, x, y) {
	/** @type {SVGRectElement} */ const rect = child(svgGrp, key);
	rect.width.baseVal.value = w;
	rect.height.baseVal.value = h;
	rect.x.baseVal.value = x;
	rect.y.baseVal.value = y;
}

/** @param { {position:Point} } connectorEnd, @param {number} x, @param {number} y */
function connectorPositionSet(connectorEnd, x, y) {
	connectorEnd.position.x = x;
	connectorEnd.position.y = y;
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc.js').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc.js').ConnectorsData } ConnectorsData */
/**
@typedef {{
type:number, position: Point, title?: string, style?: string,
w?:number, h?:number
t?:boolean
}} RectData */
