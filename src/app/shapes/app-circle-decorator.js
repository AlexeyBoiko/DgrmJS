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
			this._minRadius = this._circle.r.baseVal.value;
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
			do { this._testCircle.r.baseVal.value = this._testCircle.r.baseVal.value + 20; }
			while (this._isOut(textEl));

			this._resize(this._testCircle.r.baseVal.value);
		} else {
			if (this._minRadius === this._circle.r.baseVal.value) { return; }

			do { this._testCircle.r.baseVal.value = this._testCircle.r.baseVal.value - 20; }
			while (!this._isOut(textEl));

			this._testCircle.r.baseVal.value = this._testCircle.r.baseVal.value + 20;
			if (this._circle.r.baseVal.value !== this._testCircle.r.baseVal.value) {
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
	 * @param {number} radius
	 */
	_resize(radius) {
		this._circle.r.baseVal.value = radius;
		/** @type {SVGCircleElement}} */(this._getElem('outer')).r.baseVal.value = radius + 20;

		// out connectors
		/** @type {SVGCircleElement}} */(this._getElem('outright')).cx.baseVal.value = radius;
		/** @type {SVGCircleElement}} */(this._getElem('outleft')).cx.baseVal.value = -1 * radius;
		/** @type {SVGCircleElement}} */(this._getElem('outbottom')).cy.baseVal.value = radius;
		/** @type {SVGCircleElement}} */(this._getElem('outtop')).cy.baseVal.value = -1 * radius;

		// in connectors

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
