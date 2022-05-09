import { svgTextIsOut } from '../../diagram-extensions/infrastructure/svg-text-is-out.js';
import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';

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
			this._onTextChange(/** @type {SVGTextElement} */ (this._getElem('text')));
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

		if (!this._circle) {
			/** @private */
			this._circle = /** @type {SVGCircleElement}} */ (this._getElem('main'));

			/** @private */
			this._mainRadiusMin = radius(this._circle);
		}

		if (!this._testCircle) {
			/** @private */
			this._testCircle = /** @type {SVGCircleElement}} */ (this._circle.cloneNode(false));
			this._testCircle.style.fill = 'transparent';
			this._testCircle.style.stroke = 'transparent';
			this._testCircle.removeAttribute('data-key');
			this.svgEl.insertBefore(this._testCircle, this._circle);
		}

		// resize

		if (this._isOut(textEl)) {
			do { radiusIncrement(this._testCircle, 20); }
			while (this._isOut(textEl));

			this._resize(radius(this._testCircle));
		} else {
			if (this._mainRadiusMin === radius(this._circle)) { return; }

			do { radiusIncrement(this._testCircle, -20); }
			while (!this._isOut(textEl));

			radiusIncrement(this._testCircle, 20);
			if (radius(this._circle) !== radius(this._testCircle)) {
				this._resize(this._testCircle.r.baseVal.value);
			}
		}
	}

	/**
	 * @private
	 * @param {SVGTextElement} textEl
	 * @returns {boolean}
	 */
	_isOut(textEl) {
		return svgTextIsOut(textEl, this._testCircle, 5);
	}

	/**
	 * @private
	 * @param {number} mainRadius
	 */
	_resize(mainRadius) {
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
	 * @private
	 * @param {string} dataKey keyAttr value
	 * @returns {Element}
	 */
	_getElem(dataKey) {
		return this.svgEl.querySelector(`[data-key="${dataKey}"]`);
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

/**
 * @param {SVGCircleElement} circle
 */
function radius(circle) {
	return circle.r.baseVal.value;
}

/**
 * @param {SVGCircleElement} circle
 * @param {number} val
 */
function radiusIncrement(circle, val) {
	circle.r.baseVal.value = circle.r.baseVal.value + val;
}
