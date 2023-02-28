import { CanvasSmbl } from '../infrastructure/canvas-smbl.js';
import { movementApplay, ProcessedSmbl } from '../infrastructure/move-evt-proc.js';
import { placeToCell, pointInCanvas } from '../infrastructure/move-scale-applay.js';
import { arrDel, arrPop, classAdd, classDel, listen, listenDel, positionSet, svgEl } from '../infrastructure/util.js';
import { path, pathDataClone } from '../shapes/path.js';
import { PathSmbl } from '../shapes/path-smbl.js';
import { pnlCreate } from '../shapes/shape-settings.js';
import { ShapeSmbl } from '../shapes/shape-smbl.js';
import { GroupSettings } from './group-settings.js';

const highlightSClass = 'highlight-s';
const highlightEClass = 'highlight-e';
const highlightClass = 'highlight';

/** @param {CanvasElement} canvas */
export function groupSelectApplay(canvas) {
	const svg = canvas.ownerSVGElement;
	let timer;
	/** @type {Point} */ let selectStart;
	/** @type {SVGCircleElement} */ let startCircle;
	/** @type {SVGRectElement} */ let selectRect;
	/** @type {Point} */ let selectRectPos;
	/** @type {()=>void} */let groupEvtProcDispose;

	/** @param {PointerEvent} evt */
	function onMove(evt) {
		if (evt[ProcessedSmbl] || !selectRect) { reset(); return; }
		evt[ProcessedSmbl] = true;

		if (startCircle) { startCircle.remove(); startCircle = null; }

		// draw rect
		const x = evt.clientX - selectStart.x;
		const y = evt.clientY - selectStart.y;
		selectRect.width.baseVal.value = Math.abs(x);
		selectRect.height.baseVal.value = Math.abs(y);
		if (x < 0) { selectRectPos.x = evt.clientX; }
		if (y < 0) { selectRectPos.y = evt.clientY; }
		selectRect.style.transform = `translate(${selectRectPos.x}px, ${selectRectPos.y}px)`;
	}

	/** @param {PointerEvent} evt */
	function onUp(evt) {
		if (selectRect) {
			/** @param {Point} point */
			const inRect = point => pointInRect(
				pointInCanvas(canvas[CanvasSmbl].data, selectRectPos.x, selectRectPos.y),
				selectRect.width.baseVal.value / canvas[CanvasSmbl].data.scale,
				selectRect.height.baseVal.value / canvas[CanvasSmbl].data.scale,
				point.x, point.y);

			/** @type {Selected} */
			const selected = {
				shapes: [],
				shapesPaths: [],
				pathEnds: [],
				pathEndsPaths: []
			};

			/** @param {ShapeElement} shapeEl */
			const shapeInRect = shapeEl => inRect(shapeEl[ShapeSmbl].data.position);

			/**
			 * @param {ShapeOrPathElement} pathEl,  @param {PathEnd} pathEnd, @param {string} highlightClass
			 * @returns {1|2|0}
			 */
			function pathEndInRect(pathEl, pathEnd, highlightClass) {
				if (!pathEnd.shape && inRect(pathEnd.data.position)) {
					selected.pathEnds.push(pathEnd);
					classAdd(pathEl, highlightClass);
					return 1; // connect to end in rect
				} else if (pathEnd.shape && shapeInRect(pathEnd.shape.shapeEl)) {
					return 2; // connect to shape in rect
				}
				return 0; // not in rect
			}

			for (const shapeEl of /** @type {Iterable<ShapeOrPathElement>} */(canvas.children)) {
				if (shapeEl[ShapeSmbl]) {
					if (shapeInRect(shapeEl)) {
						shapeHighlight(shapeEl);
						selected.shapes.push(shapeEl);
					}
				} else if (shapeEl[PathSmbl]) {
					const isStartIn = pathEndInRect(shapeEl, shapeEl[PathSmbl].data.s, highlightSClass);
					const isEndIn = pathEndInRect(shapeEl, shapeEl[PathSmbl].data.e, highlightEClass);

					if (isStartIn === 1 || isEndIn === 1) {
						selected.pathEndsPaths.push(shapeEl);
					}

					if (isStartIn === 2 || isEndIn === 2) {
						selected.shapesPaths.push(shapeEl);
					}
				}
			}
			groupEvtProcDispose = groupEvtProc(canvas, selected);
		}

		reset();
	}

	function reset() {
		clearTimeout(timer); timer = null;
		startCircle?.remove(); startCircle = null;
		selectRect?.remove(); selectRect = null;

		listenDel(svg, 'pointermove', onMove);
		listenDel(svg, 'wheel', reset);
		listenDel(svg, 'pointerup', onUp);
	}

	listen(svg, 'pointerdown', /** @param {PointerEvent} evt */ evt => {
		if (evt[ProcessedSmbl] || !evt.isPrimary) { reset(); return; }

		listen(svg, 'pointermove', onMove);
		listen(svg, 'wheel', reset, true);
		listen(svg, 'pointerup', onUp, true);

		timer = setTimeout(_ => {
			if (groupEvtProcDispose) { groupEvtProcDispose(); groupEvtProcDispose = null; }

			startCircle = svgEl('circle');
			classAdd(startCircle, 'ative-elem');
			startCircle.style.cssText = 'r:10px; fill: rgb(108 187 247 / 51%)';
			positionSet(startCircle, { x: evt.clientX, y: evt.clientY });
			svg.append(startCircle);

			selectStart = { x: evt.clientX, y: evt.clientY };
			selectRectPos = { x: evt.clientX, y: evt.clientY };
			selectRect = svgEl('rect');
			selectRect.style.cssText = 'rx:10px; fill: rgb(108 187 247 / 51%)';
			positionSet(selectRect, selectRectPos);
			svg.append(selectRect);
		}, 500);
	});
}

/**
 * @param {CanvasElement} canvas
 * @param {Selected} selected
 */
function groupEvtProc(canvas, selected) {
	const svg = canvas.ownerSVGElement;
	let isMove = false;
	let isDownOnSelectedShape = false;

	/** @type {{del():void}} */
	let settingsPnl;
	const pnlDel = () => { settingsPnl?.del(); settingsPnl = null; };

	/** @param {PointerEvent & {target:Node}} evt */
	function down(evt) {
		pnlDel();
		isDownOnSelectedShape =
			selected.shapes?.some(shapeEl => shapeEl.contains(evt.target)) ||
			selected.pathEnds?.some(pathEnd => pathEnd.el.contains(evt.target));

		// down on not selected shape
		if (!isDownOnSelectedShape && evt.target !== svg) {
			dispose();
			return;
		}

		if (isDownOnSelectedShape) {
			evt.stopImmediatePropagation();
		}

		svg.setPointerCapture(evt.pointerId);
		listen(svg, 'pointerup', up, true);
		listen(svg, 'pointermove', move);
	}

	/** @param { {(point:Point):void} } pointMoveFn */
	function drawSelection(pointMoveFn) {
		selected.shapes?.forEach(shapeEl => {
			pointMoveFn(shapeEl[ShapeSmbl].data.position);
			shapeEl[ShapeSmbl].drawPosition();
		});
		selected.pathEnds?.forEach(pathEnd => pointMoveFn(pathEnd.data.position));
		selected.pathEndsPaths?.forEach(path => path[PathSmbl].draw());
	}

	/** @param {PointerEvent} evt */
	function up(evt) {
		if (!isMove) {
			// click on canvas
			if (!isDownOnSelectedShape) { dispose(); return; }

			// click on selected shape - show settings panel
			settingsPnl = pnlCreate(evt.clientX - 10, evt.clientY - 10, new GroupSettings(cmd => {
				switch (cmd) {
					case 'del':
						arrPop(selected.shapes, shapeEl => shapeEl[ShapeSmbl].del());
						arrPop(selected.pathEndsPaths, pathEl => pathEl[PathSmbl].del());
						dispose();
						break;
					case 'copy': {
						pnlDel();
						selected = copy(canvas, selected);
						break;
					}
				}
			}));
		} else {
			// move end
			drawSelection(point => placeToCell(point, canvas[CanvasSmbl].data.cell));
		}

		dispose(true);
	}

	/** @param {PointerEventFixMovement} evt */
	function move(evt) {
		// move canvas
		if (!isDownOnSelectedShape) { dispose(true); return; }

		// move selected shapes
		isMove = true;
		drawSelection(point => movementApplay(point, canvas[CanvasSmbl].data.scale, evt));
	}

	/** @param {boolean=} saveOnDown */
	function dispose(saveOnDown) {
		listenDel(svg, 'pointerup', up);
		listenDel(svg, 'pointermove', move);
		isMove = false;
		isDownOnSelectedShape = false;

		if (!saveOnDown) {
			listenDel(svg, 'pointerdown', down, true);
			pnlDel();
			arrPop(selected.shapes, shapeEl => classDel(shapeEl, highlightClass));
			arrPop(selected.pathEndsPaths, pathEl => pathUnhighlight(pathEl));
			selected.pathEnds = null;
			selected.shapesPaths = null;
		}
	}

	svg.addEventListener('pointerdown', down, { passive: true, capture: true });

	return dispose;
}

/**
 * @param {CanvasElement} canvas
 * @param {Selected} selected
 * @returns {Selected}
 */
function copy(canvas, selected) {
	/** @type {Selected} */
	const copied = {
		shapes: [],
		shapesPaths: [],
		pathEnds: [],
		pathEndsPaths: []
	};

	/** @param {ShapeElement} shapeEl */
	function shapeCopy(shapeEl) {
		const copyShape = shapeEl[ShapeSmbl].copy();
		shapeHighlight(copyShape);
		copied.shapes.push(copyShape);
		return copyShape;
	}

	/** @param {PathEnd} pathEndFrom, @param {PathEnd} pathEndTo */
	function pathShapeCopy(pathEndFrom, pathEndTo) {
		const shapeIndex = selected.shapes.indexOf(pathEndFrom.shape?.shapeEl);
		if (shapeIndex > -1) {
			pathEndTo.shape = {
				shapeEl: shapeCopy(pathEndFrom.shape.shapeEl),
				connectorKey: pathEndFrom.shape.connectorKey
			};
			selected.shapes.splice(shapeIndex, 1);
			return true;
		}

		return selected.pathEnds?.some(ee => ee.el === pathEndFrom.el);
	}

	/** @param {PathElement} pathEl`` */
	function pathHighlight(pathEl) {
		classAdd(pathEl, highlightSClass);
		classAdd(pathEl, highlightEClass);
	}

	/**
	 * @param {PathElement} path, @param {PathEnd} pathEnd, @param {string} highlightClass,
	 * @returns {1|2}
	 */
	function copyPathEndAdd(path, pathEnd, highlightClass) {
		if (!pathEnd.shape) {
			copied.pathEnds.push(pathEnd);
			classAdd(path, highlightClass);
			return 1; // end
		}
		return 2; // shape
	}

	selected.shapesPaths?.forEach(pathEl => {
		const copyPathData = pathDataClone(pathEl[PathSmbl].data, canvas[CanvasSmbl].data.cell);
		if (pathShapeCopy(pathEl[PathSmbl].data.s, copyPathData.s) &&
			pathShapeCopy(pathEl[PathSmbl].data.e, copyPathData.e)) {
			const copyPath = path(canvas, copyPathData);

			const startEndType = copyPathEndAdd(copyPath, copyPath[PathSmbl].data.s, highlightSClass);
			const endEndType = copyPathEndAdd(copyPath, copyPath[PathSmbl].data.e, highlightEClass);
			if (startEndType === 1 || endEndType === 1) {
				copied.pathEndsPaths.push(copyPath);
			}
			if (startEndType === 2 || endEndType === 2) {
				copied.shapesPaths.push(copyPath);
			}

			canvas.append(copyPath);
		}

		arrDel(selected.pathEndsPaths, pathEl);
		pathUnhighlight(pathEl);
	});

	selected.shapes?.forEach(shape => shapeCopy(shape));

	selected.pathEndsPaths?.forEach(path => {
		pathUnhighlight(path);
		const copyPath = path[PathSmbl].copy();
		pathHighlight(copyPath);
		copied.pathEndsPaths.push(copyPath);
		copied.pathEnds.push(copyPath[PathSmbl].data.s, copyPath[PathSmbl].data.e);
	});

	return copied;
}

/** @param {PathElement} pathEl`` */
function pathUnhighlight(pathEl) {
	classDel(pathEl, highlightSClass);
	classDel(pathEl, highlightEClass);
}

/** @param {ShapeElement} shapeEl */
const shapeHighlight = shapeEl => classAdd(shapeEl, highlightClass);

/**
 * @param {Point} rectPosition
 * @param {number} rectWidth, @param {number} rectHeight
 * @param {number} x, @param {number} y
 */
const pointInRect = (rectPosition, rectWidth, rectHeight, x, y) =>
	rectPosition.x <= x && x <= rectPosition.x + rectWidth &&
	rectPosition.y <= y && y <= rectPosition.y + rectHeight;

/**
 * @typedef { {
 * 	shapes:ShapeElement[]
 * 	shapesPaths:PathElement[]
 * 	pathEnds: PathEnd[]
 *	pathEndsPaths: PathElement[]
 * } } Selected
 */
/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('../infrastructure/canvas-smbl.js').CanvasElement } CanvasElement */
/** @typedef { import('../shapes/shape-smbl').ShapeElement } ShapeElement */
/** @typedef { import('../shapes/shape-evt-proc').Shape } Shape */
/** @typedef { import('../shapes/path').Path } Path */
/** @typedef { import('../shapes/path').PathEnd } PathEnd */
/** @typedef { import('../shapes/path-smbl').PathElement } PathElement */
/** @typedef { SVGGraphicsElement & { [ShapeSmbl]?: Shape, [PathSmbl]?:Path }} ShapeOrPathElement */
/** @typedef { import('../infrastructure/move-evt-mobile-fix.js').PointerEventFixMovement} PointerEventFixMovement */
