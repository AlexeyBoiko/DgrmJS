import { AppDiagramSerializable } from './diagram/app-diagram-serializable.js';

// elements
import './elements/menu-shape/menu-shape.js';
import './elements/file-options/file-options.js';

/** @type {IAppDiagramSerializable & IAppPngExportable} */
// @ts-ignore
const diagram = new AppDiagramSerializable(document.getElementById('diagram'))
	.on('shapeAdd', function() { document.getElementById('tip')?.remove(); });

/** @type {IFileOptions} */
(document.getElementById('file-options')).init(diagram);

/** @type {IMenuShape} */
(document.getElementById('menu-shape')).init(diagram);

if (window.location.hash) {
	diagram.dataSet(JSON.parse(decodeURIComponent(window.location.hash.substring(1))));
	history.replaceState(null, null, ' ');
}
