import { SvgPath } from './svg-path.js';
import { elemCreateByTemplate } from '../svg-presenter-utils.js';

/**
 * @param {ISvgPresenterPathFactoryParam} param
 * @returns {SvgPath}
 */
export function pathCreate(param) {
	// TODO: to reduce DOM changes (for performance) 'new SvgPath' must go before 'svg.appendChild'
	return new SvgPath({
		svgEl: elemCreateByTemplate(param.svgCanvas, param.createParams.templateKey),
		start: param.createParams.start,
		end: param.createParams.end,
		startConnector: param.createParams.startConnector,
		endConnector: param.createParams.endConnector
	});
}
