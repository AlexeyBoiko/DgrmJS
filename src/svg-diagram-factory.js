import { ConnectorManager } from './diagram/connector/connector-manager.js';
import { Diagram } from './diagram/diagram.js';
import { SvgPresenter } from './diagram/svg-presenter/svg-presenter.js';
import { connectorsInit, shapeCreate } from './diagram/svg-presenter/svg-shape/svg-shape-factory.js';
import { SvgShapeTextEditorDecorator } from './diagram-extensions/shapes/svg-shape-texteditor-decorator.js';

/**
 * @param {SVGSVGElement} svg
 * @returns {IDiagram}
 */
export function svgDiagramCreate(svg) {
	const presenter = new SvgPresenter(svg, shapeFuctory);
	return new Diagram(presenter, new ConnectorManager(presenter));
}

/**
 * @param {ISvgPresenterShapeFuctoryParam} param
 * @returns {ISvgPresenterShape}
 */
function shapeFuctory(param) {
	const shape = new SvgShapeTextEditorDecorator(
		shapeCreate(param.svgCanvas, param.createParams),
		param.createParams.props);
	param.svgElemToPresenterObj.set(shape.svgEl, shape);
	connectorsInit(param.listener, param.svgElemToPresenterObj, shape);
	return shape;
}
