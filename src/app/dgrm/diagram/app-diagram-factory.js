//
// diagram

import { SvgPresenter } from '../../../diagram/svg-presenter/svg-presenter.js';
import { ConnectorManager } from '../../../diagram/connector/connector-manager.js';
import { Diagram } from '../../../diagram/diagram.js';

//
// shape factory

import { connectorsInit, shapeCreate } from '../../../diagram/svg-presenter/svg-shape/svg-shape-factory.js';
import { pathCreate } from '../../../diagram/svg-presenter/svg-path/svg-path-factory.js';

import { AppCircleDecorator } from '../shapes/app-circle-decorator.js';
import { AppRectDecorator } from '../shapes/app-rect-decorator.js';
import { AppRhombDecorator } from '../shapes/app-rhomb-decorator.js';
import { AppPathEditiorDecorator } from '../shapes/app-editor-decorator.js';

//
// event processors

import { ShapeEvtProc } from '../../../diagram/event-processors/shape-evt-proc.js';
import { ConnectorEvtProc } from '../../../diagram/event-processors/connector-evt-proc.js';
import { PathEvtProc } from '../../../diagram/event-processors/path-evt-proc.js';
import { AppCanvasSelecEvtProc } from './app-canvas-selec-evt-proc.js';

//
// other diagram features

import { scaleFeature } from '../../../diagram-extensions/scale-feature.js';

/**
 * @param {SVGSVGElement} svg
 * @returns {IDiagram}
 */
export function appDiagramFactory(svg) {
	/** @type {IDiagram} */
	let diagram = null;

	const presenter = new SvgPresenter(svg,
		// shape factrory
		(type, param) => {
			switch (type) {
				case 'shape': {
					/** @type {ISvgPresenterShape} */
					let shape = shapeCreate(param.svgCanvas, param.createParams);
					switch (param.createParams.templateKey) {
						case 'circle': shape = new AppCircleDecorator(diagram, shape, /** @type {DiagramShapeAddParam} */(param.createParams)); break;
						case 'rhomb': shape = new AppRhombDecorator(diagram, shape, /** @type {DiagramShapeAddParam} */(param.createParams)); break;
						case 'rect': shape = new AppRectDecorator(diagram, shape, /** @type {DiagramShapeAddParam} */(param.createParams)); break;
						case 'text': shape = new AppRectDecorator(diagram, shape, /** @type {DiagramShapeAddParam} */(param.createParams),
							{ resizeFromCenter: false });
							break;
						case 'connect-end': break;
					}

					param.svgElemToPresenterObj.set(shape.svgEl, shape);
					connectorsInit(param.svgElemToPresenterObj, shape);
					shape.update(param.createParams);
					return shape;
				}
				case 'path': {
					const path = new AppPathEditiorDecorator(diagram, pathCreate(param));
					param.svgElemToPresenterObj.set(path.svgEl, path);
					return path;
				}
			}
		});

	const connectorManager = new ConnectorManager(presenter);
	diagram = new Diagram(presenter, connectorManager,
		dgrm => new Set([
			new AppCanvasSelecEvtProc(dgrm, svg),
			new ShapeEvtProc(dgrm, connectorManager),
			new ConnectorEvtProc(dgrm, connectorManager),
			new PathEvtProc(dgrm)
		])
	);

	//
	// features

	scaleFeature(diagram, svg);

	return diagram;
}
