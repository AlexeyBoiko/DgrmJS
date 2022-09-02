import { appDiagramFactory } from './dgrm/diagram/app-diagram-factory.js';
import { AppDiagramSerializable } from './dgrm/diagram/app-diagram-serializable.js';
import { storeGet } from './ui/store.js';

// elements
import './ui/elements/menu-shape/menu-shape.js';
import './ui/elements/file-options/file-options.js';
import { uiDisable } from './ui/ui.js';

const svg = document.getElementById('diagram');

/** @type {IAppDiagramSerializable & IAppPngExportable} */
// @ts-ignore
const diagram = new AppDiagramSerializable(svg, appDiagramFactory(svg))
	.on('shapeAdd',
		function() {
			document.getElementById('tip').remove();
			svg.style.removeProperty('pointer-events');
		},
		{ once: true });

/** @type {IFileOptions} */
(document.getElementById('file-options')).init(diagram);

/** @type {IMenuShape} */
(document.getElementById('menu-shape')).init(diagram);

// load diagram by link
let url = new URL(window.location.href);
if (url.searchParams.get('k')) {
	uiDisable(true, true);
	storeGet(url.searchParams.get('k')).then(appData => {
		url.searchParams.delete('k');
		diagram.dataSet(appData);
		history.replaceState(null, null, url);
		uiDisable(false);
		url = null;
	});
} else { url = null; }
