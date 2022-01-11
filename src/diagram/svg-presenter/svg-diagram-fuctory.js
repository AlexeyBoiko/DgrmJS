import { ConnectorManager } from '../connector/connector-manager.js';
import { DiagramBuilder } from '../diagram-builder.js';
import { SvgPresenter } from './svg-presenter.js';

/**
 * @param {SVGSVGElement} svg
 * @returns {DiagramBuilder}
 */
export function svgDiagramCreate(svg) {
	const presenter = new SvgPresenter(svg);
	return new DiagramBuilder(presenter, new ConnectorManager(presenter));
}
