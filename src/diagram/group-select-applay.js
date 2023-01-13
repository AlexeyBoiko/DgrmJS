import { MovementXSmbl, MovementYSmbl } from '../infrastructure/move-evt-mobile-fix.js';
import { ProcessedSmbl } from '../infrastructure/move-evt-proc.js';
import { pointInCanvas } from '../infrastructure/move-scale-applay.js';
import { arrPop, classAdd, classDel, listen, listenDel, svgEl } from '../infrastructure/util.js';
import { placeToCell } from '../shapes/shape-evt-proc.js';
import { delPnlCreate } from '../shapes/shape-settings.js';
import { ShapeSmbl } from '../shapes/shape-smbl.js';

/**
 * @param {SVGGElement} canvas
 * @param {{position:{x:number, y:number}, scale:number, cell:number}} canvasData
 */
export function groupSelectApplay(canvas, canvasData) {
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
			const selectRectCanvasPoint = pointInCanvas(canvasData, selectRectPos.x, selectRectPos.y);
			const selectRectCanvasWidth = selectRect.width.baseVal.value / canvasData.scale;
			const selectRectCanvasHeight = selectRect.height.baseVal.value / canvasData.scale;

			/** @type {ShapeElement[]} */
			const selectedShapes = [];
			for (const shapeEl of /** @type {Iterable<ShapeElement>} */(canvas.children)) {
				const shape = shapeEl[ShapeSmbl];
				if (shape &&
					pointInRect(selectRectCanvasPoint,
						selectRectCanvasWidth, selectRectCanvasHeight,
						shape.data.position.x, shape.data.position.y)) {
					classAdd(shapeEl, 'highlight');
					selectedShapes.push(shapeEl);
				}
			}
			groupEvtProcDispose = groupEvtProc(svg, selectedShapes, canvasData);
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
			startCircle.style.transform = `translate(${evt.clientX}px, ${evt.clientY}px)`;
			svg.append(startCircle);

			selectStart = { x: evt.clientX, y: evt.clientY };
			selectRectPos = { x: evt.clientX, y: evt.clientY };
			selectRect = svgEl('rect');
			selectRect.style.cssText = 'rx:10px; fill: rgb(108 187 247 / 51%)';
			selectRect.style.transform = `translate(${selectRectPos.x}px, ${selectRectPos.y}px)`;
			svg.append(selectRect);
		}, 500);
	});
}

/**
 * @param {SVGSVGElement} svg
 * @param {ShapeElement[]} selectedShapeElems
 * @param {{scale:number, cell:number}} canvasData
 */
function groupEvtProc(svg, selectedShapeElems, canvasData) {
	let isMove = false;
	let isDownOnSelectedShape = false;

	/** @type {{del():void}} */
	let pnl;
	const pnlDel = () => { pnl?.del(); pnl = null; };

	/** @param {PointerEvent & {target:Node}} evt */
	function down(evt) {
		pnlDel();
		isDownOnSelectedShape = selectedShapeElems.some(shapeEl => shapeEl.contains(evt.target));

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

	/** @param {PointerEvent} evt */
	function up(evt) {
		if (!isMove) {
			// click on canvas
			if (!isDownOnSelectedShape) { dispose(); return; }

			// click on selected shape
			pnl = delPnlCreate(evt.clientX - 10, evt.clientY - 10,
				// click on del btn
				() => {
					arrPop(selectedShapeElems, shapeEl => shapeEl[ShapeSmbl].del());
					dispose();
				});
		} else {
			// move end

			for (const shapeEl of selectedShapeElems) {
				placeToCell(shapeEl[ShapeSmbl].data.position, canvasData.cell);
				shapeEl[ShapeSmbl].drawPosition();
			}
		}

		dispose(true);
	}

	/** @param {PointerEventFixMovement} evt */
	function move(evt) {
		// move canvas
		if (!isDownOnSelectedShape) { dispose(true); return; }

		// move selected shapes
		isMove = true;
		for (const shapeEl of selectedShapeElems) {
			shapeEl[ShapeSmbl].data.position.x += evt[MovementXSmbl] / canvasData.scale;
			shapeEl[ShapeSmbl].data.position.y += evt[MovementYSmbl] / canvasData.scale;
			shapeEl[ShapeSmbl].drawPosition();
		}
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
			arrPop(selectedShapeElems, shapeEl => classDel(shapeEl, 'highlight'));
		}
	}

	svg.addEventListener('pointerdown', down, { passive: true, capture: true });

	return dispose;
}

/**
 * @param {Point} rectPosition
 * @param {number} rectWidth, @param {number} rectHeight
 * @param {number} x, @param {number} y
 */
const pointInRect = (rectPosition, rectWidth, rectHeight, x, y) =>
	rectPosition.x <= x && x <= rectPosition.x + rectWidth &&
	rectPosition.y <= y && y <= rectPosition.y + rectHeight;

/** @typedef { {x:number, y:number} } Point */
/** @typedef { import('../shapes/shape-evt-proc.js').ShapeElement } ShapeElement */
/** @typedef { import('../infrastructure/move-evt-mobile-fix.js').PointerEventFixMovement} PointerEventFixMovement */
