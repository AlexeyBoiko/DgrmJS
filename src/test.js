import { DiagramBuilder } from './diagram/svg-diagram-builder';

new DiagramBuilder(null)
	.on('select', /** @param {CustomEvent<SVGGElement>} evt */ evt => {
		// evt.detail
		evt.preventDefault();
	});
