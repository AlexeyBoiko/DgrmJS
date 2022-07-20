import { ConnectorManager } from '../connector/connector-manager.js';
import { Diagram } from '../diagram.js';
import { svgPositionGet } from '../infrastructure/svg-utils.js';
import { pathCreate } from './svg-path/svg-path-factory.js';
import { SvgPresenter } from './svg-presenter.js';
import { connectorsInit, shapeCreate } from './svg-shape/svg-shape-factory.js';
import { ConnectorEvtProc } from '../event-processors/connector-evt-proc.js';
import { ShapeEvtProc } from '../event-processors/shape-evt-proc.js';

/**
 * @param {SVGSVGElement} svg
 * @param {ISvgPresenterShapeFactory?=} shapeFactory
 * @returns {IDiagram}
 */
export function svgDiagramCreate(svg, shapeFactory) {
	/**
	 * @param {DiagramChildAddType} type
	 * @param {ISvgPresenterShapeFactoryParam | ISvgPresenterPathFactoryParam} param
	 * @returns {ISvgPresenterShape | ISvgPresenterPath}
	 */
	function _shapeFactory(type, param) {
		switch (type) {
			case 'shape': return shapeFact(param, shapeFactory);
			case 'path': {
				const path = shapeFactory
					? /** @type {ISvgPresenterPath} */(shapeFactory('path', param))
					: pathCreate(param);
				param.svgElemToPresenterObj.set(path.svgEl, path);
				return path;
			}
		}
	}

	const presenter = new SvgPresenter(svg, _shapeFactory);
	return new Diagram(presenter, new ConnectorManager(presenter),
		dgrm => {
			const shapeEvtProc = new ShapeEvtProc(dgrm);
			return new Map([
				[/** @type {DiagramElementType} */('shape'), /** @type {IDiagramPrivateEventProcessor} */(shapeEvtProc)],
				['canvas', shapeEvtProc],
				['connector', new ConnectorEvtProc(dgrm)]
			]);
		});
}

/**
 * @param {ISvgPresenterShapeFactoryParam} param
 * @param {ISvgPresenterShapeFactory?=} shapeFactory
 * @returns {ISvgPresenterShape}
 */
function shapeFact(param, shapeFactory) {
	if (!param.createParams.postionIsIntoCanvas) {
		const canvasPosition = svgPositionGet(param.svgCanvas);
		param.createParams.position.x -= canvasPosition.x;
		param.createParams.position.y -= canvasPosition.y;
	}

	const shape = shapeFactory
		? /** @type {ISvgPresenterShape} */(shapeFactory('shape', param))
		: shapeCreate(param.svgCanvas, param.createParams);

	param.svgElemToPresenterObj.set(shape.svgEl, shape);
	connectorsInit(param.svgElemToPresenterObj, shape);
	shape.update(param.createParams);

	return shape;
}
