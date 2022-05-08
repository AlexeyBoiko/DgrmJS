import { svgTextIsOut } from '../../diagram-extensions/infrastructure/svg-text-is-out.js';
import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';

export class AppCircleDecorator extends SvgShapeTextEditorDecorator {
	/**
	 * @param {SVGTextElement} textEl
	 */
	onTextChange(textEl) {
		super.onTextChange(textEl);

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
			this.svgEl.appendChild(this._testCircle);
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
		this._circle.r.baseVal.value = mainRadius;
		/** @type {SVGCircleElement}} */(this._getElem('outer')).r.baseVal.value = mainRadius + 20;

		// out connectors
		this._cx('outright', mainRadius);
		this._cx('outleft', -1 * mainRadius);
		this._cy('outbottom', mainRadius);
		this._cy('outtop', -1 * mainRadius);

		// in connectors
		/** @type {SVGCircleElement}} */(this._getElem('inright').getElementsByTagName('circle')[0]).cx.baseVal.value = mainRadius;

		// redrow connector lines
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
	 * set 'cx' of the circle with {dataKey}
	 * @private
	 * @param {string} dataKey
	 * @param {number} val
	 */
	_cx(dataKey, val) {
		/** @type {SVGCircleElement}} */(this._getElem(dataKey)).cx.baseVal.value = val;
	}

	/**
	 * set 'cx' of the circle with {dataKey}
	 * @private
	 * @param {string} dataKey
	 * @param {number} val
	 */
	_cy(dataKey, val) {
		/** @type {SVGCircleElement}} */(this._getElem(dataKey)).cy.baseVal.value = val;
	}

	// /**
	//   * when shape leave edit mode
	//   * override this method
	//   */
	// onEditLeave() {
	// 	super.onEditLeave();

	// 	if (this._testCircle) {
	// 		this._testCircle.remove();
	// 		this._testCircle = null;
	// 	}
	// }
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
