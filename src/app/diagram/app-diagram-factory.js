import { svgDiagramCreate } from '../../diagram/svg-presenter/svg-diagram-factory.js';
import { shapeCreate } from '../../diagram/svg-presenter/svg-shape/svg-shape-factory.js';
import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';
import { AppCircleDecorator } from '../shapes/app-circle-decorator.js';
import { AppRectDecorator } from '../shapes/app-rect-decorator.js';
import { AppRhombDecorator } from '../shapes/app-rhomb-decorator.js';

/**
 * @param {SVGSVGElement} svg
 * @returns {IDiagram}
 */
export function appDiagramFactory(svg) {
	const diagram = svgDiagramCreate(
		svg,
		// shapeFactory
		param => {
			const shape = shapeCreate(param.svgCanvas, param.createParams);
			switch (param.createParams.templateKey) {
				case 'circle': return new AppCircleDecorator(diagram, shape, param.createParams.props);
				case 'rhomb': return new AppRhombDecorator(diagram, shape, param.createParams.props);
				case 'rect': return new AppRectDecorator(diagram, shape, param.createParams.props);
				default: return new SvgShapeTextEditorDecorator(shape, param.createParams.props);
			}
		}
	);
	return diagram;
}
