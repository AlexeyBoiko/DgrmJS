import { ConnectorManager } from '../connector/connector-manager.js';
import { Diagram } from '../diagram.js';
import { SvgPresenter } from './svg-presenter.js';
import { connectorsInit, shapeCreate } from './svg-shape/svg-shape-factory.js';

/**
 * @param {SVGSVGElement} svg
 * @param {ISvgPresenterShapeDecoratorFactory=} shapeDecoratorFactory
 * @returns {IDiagram}
 */
export function svgDiagramCreate(svg, shapeDecoratorFactory) {
	/**
	 * @param {ISvgPresenterShapeFactoryParam} param
	 * @returns {ISvgPresenterShape}
	 */
	function shapeFactory(param) {
		/** @type {ISvgPresenterShape} */
		let shape = shapeCreate(param.svgCanvas, param.createParams);
		if (shapeDecoratorFactory) {
			shape = shapeDecoratorFactory(shape, param);
		}
		param.svgElemToPresenterObj.set(shape.svgEl, shape);

		connectorsInit(param.listener, param.svgElemToPresenterObj, shape);
		return shape;
	}

	const presenter = new SvgPresenter(svg, shapeFactory);
	return new Diagram(presenter, new ConnectorManager(presenter));
}
