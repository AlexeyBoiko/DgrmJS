import { classAdd, classDel, classHas, evtCanvasPoint } from '../infrastructure/util.js';
import { moveEvtProc } from '../infrastructure/move-evt-proc.js';
import { path, PathSmbl } from './path.js';
import { textareaCreate } from '../infrastructure/svg-text-area.js';
import { settingsPnlCreate } from './shape-settings.js';

/**
 * provides:
 *  - shape move
 *  - connectors
 *  - text editor
 *  - standard edit panel
 *  - onTextChange callback
 * @param {HTMLElement} svg
 * @param {CanvasData} canvasData
 * @param {ShapeElement} svgGrp
 * @param {ShapeData & { title?: string, style?: string}} shapeData
 * @param {ConnectorsData} connectorsInnerPosition
 * @param {SVGTextElement} textEl
 * @param {{():void}} onTextChange
 */
export function shapeEditEvtProc(svg, canvasData, svgGrp, shapeData, connectorsInnerPosition, textEl, onTextChange) {
	/** @type {{():void}} */
	let textEditorDel;

	/** @type { {position:(bottomX:number, bottomY:number)=>void, del:()=>void} } */
	let settingsPnl;

	const shapeProc = shapeEvtProc(svg, canvasData, svgGrp, shapeData, connectorsInnerPosition,
		// onEdit
		() => {
			textEditorDel = textareaCreate(textEl, 0, shapeData.title, onTxtChange, onTxtChange);

			const position = svgGrp.getBoundingClientRect();
			settingsPnl = settingsPnlCreate(position.left + 10, position.top + 10, onCmd);
		},
		// onEditStop
		del
	);

	/** @param {CustomEvent<{cmd:string, arg:string}>} evt */
	function onCmd(evt) {
		switch (evt.detail.cmd) {
			case 'style':
				classDel(svgGrp, shapeData.style);
				classAdd(svgGrp, evt.detail.arg);
				shapeData.style = evt.detail.arg;
				break;
			case 'del':
				del();
				shapeProc.del();
				svgGrp.remove();
				break;
		}
	}

	function del() {
		if (textEditorDel) { textEditorDel(); textEditorDel = null; }
		settingsPnl?.del(); settingsPnl = null;
	}

	/** @param {string} txt */
	function onTxtChange(txt) {
		shapeData.title = txt;
		onTextChange();
	}

	if (shapeData.style) { classAdd(svgGrp, shapeData.style); }

	return {
		draw: () => {
			if (settingsPnl) {
				const position = svgGrp.getBoundingClientRect();
				settingsPnl.position(position.left + 10, position.top + 10);
			}
			shapeProc.draw();
		}
	};
}

/**
 * provides:
 *  - shape move
 *  - connectors
 *  - onEdit, onEditStop callbacks
 * @param {HTMLElement} svg
 * @param {CanvasData} canvasData
 * @param {ShapeElement} svgGrp
 * @param {ShapeData} shapeData
 * @param {ConnectorsData} connectorsInnerPosition
 * @param {{():void}} onEdit
 * @param {{():void}} onEditStop
 */
function shapeEvtProc(svg, canvasData, svgGrp, shapeData, connectorsInnerPosition, onEdit, onEditStop) {
	/** @type {ConnectorsData} */
	const connectorsData = JSON.parse(JSON.stringify(connectorsInnerPosition));

	/** @type { Set<PathElement> } */
	const paths = new Set();

	function draw() {
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

	function unSelect() {
		// in edit mode
		if (classHas(svgGrp, 'highlight')) { onEditStop(); }

		classDel(svgGrp, 'select');
		classDel(svgGrp, 'highlight');
	}

	const moveProcReset = moveEvtProc(
		svg,
		svgGrp,
		canvasData,
		shapeData.position,
		// onMoveStart
		/** @param {PointerEvent & { target: Element} } evt */
		evt => {
			unSelect();

			const connectorKey = evt.target.getAttribute('data-connect');
			if (connectorKey) {
				moveProcReset();

				const pathEl = path(svg, canvasData, {
					startShape: { shapeEl: svgGrp, connectorKey },
					end: {
						dir: reversDir(connectorsData[connectorKey].dir),
						position: evtCanvasPoint(canvasData, evt)
					}
				});
				svgGrp.parentNode.append(pathEl);
				pathEl[PathSmbl].pointerCapture(evt);
				paths.add(pathEl);
			}
		},
		// onMove
		draw,
		// onMoveEnd
		_ => {
			placeToCell(shapeData.position, canvasData.cell);
			draw();
		},
		// onClick
		_ => {
			// in edit mode
			if (classHas(svgGrp, 'highlight')) { return; }

			// to edit mode
			if (classHas(svgGrp, 'select') && !classHas(svgGrp, 'highlight')) {
				classDel(svgGrp, 'select');
				classAdd(svgGrp, 'highlight');
				// edit mode
				onEdit();
				return;
			}

			// to select mode
			classAdd(svgGrp, 'select');
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

		data: shapeData
	};

	return {
		draw,
		del: () => {
			moveProcReset();
			for (const path of paths) {
				path[PathSmbl].del();
			}
		}
	};
}

/**
 * @param {Point} shapePosition
 * @param {number} cell
 */
function placeToCell(shapePosition, cell) {
	const cellSizeHalf = cell / 2;
	function placeToCell(coordinate) {
		const coor = (Math.round(coordinate / cell) * cell);
		return (coordinate - coor > 0) ? coor + cellSizeHalf : coor - cellSizeHalf;
	}

	shapePosition.x = placeToCell(shapePosition.x);
	shapePosition.y = placeToCell(shapePosition.y);
}

/**
 * @param {PathDir} pathDir
 * @return {PathDir}
 */
function reversDir(pathDir) {
	return pathDir === 'left'
		? 'right'
		: pathDir === 'right'
			? 'left'
			: pathDir === 'top' ? 'bottom' : 'top';
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {position:Point, scale:number, cell:number} } CanvasData */

/** @typedef { 'left' | 'right' | 'top' | 'bottom' } PathDir */
/** @typedef { {position: Point, dir: PathDir} } PathEnd */
/** @typedef { Object.<string, PathEnd> } ConnectorsData */

/** @typedef { {type: number, position: Point} } ShapeData */
/**
@typedef {{
pathAdd(connectorKey:string, pathEl:PathElement):PathEnd
pathDel(pathEl:PathElement):void
data: ShapeData
}} Shape
 */
export const ShapeSmbl = Symbol('shape');
/** @typedef {SVGGraphicsElement & { [ShapeSmbl]?: Shape }} ShapeElement */
/** @typedef {import('./path.js').Path} Path */
/** @typedef {import('./path.js').PathElement} PathElement */
