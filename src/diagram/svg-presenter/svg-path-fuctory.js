import { SvgPath } from './svg-path.js';

/**
 * @param {object} param
 * @param {SVGSVGElement} param.svg
 * @param {PresenterPathAppendParams} param.createParams
 * @returns {SvgPath}
 */
export function pathCreate({ svg, createParams }) {
	const pathSvgEl = /** @type {SVGGElement} */ (svg.getElementsByTagName('defs')[0]
		.querySelector(`[data-templ='${createParams.templateKey}']`)
		.cloneNode(true));

	// TODO: to reduce DOM changes (for performance) 'new SvgPath' must go before 'svg.appendChild'
	svg.appendChild(pathSvgEl);

	return new SvgPath({
		svgEl: pathSvgEl,
		start: createParams.start,
		end: createParams.end
	});
}
