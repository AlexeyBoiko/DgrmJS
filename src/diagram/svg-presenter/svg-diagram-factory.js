import { ConnectorManager } from '../connector/connector-manager.js';
import { Diagram } from '../diagram.js';
import { pathCreate } from './svg-path/svg-path-factory.js';
import { SvgPresenter } from './svg-presenter.js';
import { connectorsInit, shapeCreate } from './svg-shape/svg-shape-factory.js';
import { ConnectorEvtProc } from '../event-processors/connector-evt-proc.js';
import { ShapeEvtProc } from '../event-processors/shape-evt-proc.js';
import { PathEvtProc } from '../event-processors/path-evt-proc.js';

/**
 * Defaut diagram factory
 * if you want to use custom shapeFactories, custom events proccesors - create your diagram factory
 * @param {SVGSVGElement} svg
 * @returns {IDiagram}
 */
export function svgDiagramCreate(svg) {
	const presenter = new SvgPresenter(svg,
		// shape factrory
		(type, param) => {
			switch (type) {
				case 'shape': {
					const shape = shapeCreate(param.svgCanvas, param.createParams.templateKey);
					param.svgElemToPresenterObj.set(shape.svgEl, shape);
					connectorsInit(param.svgElemToPresenterObj, shape);
					shape.update(param.createParams);

					return shape;
				}
				case 'path': {
					const path = pathCreate(param);
					param.svgElemToPresenterObj.set(path.svgEl, path);
					return path;
				}
			}
		});

	const connectorManager = new ConnectorManager(presenter);
	return new Diagram(presenter, connectorManager,
		dgrm => new Set([
			new ShapeEvtProc(dgrm, connectorManager),
			new ConnectorEvtProc(dgrm, connectorManager),
			new PathEvtProc(dgrm)
		])
	);
}
