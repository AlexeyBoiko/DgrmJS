import { SvgConnector } from '../svg-connector.js';
import { SvgShape } from './svg-shape.js';

/**
 * @param {SVGGElement} svgCanvas
 * @param {PresenterShapeAppendParam} createParams
 * @returns {SvgShape}
 */
export function shapeCreate(svgCanvas, createParams) {
	const shapeSvgEl = /** @type {SVGGElement} */ (svgCanvas.ownerSVGElement.getElementsByTagName('defs')[0]
		.querySelector(`[data-templ='${createParams.templateKey}']`)
		.cloneNode(true));

	// TODO: to reduce DOM changes (for performance) 'shape.update' must go before 'svg.append'
	svgCanvas.append(shapeSvgEl);
	return new SvgShape({ svgEl: shapeSvgEl });
}

/**
 * @param {WeakMap<SVGGraphicsElement, IPresenterElement>} svgElemToPresenterObj
 * @param {ISvgPresenterShape} shape
 */
export function connectorsInit(svgElemToPresenterObj, shape) {
	shape.connectable = shape.svgEl.getAttribute('data-connectable') === 'true';
	const defaultConnectPoint = parseConnectPointAttr(shape.svgEl);
	if (defaultConnectPoint) {
		// !circile link!
		shape.defaultInConnector = connectorCreate(shape.svgEl, shape);
	}

	// create connectors
	shape.svgEl.querySelectorAll('[data-connect]').forEach(
		/** @param {SVGGraphicsElement} el */el => {
			const connector = connectorCreate(el, shape);
			svgElemToPresenterObj.set(el, connector);
			shape.connectors.set(connector.key, connector);
		});

	svgElemToPresenterObj.set(shape.svgEl, shape);
}

/**
 * @param {SVGGraphicsElement} svgEl
 * @param {IPresenterShape} shape
 * @returns {IPresenterConnector}
 */
function connectorCreate(svgEl, shape) {
	return new SvgConnector({
		svgEl,
		connectorType: svgEl.getAttribute('data-connect') === 'in' ? 'in' : 'out',
		shape,
		key: svgEl.getAttribute('data-key'),
		innerPosition: parseConnectPointAttr(svgEl),
		dir: /** @type {PresenterPathEndDirection} */(svgEl.getAttribute('data-connect-dir'))
	});
}

/**
 * @param {SVGGraphicsElement} svgEl
 * @returns {Point | null}
 */
function parseConnectPointAttr(svgEl) {
	const attr = svgEl.getAttribute('data-connect-point');
	if (!attr) {
		return null;
	}
	const point = svgEl.getAttribute('data-connect-point').split(',');
	return { x: parseFloat(point[0]), y: parseFloat(point[1]) };
}
