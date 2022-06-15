import { SvgPath } from './svg-path.js';

/**
 * @param {object} param
 * @param {SVGGElement} param.svgCanvas
 * @param {PresenterPathAppendParam} param.createParams
 * @param {WeakMap<SVGGraphicsElement, IPresenterElement>} param.svgElemToPresenterObj
 * @returns {SvgPath}
 */
export function pathCreate({ svgCanvas, svgElemToPresenterObj, createParams }) {
	const pathSvgEl = /** @type {SVGPathElement} */ (svgCanvas.ownerSVGElement.getElementsByTagName('defs')[0]
		.querySelector(`[data-templ='${createParams.templateKey}']`)
		.cloneNode(true));

	// TODO: to reduce DOM changes (for performance) 'new SvgPath' must go before 'svg.appendChild'
	svgCanvas.append(pathSvgEl);

	const path = new SvgPath({
		svgEl: pathSvgEl,
		start: createParams.start,
		end: createParams.end,
		startConnector: createParams.startConnector,
		endConnector: createParams.endConnector
	});

	svgElemToPresenterObj.set(pathSvgEl, path);
	return path;
}
