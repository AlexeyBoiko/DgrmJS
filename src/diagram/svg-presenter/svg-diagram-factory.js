import { ConnectorManager } from '../connector/connector-manager.js';
import { Diagram } from '../diagram.js';
import { svgPositionGet } from '../infrastructure/svg-utils.js';
import { SvgPresenter } from './svg-presenter.js';
import { connectorsInit, shapeCreate } from './svg-shape/svg-shape-factory.js';

/**
 * @param {SVGSVGElement} svg
 * @param {ISvgPresenterShapeFactory?=} shapeFactory
 * @returns {IDiagram}
 */
export function svgDiagramCreate(svg, shapeFactory) {
	/**
	 * @param {ISvgPresenterShapeFactoryParam} param
	 * @returns {ISvgPresenterShape}
	 */
	function _shapeFactory(param) {
		if (!param.createParams.postionIsIntoCanvas) {
			const canvasPosition = svgPositionGet(param.svgCanvas);
			param.createParams.position.x -= canvasPosition.x;
			param.createParams.position.y -= canvasPosition.y;
		}

		/** @type {ISvgPresenterShape} */
		const shape = shapeFactory ? shapeFactory(param) : shapeCreate(param.svgCanvas, param.createParams);

		param.svgElemToPresenterObj.set(shape.svgEl, shape);
		connectorsInit(param.svgElemToPresenterObj, shape);
		shape.update(param.createParams);

		return shape;
	}

	const presenter = new SvgPresenter(svg, _shapeFactory);
	return new Diagram(presenter, new ConnectorManager(presenter));
}
