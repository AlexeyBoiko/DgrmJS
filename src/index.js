import { moveEvtMobileFix } from './infrastructure/move-evt-mobile-fix.js';
import { CanvasSmbl } from './infrastructure/canvas-smbl.js';
import { moveScaleApplay } from './infrastructure/move-scale-applay.js';
import { evtRouteApplay } from './infrastructure/evt-route-applay.js';
import { tipShow, uiDisable } from './ui/ui.js';
import { srvGet } from './diagram/dgrm-srv.js';
import { deserialize } from './diagram/dgrm-serialization.js';
import { copyPastApplay, groupSelectApplay } from './diagram/group-select-applay.js';
import { shapeTypeMap } from './shapes/shape-type-map.js';
import './ui/menu.js';
import './ui/shape-menu.js';

// @ts-ignore
/** @type {import('./infrastructure/canvas-smbl.js').CanvasElement} */ const canvas = document.getElementById('canvas');
canvas[CanvasSmbl] = {
	data: {
		position: { x: 0, y: 0 },
		scale: 1,
		cell: 24
	},
	shapeMap: shapeTypeMap(canvas)
};

moveEvtMobileFix(canvas.ownerSVGElement);
evtRouteApplay(canvas.ownerSVGElement);
copyPastApplay(canvas);
groupSelectApplay(canvas); // groupSelectApplay must go before moveScaleApplay
moveScaleApplay(canvas);

/** @type { import('./ui/menu').Menu } */(document.getElementById('menu')).init(canvas);
/** @type { import('./ui/shape-menu').ShapeMenu } */(document.getElementById('menu-shape')).init(canvas);

// load diagram by link
let url = new URL(window.location.href);
if (url.searchParams.get('k')) {
	uiDisable(true);
	srvGet(url.searchParams.get('k')).then(appData => {
		url.searchParams.delete('k');
		if (deserialize(canvas, appData)) { tipShow(false); }
		history.replaceState(null, null, url);
		uiDisable(false);
		url = null;
	});
} else { url = null; }
