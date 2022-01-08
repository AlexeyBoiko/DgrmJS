import { SvgFigure } from './svg-figure.js';

export class SvgFigureFuctory {
	/**
	 * @param {object} arg
	 * @param {SVGSVGElement} arg.svg
	 * @param {PresenterElementType} arg.type
	 * @param {PresenterShapeAppendParam} arg.param
	 * @param {EventListenerOrEventListenerObject} arg.listener
	 * @returns {IPresenterShape}
	 */
	figureCreate({ svg, type, param, listener }) {
		const figureSvg = /** @type {SVGGElement} */ (svg.getElementsByTagName('defs')[0]
			.querySelector(`[data-templ='${param.templateKey}']`)
			.cloneNode(true));

		const figure = new SvgFigure({ svgEl: figureSvg, type: type });
		figure.update(param.props);

		figureSvg.addEventListener('pointerdown', listener);

		figureSvg.querySelectorAll('[data-connect="out"]').forEach(/** @param {SVGGraphicsElement} el */el => {
			this._createConnectorInElement(el, figure);
			el.addEventListener('pointerdown', listener);
		});

		figureSvg.querySelectorAll('[data-connect="in"]')
			.forEach(el => {
				el.addEventListener('pointerup', listener);
			});

		return figure;
	}

	/**
	 * @param {SVGGraphicsElement} svgEl
	 * @returns {IPresenterConnector}
	 */
	_createConnectorInElement(svgEl, parentShape) {
		const point = svgEl.getAttribute('data-connect-point').split(',');
		return Object.assign(new SvgFigure({
			svgEl: svgEl,
			type: 'connectorIn',
			shape: parentShape
		}), {
			innerPosition: { x: parseFloat(point[0]), y: parseFloat(point[1]) },
			dir: /** @type {PresenterPathEndDirection} */ (svgEl.getAttribute('data-connect-dir'))
		});
	}
}

/**
 * @param {SvgFigureFuctoryParam} arg
 * @returns {IPresenterConnector}
 */
export function connectorInElementCreate(arg) {

}

/**
 * @param {SvgFigureFuctoryParam} arg
 * @returns {IPresenterConnector}
 */
 export function connectorOutElementCreate(arg) {

}

/**
 * @param {SvgFigureFuctoryParam} arg
 * @returns {IPresenterShape}
 */
export function shapeCreate(arg) {
	const figureSvg = /** @type {SVGGElement} */ (arg.svg.getElementsByTagName('defs')[0]
		.querySelector(`[data-templ='${arg.param.templateKey}']`)
		.cloneNode(true));

	const figure = new SvgFigure({ svgEl: figureSvg, type: 'shape' });
	figure.update(arg.param.props);

	figureSvg.addEventListener('pointerdown', arg.listener);

	figureSvg.querySelectorAll('[data-connect="out"]').forEach(/** @param {SVGGraphicsElement} el */el => {
		connectorOutElementCreate({svg:});
	});


	return figure;
}
