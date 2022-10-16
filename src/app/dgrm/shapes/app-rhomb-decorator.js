import { svgTextIsOut } from '../../../diagram-extensions/infrastructure/svg-text-is-out.js';
import { AppShapeEditorDecorator } from './app-editor-decorator.js';
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
		this._width = 120;
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
			// minVal
			120,
			// incrementVal
			40,
			// currentVal
			this._width,
			// isOutFunc
			width => {
				this._testPath.setAttribute('d', rhombPathCalc(120, 70, width));
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
		const rhomb = { d: rhombPathCalc(120, 70, width) };
		const connectors = rhombCalc(120, 70, width + 16);
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
				outer: { d: rhombPathCalc(120, 70, width + 80) },
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
 * @returns {{ l:Point, t:Point, r:Point, b:Point }}
 */
function rhombCalc(baseWidth, baseHeight, width) {
	const incrm = (width - baseWidth) / 2;
	const incrmNeg = -1 * incrm;
	return {
		l: { x: incrmNeg, y: baseHeight / 2 },
		t: { x: baseWidth / 2, y: incrmNeg },
		r: { x: baseWidth + incrm, y: baseHeight / 2 },
		b: { x: baseWidth / 2, y: baseHeight + incrm }
	};
}

/**
 * @param {number} baseWidth
 * @param {number} baseHeight
 * @param {number} width
 * @returns {string}
 */
function rhombPathCalc(baseWidth, baseHeight, width) {
	const rhomb = rhombCalc(baseWidth, baseHeight, width);
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
