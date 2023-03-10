import { child, classAdd, classDel, deepCopy, svgEl } from '../infrastructure/util.js';
import { moveEvtProc } from '../infrastructure/move-evt-proc.js';
import { path, dirReverse } from './path.js';
import { textareaCreate } from '../infrastructure/svg-text-area.js';
import { settingsPnlCreate } from './shape-settings.js';
import { placeToCell, pointInCanvas } from '../infrastructure/move-scale-applay.js';
import { ShapeSmbl } from './shape-smbl.js';
import { svgTextDraw } from '../infrastructure/svg-text-draw.js';
import { PathSmbl } from './path-smbl.js';
import { CanvasSmbl } from '../infrastructure/canvas-smbl.js';
import { canvasSelectionClearSet } from '../diagram/canvas-clear.js';
import { listenCopy } from '../diagram/group-select-applay.js';

/**
 * provides:
 *  - shape move
 *  - connectors
 *
 *  - text editor
 *  - standard edit panel
 *  - onTextChange callback
 * @param {CanvasElement} canvas
 * @param {string} shapeHtml must have '<text data-key="text">'
 * @param {ShapeData & { title?: string, styles?: string[]}} shapeData
 * @param {ConnectorsData} cons
 * @param {SettingsPnlCreateFn=} settingsPnlCreateFn
 * @param {{(txtEl:SVGTextElement):void}} onTextChange
 */
export function shapeCreate(canvas, shapeData, shapeHtml, cons, onTextChange, settingsPnlCreateFn) {
	/** @type {ShapeElement} */
	const el = svgEl('g', `${shapeHtml}
		${Object.entries(cons)
		.map(cc => `<circle data-key="${cc[0]}" data-connect="${cc[1].dir}"	class="hovertrack" data-evt-index="2" r="10" cx="0" cy="0" style="transform: translate(${cc[1].position.x}px, ${cc[1].position.y}px);" />`)
		.join()}`);

	const textSettings = {
		/** @type {SVGTextElement} */
		el: child(el, 'text'),
		/** vericale middle, em */
		vMid: 0
	};

	svgTextDraw(textSettings.el, textSettings.vMid, shapeData.title);

	const shapeProc = shapeEditEvtProc(canvas, el, shapeData, cons, textSettings,
		settingsPnlCreateFn,
		// onTextChange
		() => onTextChange(textSettings.el));

	return {
		el,
		cons,
		draw: shapeProc.draw
	};
}

/**
 * provides:
 *  - shape move
 *  - connectors
 *  - copy fn
 *
 *  - text editor
 *  - standard edit panel
 *  - onTextChange callback
 * @param {CanvasElement} canvas
 * @param {ShapeElement} svgGrp
 * @param {ShapeData & { title?: string, styles?: string[]}} shapeData
 * @param {ConnectorsData} connectorsInnerPosition
 * @param { {el:SVGTextElement, vMid: number} } textSettings vMid in em
 * @param {{():void}} onTextChange
 * @param {SettingsPnlCreateFn} settingsPnlCreateFn
 */
function shapeEditEvtProc(canvas, svgGrp, shapeData, connectorsInnerPosition, textSettings, settingsPnlCreateFn, onTextChange) {
	/** @type {{dispose():void, draw():void}} */
	let textEditor;

	/** @type { {position:(bottomX:number, bottomY:number)=>void, del:()=>void} } */
	let settingsPnl;

	function unSelect() {
		textEditor?.dispose(); textEditor = null;
		settingsPnl?.del(); settingsPnl = null;
	}

	/** @param {string} txt */
	function onTxtChange(txt) {
		shapeData.title = txt;
		onTextChange();
	}

	const settingPnlCreate = settingsPnlCreateFn ?? settingsPnlCreate;
	const shapeProc = shapeEvtProc(canvas, svgGrp, shapeData, connectorsInnerPosition,
		// onEdit
		() => {
			textEditor = textareaCreate(textSettings.el, textSettings.vMid, shapeData.title, onTxtChange, onTxtChange);

			const position = svgGrp.getBoundingClientRect();
			settingsPnl = settingPnlCreate(canvas, svgGrp, position.left + 10, position.top + 10);
		},
		// onUnselect
		unSelect
	);

	if (shapeData.styles) { classAdd(svgGrp, ...shapeData.styles); }

	svgGrp[ShapeSmbl].del = function() {
		shapeProc.del();
		svgGrp.remove();
	};

	return {
		draw: () => {
			shapeProc.drawPosition();

			if (settingsPnl) {
				const position = svgGrp.getBoundingClientRect();
				settingsPnl.position(position.left + 10, position.top + 10);
			}

			if (textEditor) { textEditor.draw(); }
		}
	};
}

/**
 * provides:
 *  - shape move
 *  - connectors
 *  - copy fn
 *  - onEdit, onEditStop callbacks
 * @param {CanvasElement} canvas
 * @param {ShapeElement} svgGrp
 * @param {ShapeData} shapeData
 * @param {ConnectorsData} connectorsInnerPosition
 * @param {{():void}} onEdit
 * @param {{():void}} onUnselect
 */
function shapeEvtProc(canvas, svgGrp, shapeData, connectorsInnerPosition, onEdit, onUnselect) {
	classAdd(svgGrp, 'hovertrack');

	/** @type {ConnectorsData} */
	const connectorsData = deepCopy(connectorsInnerPosition);

	/** @type { Set<PathElement> } */
	const paths = new Set();

	function drawPosition() {
		svgGrp.style.transform = `translate(${shapeData.position.x}px, ${shapeData.position.y}px)`;

		// paths
		for (const connectorKey in connectorsInnerPosition) {
			connectorsData[connectorKey].position = {
				x: connectorsInnerPosition[connectorKey].position.x + shapeData.position.x,
				y: connectorsInnerPosition[connectorKey].position.y + shapeData.position.y
			};
		}

		for (const path of paths) {
			path[PathSmbl].draw();
		}
	};

	/**
	 * @type {0|1|2}
	 * 0 - init, 1 - selected, 2 - edit
	*/
	let state = 0;

	/** @type {()=>void} */
	let listenCopyDispose;

	function unSelect() {
		onUnselect();

		state = 0;
		classDel(svgGrp, 'select');
		classDel(svgGrp, 'highlight');

		canvasSelectionClearSet(canvas, null);
		if (listenCopyDispose) { listenCopyDispose(); listenCopyDispose = null;	}
	}

	const moveProcReset = moveEvtProc(
		canvas.ownerSVGElement,
		svgGrp,
		canvas[CanvasSmbl].data,
		shapeData.position,
		// onMoveStart
		/** @param {PointerEvent & { target: Element} } evt */
		evt => {
			unSelect();

			const connectorKey = evt.target.getAttribute('data-connect');
			if (connectorKey) {
				moveProcReset();

				const pathEl = path(canvas, {
					s: { shape: { shapeEl: svgGrp, connectorKey } },
					e: {
						data: {
							dir: dirReverse(connectorsData[connectorKey].dir),
							position: pointInCanvas(canvas[CanvasSmbl].data, evt.clientX, evt.clientY)
						}
					}
				});
				svgGrp.parentNode.append(pathEl);
				pathEl[PathSmbl].pointerCapture(evt);
				paths.add(pathEl);
			}
		},
		// onMove
		drawPosition,
		// onMoveEnd
		_ => {
			placeToCell(shapeData.position, canvas[CanvasSmbl].data.cell);
			drawPosition();
		},
		// onClick
		_ => {
			// in edit mode
			if (state === 2) { return; }

			// to edit mode
			if (state === 1) {
				state = 2;
				classDel(svgGrp, 'select');
				classAdd(svgGrp, 'highlight');
				// edit mode
				onEdit();
				return;
			}

			// to select mode
			state = 1;
			classAdd(svgGrp, 'select');

			canvasSelectionClearSet(canvas, unSelect);
			listenCopyDispose = listenCopy(() => [svgGrp]);
		},
		// onOutdown
		unSelect);

	svgGrp[ShapeSmbl] = {
		/**
		 * @param {string} connectorKey
		 * @param {PathElement} pathEl
		 */
		pathAdd: function(connectorKey, pathEl) {
			paths.add(pathEl);
			return connectorsData[connectorKey];
		},

		/** @param {PathElement} pathEl */
		pathDel: function(pathEl) {
			paths.delete(pathEl);
		},

		drawPosition,

		data: shapeData
	};

	return {
		drawPosition,
		del: () => {
			unSelect();
			moveProcReset();
			for (const path of paths) {
				path[PathSmbl].del();
			}
		}
	};
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {position:Point, scale:number, cell:number} } CanvasData */

/** @typedef { 'left' | 'right' | 'top' | 'bottom' } PathDir */
/** @typedef { {position: Point, dir: PathDir} } PathEnd */
/** @typedef { Object.<string, PathEnd> } ConnectorsData */

/** @typedef { {type: number, position: Point, styles?:string[]} } ShapeData */
/**
@typedef {{
	pathAdd(connectorKey:string, pathEl:PathElement): PathEnd
	pathDel(pathEl:PathElement): void
	drawPosition: ()=>void
	data: ShapeData
	del?: ()=>void
	draw?: ()=>void
}} Shape
 */

/** @typedef { {(canvas:CanvasElement, shapeElement:ShapeElement, bottomX:number, bottomY:number):{position(btmX:number, btmY:number):void, del():void} } } SettingsPnlCreateFn */

/** @typedef { import('../infrastructure/canvas-smbl.js').CanvasElement } CanvasElement */
/** @typedef {import('./shape-smbl').ShapeElement} ShapeElement */
/** @typedef {import('./path').Path} Path */
/** @typedef {import('./path-smbl').PathElement} PathElement */
