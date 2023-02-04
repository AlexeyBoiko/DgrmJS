import { ceil, child, classAdd, positionSet, svgTxtFarthestPoint } from '../infrastructure/util.js';
import { shapeCreate } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {RhombData} rhombData
 */
export function rhomb(svg, canvasData, rhombData) {
	const templ = `
		<path data-key="outer" data-evt-no data-evt-index="2" d="M-72 0 L0 -72 L72 0 L0 72 Z" stroke-width="0" fill="transparent" />
		<path data-key="border" d="M-39 0 L0 -39 L39 0 L0 39 Z" stroke-width="20" stroke="#fff"	fill="transparent" stroke-linejoin="round" />
		<path data-key="main" d="M-39 0 L0 -39 L39 0 L0 39 Z" stroke-width="18" stroke-linejoin="round"	stroke="#1D809F" fill="#1D809F" />
		<text data-key="text" x="0" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>`;

	const shape = shapeCreate(svg, canvasData, rhombData, templ,
		{
			right: { dir: 'right', position: { x: 48, y: 0 } },
			left: { dir: 'left', position: { x: -48, y: 0 } },
			bottom: { dir: 'bottom', position: { x: 0, y: 48 } },
			top: { dir: 'top', position: { x: 0, y: -48 } }
		},
		// onTextChange
		txtEl => {
			const newWidth = ceil(96, 48, textElRhombWidth(txtEl) - 20); // -20 experemental val
			if (newWidth !== rhombData.w) {
				rhombData.w = newWidth;
				resize();
			}
		});
	classAdd(shape.el, 'shrhomb');

	function resize() {
		const connectors = rhombCalc(rhombData.w, 0);
		shape.cons.right.position.x = connectors.r.x;
		shape.cons.left.position.x = connectors.l.x;
		shape.cons.bottom.position.y = connectors.b.y;
		shape.cons.top.position.y = connectors.t.y;
		for (const connectorKey in shape.cons) {
			positionSet(child(shape.el, connectorKey), shape.cons[connectorKey].position);
		}

		const mainRhomb = rhombCalc(rhombData.w, 9);
		rhombSet(shape.el, 'main', mainRhomb);
		rhombSet(shape.el, 'border', mainRhomb);
		rhombSet(shape.el, 'outer', rhombCalc(rhombData.w, -24));

		shape.draw();
	}

	if (!!rhombData.w && rhombData.w !== 96) { resize(); } else { shape.draw(); }

	return shape.el;
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
/** @typedef { import('./shape-evt-proc').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc').ConnectorsData } ConnectorsData */
/**
@typedef {{
type:number, position: Point, title?: string, styles?: string[],
w?:number
}} RhombData
*/
/** @typedef { { l:Point, t:Point, r:Point, b:Point } } RhombPoints */
