import { SvgPath } from './svg-path.js';

/**
 * @param {object} param
 * @param {SVGGElement} param.svgCanvas
 * @param {PresenterPathAppendParams} param.createParams
 * @returns {SvgPath}
 */
export function pathCreate({ svgCanvas, createParams }) {
	const pathSvgEl = /** @type {SVGPathElement} */ (svgCanvas.ownerSVGElement.getElementsByTagName('defs')[0]
		.querySelector(`[data-templ='${createParams.templateKey}']`)
		.cloneNode(true));

	// TODO: to reduce DOM changes (for performance) 'new SvgPath' must go before 'svg.appendChild'
	svgCanvas.appendChild(pathSvgEl);

	return new SvgPath({
		svgEl: pathSvgEl,
		start: createParams.start,
		end: createParams.end
	});
}
