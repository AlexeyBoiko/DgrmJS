import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { ceil, child, positionSet, svgG, svgTxtFarthestPoint } from '../infrastructure/util.js';
import { shapeEditEvtProc } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {CircleData} circleData
 */
export function circle(svg, canvasData, circleData) {
	const svgGrp = svgG(`
		<circle data-key="outer" data-evt-no data-evt-index="2" r="72" fill="transparent" stroke-width="0" />
		<circle data-key="main" r="48" fill="#ff6600" stroke="#fff" stroke-width="1" />

		<text data-key="text" x="0" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>

		<circle data-key="right" 	data-connect="right" 	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 0);" />
		<circle data-key="left"		data-connect="left"		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(-48px, 0);" />
		<circle data-key="bottom" 	data-connect="bottom"	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, 48px);" />
		<circle data-key="top" 		data-connect="top" 		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, -48px);" />`);

	/** @type {ConnectorsData} */
	const connectorsInnerPosition = {
		right: { dir: 'right', position: { x: 48, y: 0 } },
		left: { dir: 'left', position: { x: -48, y: 0 } },
		bottom: { dir: 'bottom', position: { x: 0, y: 48 } },
		top: { dir: 'top', position: { x: 0, y: -48 } }
	};

	const textSettings = {
		/** @type {SVGTextElement} */
		el: child(svgGrp, 'text'),
		/** vericale middle, em */
		vMid: 0
	};

	const shapeProc = shapeEditEvtProc(svg, canvasData, svgGrp, circleData, connectorsInnerPosition, textSettings,
		// onTextChange
		() => {
			const newRadius = textElRadius(textSettings.el, 48, 24);
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

	if (!!circleData.r && circleData.r !== 48) { resizeAndDraw(); } else { shapeProc.draw(); }
	svgTextDraw(textSettings.el, textSettings.vMid, circleData.title);

	return svgGrp;
}

/** @param {Element} svgGrp, @param {string} key, @param {number} r */
function radiusSet(svgGrp, key, r) { /** @type {SVGCircleElement} */(child(svgGrp, key)).r.baseVal.value = r; }

/**
 * calc radius that cover all <tspan> in SVGTextElement
 * origin is in the center of the circle
 * @param {SVGTextElement} textEl
 * @param {*} minR
 * @param {*} step
 */
function textElRadius(textEl, minR, step) {
	const farthestPoint = svgTxtFarthestPoint(textEl);
	return ceil(minR, step, Math.sqrt(farthestPoint.x ** 2 + farthestPoint.y ** 2));
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('./shape-evt-proc.js').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc.js').ConnectorsData } ConnectorsData */
/** @typedef { {type:number, position: Point, title?: string, style?: string, r?:number} } CircleData */
