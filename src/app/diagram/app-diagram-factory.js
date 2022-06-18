import { svgDiagramCreate } from '../../diagram/svg-presenter/svg-diagram-factory.js';
import { shapeCreate } from '../../diagram/svg-presenter/svg-shape/svg-shape-factory.js';
import { AppCircleDecorator } from '../shapes/app-circle-decorator.js';
import { AppRectDecorator } from '../shapes/app-rect-decorator.js';
import { AppRhombDecorator } from '../shapes/app-rhomb-decorator.js';
import { pathCreate } from '../../diagram/svg-presenter/svg-path/svg-path-factory.js';
import { AppPathEditiorDecorator, AppShapeEditorDecorator } from '../shapes/app-editor-decorator.js';

/**
 * @param {SVGSVGElement} svg
 * @returns {IDiagram}
 */
export function appDiagramFactory(svg) {
	const diagram = svgDiagramCreate(
		svg,
		// shapeFactory
		(type, param) => {
			switch (type) {
				case 'shape': {
					const shape = shapeCreate(param.svgCanvas, param.createParams);
					switch (param.createParams.templateKey) {
						case 'circle': return new AppCircleDecorator(diagram, shape, /** @type {DiagramShapeAddParam} */(param.createParams).props);
						case 'rhomb': return new AppRhombDecorator(diagram, shape, /** @type {DiagramShapeAddParam} */(param.createParams).props);
						case 'rect': return new AppRectDecorator(diagram, shape, /** @type {DiagramShapeAddParam} */(param.createParams).props);
						case 'connect-end': return shape;
						case 'text': return new AppShapeEditorDecorator(shape, /** @type {DiagramShapeAddParam} */(param.createParams).props);
					}
					break;
				}
				case 'path': {
					return new AppPathEditiorDecorator(pathCreate(param));
				}
			}
		}
	);
	return diagram;
}
