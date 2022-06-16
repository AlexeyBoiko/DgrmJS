import { SvgPath } from './svg-path.js';

/**
 * @param {ISvgPresenterPathFactoryParam} param
 * @returns {SvgPath}
 */
export function pathCreate(param) {
	const pathSvgEl = /** @type {SVGPathElement} */ (param.svgCanvas.ownerSVGElement.getElementsByTagName('defs')[0]
		.querySelector(`[data-templ='${param.createParams.templateKey}']`)
		.cloneNode(true));

	// TODO: to reduce DOM changes (for performance) 'new SvgPath' must go before 'svg.appendChild'
	param.svgCanvas.append(pathSvgEl);

	const path = new SvgPath({
		svgEl: pathSvgEl,
		start: param.createParams.start,
		end: param.createParams.end,
		startConnector: param.createParams.startConnector,
		endConnector: param.createParams.endConnector
	});

	param.svgElemToPresenterObj.set(pathSvgEl, path);
	return path;
}
