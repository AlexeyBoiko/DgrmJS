import { ceil, child, positionSet, svgTxtFarthestPoint } from '../infrastructure/util.js';
import { shapeCreate } from './shape-evt-proc.js';

/**
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {CircleData} circleData
 */
export function circle(svg, canvasData, circleData) {
	const templ = `
		<circle data-key="outer" data-evt-no data-evt-index="2" r="72" fill="transparent" stroke-width="0" />
		<circle data-key="main" r="48" fill="#ff6600" stroke="#fff" stroke-width="1" />
		<text data-key="text" x="0" y="0" text-anchor="middle" style="pointer-events: none;" fill="#fff">&nbsp;</text>`;

	const shape = shapeCreate(svg, canvasData, circleData, templ,
		{
			right: { dir: 'right', position: { x: 48, y: 0 } },
			left: { dir: 'left', position: { x: -48, y: 0 } },
			bottom: { dir: 'bottom', position: { x: 0, y: 48 } },
			top: { dir: 'top', position: { x: 0, y: -48 } }
		},
		// onTextChange
		txtEl => {
			const newRadius = textElRadius(txtEl, 48, 24);
			if (newRadius !== circleData.r) {
				circleData.r = newRadius;
				resize();
			}
		});

	function resize() {
		shape.cons.right.position.x = circleData.r;
		shape.cons.left.position.x = -circleData.r;
		shape.cons.bottom.position.y = circleData.r;
		shape.cons.top.position.y = -circleData.r;

		for (const connectorKey in shape.cons) {
			positionSet(child(shape.el, connectorKey), shape.cons[connectorKey].position);
		}

		radiusSet(shape.el, 'outer', circleData.r + 24);
		radiusSet(shape.el, 'main', circleData.r);
		shape.draw();
	}

	if (!!circleData.r && circleData.r !== 48) { resize(); } else { shape.draw(); }

	return shape.el;
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
/** @typedef { import('./shape-evt-proc').CanvasData } CanvasData */
/** @typedef { import('./shape-evt-proc').ConnectorsData } ConnectorsData */
/** @typedef { {type:number, position: Point, title?: string, styles?: string[], r?:number} } CircleData */
