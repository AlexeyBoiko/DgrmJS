import { AppShapeEditorDecorator } from './app-editor-decorator.js';
import { boxPoints } from './infrastructure/box-points.js';
import { ceil } from './infrastructure/resize-utils.js';

export class AppCircleDecorator extends AppShapeEditorDecorator {
	/**
	 * @param {IDiagram} diagram
	 * @param {ISvgPresenterShape} svgShape
	 * @param {DiagramShapeProps} initProps
	 */
	constructor(diagram, svgShape, initProps) {
		super(svgShape, initProps);

		/** @private */
		this._diagram = diagram;

		/** @private */
		this._currentRadius = 60;
	}

	/**
	 * @param {DiagramShapeUpdateParam} param
	 */
	update(param) {
		super.update(param);
		if (param.props?.text?.textContent !== undefined) {
			this._onTextChange(/** @type {SVGTextElement} */ (this.svgEl.querySelector('[data-key="text"]')));
		}
	}

	/**
	 * @param {SVGTextElement} textEl
	 * @param {DiagramShapeProps} updatedProp
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
		let maxRadiusQrt = 0;
		for (const span of textEl.getElementsByTagName('tspan')) {
			for (const point of boxPoints(span.getBBox())) {
				const r = point.x ** 2 + point.y ** 2;
				if (r > maxRadiusQrt) { maxRadiusQrt = r; }
			}
		}
		const newRadius = ceil(60, 20, Math.sqrt(maxRadiusQrt));

		if (newRadius !== this._currentRadius) {
			this._currentRadius = newRadius;
			this._resize(newRadius);
			this.panelUpdPos();
		}
	}

	/**
	 * @private
	 * @param {number} mainRadius
	 */
	_resize(mainRadius) {
		const radNegative = -1 * mainRadius;
		const cons = {
			right: { cx: mainRadius },
			left: { cx: radNegative },
			bottom: { cy: mainRadius },
			top: { cy: radNegative }
		};
		const consData = {
			right: { innerPosition: { x: mainRadius, y: 0 } },
			left: { innerPosition: { x: radNegative, y: 0 } },
			bottom: { innerPosition: { x: 0, y: mainRadius } },
			top: { innerPosition: { x: 0, y: radNegative } }
		};
		this._diagram.shapeUpdate(this, {
			// visability
			props: {
				main: { r: mainRadius },
				outer: { r: mainRadius + 20 },
				// out connectors
				outright: cons.right,
				outleft: cons.left,
				outbottom: cons.bottom,
				outtop: cons.top,
				// in connectors
				inright: cons.right,
				inleft: cons.left,
				inbottom: cons.bottom,
				intop: cons.top
			},
			// connectors data
			connectors: {
				// out
				outright: consData.right,
				outleft: consData.left,
				outbottom: consData.bottom,
				outtop: consData.top,
				// in
				inright: consData.right,
				inleft: consData.left,
				inbottom: consData.bottom,
				intop: consData.top
			}
		});
	}
}
