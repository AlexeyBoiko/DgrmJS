import { moveEvtMobileFix } from './infrastructure/move-evt-mobile-fix.js';
import { moveScaleApplay } from './infrastructure/move-scale-applay.js';
import { evtRouteApplay } from './infrastructure/move-evt-proc.js';
import { tipShow, uiDisable } from './ui/ui.js';
import { srvGet } from './diagram/dgrm-srv.js';
import { deserialize } from './diagram/dgrm-serialization.js';
import { groupSelectApplay } from './diagram/group-select-applay.js';
import { shapeTypeMap } from './shapes/shape-type-map.js';
import './ui/menu.js';
import './ui/shape-menu.js';

// @ts-ignore
/** @type {SVGGElement} */ const canvas = document.getElementById('canvas');
const canvasData = {
	position: { x: 0, y: 0 },
	scale: 1,
	cell: 24
};
const shapesTypeMap = shapeTypeMap(canvas.ownerSVGElement, canvasData);

moveEvtMobileFix(canvas.ownerSVGElement);
evtRouteApplay(canvas.ownerSVGElement);
groupSelectApplay(canvas, canvasData);
moveScaleApplay(canvas, canvasData);

/** @type { import('./ui/menu').Menu } */(document.getElementById('menu')).init(canvas, canvasData, shapesTypeMap);
/** @type { import('./ui/shape-menu').ShapeMenu } */(document.getElementById('menu-shape')).init(canvas, canvasData, shapesTypeMap);

// load diagram by link
let url = new URL(window.location.href);
if (url.searchParams.get('k')) {
	uiDisable(true);
	srvGet(url.searchParams.get('k')).then(appData => {
		url.searchParams.delete('k');
		if (deserialize(canvas, shapesTypeMap, appData)) { tipShow(false); }
		history.replaceState(null, null, url);
		uiDisable(false);
		url = null;
	});
} else { url = null; }
