import { child, classAdd, classDel, classHas, svgEl } from '../infrastructure/util.js';
import { moveEvtProc } from '../infrastructure/move-evt-proc.js';
import { path, PathSmbl, dirReverse } from './path.js';
import { textareaCreate } from '../infrastructure/svg-text-area.js';
import { settingsPnlCreate } from './shape-settings.js';
import { pointInCanvas } from '../infrastructure/move-scale-applay.js';
import { ShapeSmbl } from './shape-smbl.js';
import { svgTextDraw } from '../infrastructure/svg-text-draw.js';

/**
 * provides:
 *  - shape move
 *  - connectors
 *
 *  - text editor
 *  - standard edit panel
 *  - onTextChange callback
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {string} shapeHtml must have '<text data-key="text">'
 * @param {ShapeData & { title?: string, styles?: string[]}} shapeData
 * @param {ConnectorsData} cons
 * @param {{(txtEl:SVGTextElement):void}} onTextChange
 */
export function shapeCreate(svg, canvasData, shapeData, shapeHtml, cons, onTextChange) {
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

	const shapeProc = shapeEditEvtProc(svg, canvasData, el, shapeData, cons, textSettings,
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
 *
 *  - text editor
 *  - standard edit panel
 *  - onTextChange callback
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {ShapeElement} svgGrp
 * @param {ShapeData & { title?: string, styles?: string[]}} shapeData
 * @param {ConnectorsData} connectorsInnerPosition
 * @param { {el:SVGTextElement, vMid: number} } textSettings vMid in em
 * @param {{():void}} onTextChange
 */
function shapeEditEvtProc(svg, canvasData, svgGrp, shapeData, connectorsInnerPosition, textSettings, onTextChange) {
	/** @type {{():void}} */
	let textEditorDel;

	/** @type { {position:(bottomX:number, bottomY:number)=>void, del:()=>void} } */
	let settingsPnl;

	function delEditor() {
		if (textEditorDel) { textEditorDel(); textEditorDel = null; }
		settingsPnl?.del(); settingsPnl = null;
	}

	/** @param {string} txt */
	function onTxtChange(txt) {
		shapeData.title = txt;
		onTextChange();
	}

	const shapeProc = shapeEvtProc(svg, canvasData, svgGrp, shapeData, connectorsInnerPosition,
		// onEdit
		() => {
			textEditorDel = textareaCreate(textSettings.el, textSettings.vMid, shapeData.title, onTxtChange, onTxtChange);

			const position = svgGrp.getBoundingClientRect();
			settingsPnl = settingsPnlCreate(position.left + 10, position.top + 10, onCmd);
		},
		// onEditStop
		delEditor
	);

	function del() {
		delEditor();
		shapeProc.del();
		svgGrp.remove();
	}

	/** @param {CustomEvent<{cmd:string, arg:string}>} evt */
	function onCmd(evt) {
		switch (evt.detail.cmd) {
			case 'style': colorStyleAdd(svgGrp, shapeData, evt.detail.arg); break;
			case 'del': del(); break;
		}
	}

	if (shapeData.styles) { classAdd(svgGrp, ...shapeData.styles); }

	svgGrp[ShapeSmbl].del = del;

	return {
		draw: () => {
			if (settingsPnl) {
				const position = svgGrp.getBoundingClientRect();
				settingsPnl.position(position.left + 10, position.top + 10);
			}
			shapeProc.drawPosition();
		}
	};
}

/** @param {Element} shapeEl, @param {{styles?:string[]}} shapeData, @param {string} colorClass */
export function colorStyleAdd(shapeEl, shapeData, colorClass) {
	if (!shapeData.styles) { shapeData.styles = []; }

	const currentColor = shapeData.styles.findIndex(ss => ss.startsWith('cl-'));
	if (currentColor > -1) {
		classDel(shapeEl, shapeData.styles[currentColor]);
		shapeData.styles.splice(currentColor, 1);
	}
	shapeData.styles.push(colorClass);
	classAdd(shapeEl, colorClass);
}

/**
 * provides:
 *  - shape move
 *  - connectors
 *  - onEdit, onEditStop callbacks
 * @param {Element} svg
 * @param {CanvasData} canvasData
 * @param {ShapeElement} svgGrp
 * @param {ShapeData} shapeData
 * @param {ConnectorsData} connectorsInnerPosition
 * @param {{():void}} onEdit
 * @param {{():void}} onEditStop
 */
function shapeEvtProc(svg, canvasData, svgGrp, shapeData, connectorsInnerPosition, onEdit, onEditStop) {
	classAdd(svgGrp, 'hovertrack');

	/** @type {ConnectorsData} */
	const connectorsData = JSON.parse(JSON.stringify(connectorsInnerPosition));

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
					s: { shape: { shapeEl: svgGrp, connectorKey } },
					e: {
						data: {
							dir: dirReverse(connectorsData[connectorKey].dir),
							position: pointInCanvas(canvasData, evt.clientX, evt.clientY)
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
			placeToCell(shapeData.position, canvasData.cell);
			drawPosition();
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

		drawPosition,

		data: shapeData
	};

	return {
		drawPosition,
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
export function placeToCell(shapePosition, cell) {
	const cellSizeHalf = cell / 2;
	function placeToCell(coordinate) {
		const coor = (Math.round(coordinate / cell) * cell);
		return (coordinate - coor > 0) ? coor + cellSizeHalf : coor - cellSizeHalf;
	}

	shapePosition.x = placeToCell(shapePosition.x);
	shapePosition.y = placeToCell(shapePosition.y);
}

/** @typedef { {x:number, y:number} } Point */
/** @typedef { {position:Point, scale:number, cell:number} } CanvasData */

/** @typedef { 'left' | 'right' | 'top' | 'bottom' } PathDir */
/** @typedef { {position: Point, dir: PathDir} } PathEnd */
/** @typedef { Object.<string, PathEnd> } ConnectorsData */

/** @typedef { {type: number, position: Point} } ShapeData */
/**
@typedef {{
	pathAdd(connectorKey:string, pathEl:PathElement): PathEnd
	pathDel(pathEl:PathElement): void
	drawPosition: ()=>void
	data: ShapeData
	del?: ()=>void
}} Shape
 */

/** @typedef {SVGGraphicsElement & { [ShapeSmbl]?: Shape }} ShapeElement */
/** @typedef {import('./path.js').Path} Path */
/** @typedef {import('./path.js').PathElement} PathElement */
