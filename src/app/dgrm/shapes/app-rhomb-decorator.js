import { svgTextIsOut } from '../../../diagram-extensions/infrastructure/svg-text-is-out.js';
import { AppShapeEditorDecorator } from './app-shape-editor-decorator.js';
import { resizeAlg } from './infrastructure/resize-utils.js';

export class AppRhombDecorator extends AppShapeEditorDecorator {
	/**
	 * @param {IDiagram} diagram
	 * @param {ISvgPresenterShape} svgShape
	 * @param {IAppShapeData} addParam
	 */
	constructor(diagram, svgShape, addParam) {
		super(diagram, svgShape, addParam);

		/** @private */
		this._width = 78;
	}

	/**
	 * @param {SVGTextElement} textEl
	 * @param {DiagramShapeProps} updatedProp
	 * private
	 */
	onTextChange(textEl, updatedProp) {
		if (!this._testPath) {
			/** @private */
			this._testPath = /** @type {SVGPathElement}} */(cloneUnshiftTransparent(this.svgEl, 'main'));
		}

		const newWidth = resizeAlg(
			// minVal 24 * 4 - 18 (stroke-width="18")
			78,
			// incrementVal, 24 * 2 = 48
			48,
			// currentVal
			this._width,
			// isOutFunc
			width => {
				this._testPath.setAttribute('d', rhombPathCalc(78, 78, width, 9)); // 18 (stroke-width="18") / 2
				return svgTextIsOut(textEl, this._testPath);
			});

		if (newWidth) {
			this._width = newWidth;
			this._resize(newWidth);
			this.panelUpdPos();
		}
	}

	/**
	 * @param {number} width
	 */
	_resize(width) {
		const rhomb = { d: rhombPathCalc(78, 78, width, 9) };
		const connectors = rhombCalc(96, 96, width + 18, 0); // 96 = 24 * 4
		const cons = {
			left: { cx: connectors.l.x },
			right: { cx: connectors.r.x },
			top: { cy: connectors.t.y },
			bottom: { cy: connectors.b.y }
		};
		const consData = {
			left: { innerPosition: connectors.l },
			right: { innerPosition: connectors.r },
			top: { innerPosition: connectors.t },
			bottom: { innerPosition: connectors.b }
		};
		this.diagram.shapeUpdate(this, {
			// visability
			props: {
				main: rhomb,
				outer: { d: rhombPathCalc(78, 78, width + 48 + 18, 9) },
				border: rhomb,
				// out connectors
				outleft: cons.left,
				outright: cons.right,
				outtop: cons.top,
				outbottom: cons.bottom,
				// in connectors
				inleft: cons.left,
				inright: cons.right,
				intop: cons.top,
				inbottom: cons.bottom
			},
			// connectors data
			connectors: {
				// out
				outleft: consData.left,
				outright: consData.right,
				outtop: consData.top,
				outbottom: consData.bottom,
				// in
				inleft: consData.left,
				inright: consData.right,
				intop: consData.top,
				inbottom: consData.bottom
			}
		});
	}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {
		super.onEditLeave();

		if (this._testPath) {
			this._testPath.remove();
			this._testPath = null;
		}
	}
}

/**
 * @param {number} baseWidth
 * @param {number} baseHeight
 * @param {number} width
 * @param {number} margin
 * @returns {{ l:Point, t:Point, r:Point, b:Point }}
 */
function rhombCalc(baseWidth, baseHeight, width, margin) {
	const incrm = (width - baseWidth) / 2;
	const incrmNeg = -1 * incrm;
	return {
		l: { x: incrmNeg + margin, y: baseHeight / 2 + margin },
		t: { x: baseWidth / 2 + margin, y: incrmNeg + margin },
		r: { x: baseWidth + incrm + margin, y: baseHeight / 2 + margin },
		b: { x: baseWidth / 2 + margin, y: baseHeight + incrm + margin }
	};
}

/**
 * @param {number} baseWidth
 * @param {number} baseHeight
 * @param {number} width
 * @param {number} margin
 * @returns {string}
 */
function rhombPathCalc(baseWidth, baseHeight, width, margin) {
	const rhomb = rhombCalc(baseWidth, baseHeight, width, margin);
	return `M${rhomb.l.x} ${rhomb.l.y} L${rhomb.t.x} ${rhomb.t.y} L${rhomb.r.x} ${rhomb.r.y} L${rhomb.b.x} ${rhomb.b.y} Z`;
}

/**
 * - get inner element with 'data-key' attr = {dataKey}
 * - clone it, make transparent
 *  - and add to {svgEl}
 * @param {SVGGraphicsElement} svgEl
 * @param {string} dataKey
 * @returns {SVGGraphicsElement}
 */
function cloneUnshiftTransparent(svgEl, dataKey) {
	const cloned = svgEl.querySelector(`[data-key="${dataKey}"]`);
	const clone = /** @type {SVGGraphicsElement}} */ (cloned.cloneNode(false));
	clone.style.fill = 'transparent';
	clone.style.stroke = 'transparent';
	clone.removeAttribute('data-key');
	svgEl.insertBefore(clone, cloned);
	return clone;
}
