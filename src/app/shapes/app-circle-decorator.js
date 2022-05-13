import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';
import { boxPoints } from './infrastructure/box-points.js';

export class AppCircleDecorator extends SvgShapeTextEditorDecorator {
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
		this._currentRadius = 60;
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
		let maxRadius = 0;
		for (const span of textEl.getElementsByTagName('tspan')) {
			for (const point of boxPoints(span.getBBox())) {
				const r = point.x ** 2 + point.y ** 2;
				if (r > maxRadius) { maxRadius = r; }
			}
		}
		maxRadius = Math.sqrt(maxRadius);

		let newRadius = 60; // 60 - min radius
		if (maxRadius > 60) {
			newRadius = Math.ceil(maxRadius / 20) * 20; // 20 - resize step
		}

		if (newRadius !== this._currentRadius) {
			this._currentRadius = newRadius;
			this._resize(newRadius);
		}
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
}
