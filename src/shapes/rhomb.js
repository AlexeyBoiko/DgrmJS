import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { ceil, child, positionSet, svgG, svgTxtFarthestPoint } from '../infrastructure/util.js';
import { shapeEditEvtProc } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {RhombData} rhombData
 */
export function rhomb(svg, canvasData, rhombData) {
	const svgGrp = svgG(`
		<path data-key="outer" data-evt-no data-evt-index="2" d="M-72 0 L0 -72 L72 0 L0 72 Z" stroke-width="0" fill="transparent" />
		<path data-key="border" d="M-39 0 L0 -39 L39 0 L0 39 Z" stroke-width="20" stroke="#fff"	fill="transparent" stroke-linejoin="round" />
		<path data-key="main" d="M-39 0 L0 -39 L39 0 L0 39 Z" stroke-width="18" stroke-linejoin="round"	stroke="#1D809F" fill="#1D809F" />

		<text data-key="text" x="0" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>

		<circle data-key="right" 	data-connect="right" 	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(48px, 0);" />
		<circle data-key="left"		data-connect="left"		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(-48px, 0);" />
		<circle data-key="bottom" 	data-connect="bottom"	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, 48px);" />
		<circle data-key="top" 		data-connect="top" 		class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(0, -48px);" />`, 'shrhomb');

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

	const shapeProc = shapeEditEvtProc(svg, canvasData, svgGrp, rhombData, connectorsInnerPosition, textSettings,
		// onTextChange
		() => {
			const newWidth = ceil(96, 48, textElRhombWidth(textSettings.el) - 20); // -20 experemental val
			if (newWidth !== rhombData.w) {
				rhombData.w = newWidth;
				resizeAndDraw();
			}
		}
	);

	function resizeAndDraw() {
		const connectors = rhombCalc(rhombData.w, 0);
		connectorsInnerPosition.right.position.x = connectors.r.x;
		connectorsInnerPosition.left.position.x = connectors.l.x;
		connectorsInnerPosition.bottom.position.y = connectors.b.y;
		connectorsInnerPosition.top.position.y = connectors.t.y;
		for (const connectorKey in connectorsInnerPosition) {
			positionSet(child(svgGrp, connectorKey), connectorsInnerPosition[connectorKey].position);
		}

		const mainRhomb = rhombCalc(rhombData.w, 9);
		rhombSet(svgGrp, 'main', mainRhomb);
		rhombSet(svgGrp, 'border', mainRhomb);
		rhombSet(svgGrp, 'outer', rhombCalc(rhombData.w, -24));

		shapeProc.draw();
	}

	if (!!rhombData.w && rhombData.w !== 96) { resizeAndDraw(); } else { shapeProc.draw(); }
	svgTextDraw(textSettings.el, textSettings.vMid, rhombData.title);

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
 * calc square rhomb points by width
 * origin is in the center of the rhomb
 * @param {number} width, @param {number} margin
 * @returns {RhombPoints}
 */
function rhombCalc(width, margin) {
	const half = width / 2;
	const mrgnMinHalf = margin - half;
	const halfMinMrgn = half - margin;
	return {
		l: { x: mrgnMinHalf, y: 0 },
		t: { x: 0, y: mrgnMinHalf },
		r: { x: halfMinMrgn, y: 0 },
		b: { x: 0, y: halfMinMrgn }
	};
}

/**
 * calc width of the square rhomb that cover all tspan in {textEl}
 * origin is in the center of the rhomb
 * @param {SVGTextElement} textEl
 */
function textElRhombWidth(textEl) {
	const farthestPoint = svgTxtFarthestPoint(textEl);
	return 2 * (Math.abs(farthestPoint.x) + Math.abs(farthestPoint.y));
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
