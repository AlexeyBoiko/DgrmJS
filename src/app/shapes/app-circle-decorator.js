import { svgTextIsOut } from '../../diagram-extensions/infrastructure/svg-text-is-out.js';
import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';
import { cloneUnshiftTransparent } from './dom-utils.js';

export class AppCircleDecorator extends SvgShapeTextEditorDecorator {
	/**
	 * @param {IDiagram} diagram
	 * @param {ISvgPresenterShape} svgShape
	 * @param {PresenterShapeProps} initProps
	 */
	constructor(diagram, svgShape, initProps) {
		super(svgShape, initProps);
		this._diagram = diagram;
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
		// init

		if (!this._radius) {
			/** @private */
			this._radius = 60;

			/** @private */
			this._radiusTest = 60;

			/** @private */
			this._radiusMin = 60;
		}

		if (!this._testCircle) {
			/** @private */
			this._testCircle = /** @type {SVGCircleElement}} */(cloneUnshiftTransparent(this.svgEl, 'main'));
		}

		// resize

		if (this._isOut(textEl)) {
			do { this._increment(20); }
			while (this._isOut(textEl));

			this._resize(this._radiusTest);
		} else {
			if (this._radiusMin === this._radiusTest) { return; }

			do { this._increment(-20); }
			while (!this._isOut(textEl) && this._radiusMin <= this._radiusTest);

			this._increment(20);
			if (this._radius !== this._radiusTest) {
				this._resize(this._radiusTest);
			}
		}
	}

	/**
	 * @private
	 * @param {SVGTextElement} textEl
	 * @returns {boolean}
	 */
	_isOut(textEl) {
		return svgTextIsOut(textEl, this._testCircle, 2);
	}

	/**
	 * @private
	 * @param {number} val
	 */
	_increment(val) {
		this._radiusTest = this._radiusTest + val;
		this._testCircle.r.baseVal.value = this._radiusTest;
	}

	/**
	 * @private
	 * @param {number} mainRadius
	 */
	_resize(mainRadius) {
		this._radius = mainRadius;

		const radNegative = -1 * mainRadius;
		this._diagram.shapeUpdate(this, {
			// visability
			props: {
				main: { r: mainRadius },
				outer: { r: mainRadius + 20 },
				// out connectors
				outright: { cx: mainRadius },
				outleft: { cx: radNegative },
				outbottom: { cy: mainRadius },
				outtop: { cy: radNegative },
				// in connectors
				'inright-empty': { cx: mainRadius },
				'inright-not-empty': { x: radNegative },
				'inleft-empty': { cx: radNegative },
				'inleft-not-empty': { x: radNegative },
				'inbottom-empty': { cy: mainRadius },
				'inbottom-not-empty': { x: radNegative },
				'intop-empty': { cy: radNegative },
				'intop-not-empty': { x: radNegative }
			},
			// connectors data
			connectors: {
				// out
				outright: { innerPosition: { x: mainRadius, y: 0 } },
				outleft: { innerPosition: { x: radNegative, y: 0 } },
				outbottom: { innerPosition: { x: 0, y: mainRadius } },
				outtop: { innerPosition: { x: 0, y: radNegative } },
				// in
				inright: { innerPosition: { x: mainRadius, y: 0 } },
				inleft: { innerPosition: { x: radNegative, y: 0 } },
				inbottom: { innerPosition: { x: 0, y: mainRadius } },
				intop: { innerPosition: { x: 0, y: radNegative } }
			}
		});
	}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {
		super.onEditLeave();

		if (this._testCircle) {
			this._testCircle.remove();
			this._testCircle = null;
		}
	}
}
