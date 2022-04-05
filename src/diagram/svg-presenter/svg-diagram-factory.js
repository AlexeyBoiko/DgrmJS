import { ConnectorManager } from '../connector/connector-manager.js';
import { Diagram } from '../diagram.js';
import { SvgPresenter } from './svg-presenter.js';
import { connectorsInit, shapeCreate } from './svg-shape/svg-shape-factory.js';

/**
 * @param {SVGSVGElement} svg
 * @param {import('./svg-presenter-private-types.js').ISvgPresenterShapeDecoratorFuctory=} shapeDecoratorFuctory
 * @returns {import('../diagram-public-types.js').IDiagram}
 */
export function svgDiagramCreate(svg, shapeDecoratorFuctory) {
	/**
	 * @param {import('./svg-presenter-private-types.js').ISvgPresenterShapeFuctoryParam} param
	 * @returns {import('./svg-presenter-private-types.js').ISvgPresenterShape}
	 */
	function shapeFuctory(param) {
		/** @type {import('./svg-presenter-private-types.js').ISvgPresenterShape} */
		let shape = shapeCreate(param.svgCanvas, param.createParams);
		if (shapeDecoratorFuctory) {
			shape = shapeDecoratorFuctory(shape, param);
		}
		param.svgElemToPresenterObj.set(shape.svgEl, shape);

		connectorsInit(param.listener, param.svgElemToPresenterObj, shape);
		return shape;
	}

	const presenter = new SvgPresenter(svg, shapeFuctory);
	return new Diagram(presenter, new ConnectorManager(presenter));
}
