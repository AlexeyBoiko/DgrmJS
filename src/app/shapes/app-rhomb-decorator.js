import { svgTextIsOut } from '../../diagram-extensions/infrastructure/svg-text-is-out.js';
import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';
import { resizeAlg } from './infrastructure/resize-utils.js';

export class AppRhombDecorator extends SvgShapeTextEditorDecorator {
	/**
	 * @param {IDiagram} diagram
	 * @param {ISvgPresenterShape} svgShape
	 * @param {PresenterShapeProps} initProps
	 */
	constructor(diagram, svgShape, initProps) {
		super(svgShape, initProps);

		/** @private */
		this._diagram = diagram;

		/** @private */
		this._width = 120;
	}

	/**
	 * @param {PresenterShapeUpdateParam} param
	 */
	update(param) {
		super.update(param);
		if (param.props?.text?.textContent !== undefined) {
			this._onTextChange(/** @type {SVGTextElement} */ (this.svgEl.querySelector('[data-key="text"]')));
		}
	}

	/**
	 * @param {SVGTextElement} textEl
	 * @param {PresenterShapeProps} updatedProp
	 */
	onTextChange(textEl, updatedProp) {
		super.onTextChange(textEl, updatedProp);
		this._onTextChange(textEl);
	}

	/**
	 * @private
	 * @param {SVGTextElement} textEl
	 * @returns {void}
	 */
	_onTextChange(textEl) {
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
		this._diagram.shapeUpdate(this, {
			// visability
			props: {
				main: rhomb,
				outer: { d: rhombPathCalc(120, 70, width + 80) },
				border: rhomb,
				// out connectors
				outleft: { cx: connectors.l.x },
				outright: { cx: connectors.r.x },
				outtop: { cy: connectors.t.y },
				outbottom: { cy: connectors.b.y },
				// in connectors
				'inleft-empty': { cx: connectors.l.x },
				'inleft-not-empty': { x: connectors.l.x },

				'inright-empty': { cx: connectors.r.x },
				'inright-not-empty': { x: -1 * connectors.r.x },

				'intop-empty': { cy: connectors.t.y },
				'intop-not-empty': { x: connectors.t.y },

				'inbottom-empty': { cy: connectors.b.y },
				'inbottom-not-empty': { x: -1 * connectors.b.y }
			},
			// connectors data
			connectors: {
				// out
				outleft: { innerPosition: connectors.l },
				outright: { innerPosition: connectors.r },
				outtop: { innerPosition: connectors.t },
				outbottom: { innerPosition: connectors.b },
				// in
				inleft: { innerPosition: connectors.l },
				inright: { innerPosition: connectors.r },
				intop: { innerPosition: connectors.t },
				inbottom: { innerPosition: connectors.b }
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
