import { appDiagramFactory } from './diagram/app-diagram-factory.js';
import { AppDiagramSerializable } from './diagram/app-diagram-serializable.js';

// elements
import './elements/menu-shape/menu-shape.js';
import './elements/file-options/file-options.js';

const svg = document.getElementById('diagram');

/** @type {IAppDiagramSerializable & IAppPngExportable} */
// @ts-ignore
const diagram = new AppDiagramSerializable(svg, appDiagramFactory(svg))
	.on('shapeAdd', function() { document.getElementById('tip')?.remove(); });

/** @type {IFileOptions} */
(document.getElementById('file-options')).init(diagram);

/** @type {IMenuShape} */
(document.getElementById('menu-shape')).init(diagram);

if (window.location.hash) {
	diagram.dataSet(JSON.parse(decodeURIComponent(window.location.hash.substring(1))));
	history.replaceState(null, null, ' ');
}
