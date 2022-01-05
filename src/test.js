import { DiagramBuilder } from './diagram/diagram-builder';

new DiagramBuilder(null)
	.on('select', /** @param {CustomEvent<SVGGElement>} evt */ evt => {
		// evt.detail
		evt.preventDefault();
	});
