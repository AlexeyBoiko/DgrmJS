import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';
import { svgDiagramCreate } from '../../diagram/svg-presenter/svg-diagram-factory.js';
import { AppCircleDecorator } from '../shapes/app-circle-decorator.js';

/**
 * @param {SVGSVGElement} svg
 * @returns {IDiagram}
 */
export function appDiagramFactory(svg) {
	const diagram = svgDiagramCreate(
		svg,
		(shape, param) => {
			switch (param.createParams.templateKey) {
				case 'circle': return new AppCircleDecorator(diagram, shape, param.createParams.props);
				default: return new SvgShapeTextEditorDecorator(shape, param.createParams.props);
			}
		});
	return diagram;
}
