import { ConnectorManager } from '../connector/connector-manager.js';
import { Diagram } from '../diagram.js';
import { SvgPresenter } from './svg-presenter.js';

/**
 * @param {SVGSVGElement} svg
 * @returns {Diagram}
 */
export function svgDiagramCreate(svg) {
	const presenter = new SvgPresenter(svg);
	return new Diagram(presenter, new ConnectorManager(presenter));
}
