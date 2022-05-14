import { SvgShapeTextEditorDecorator } from '../../diagram-extensions/svg-shape-texteditor-decorator.js';
import { ceil } from './infrastructure/resize-utils.js';

export class AppRectDecorator extends SvgShapeTextEditorDecorator {
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
		this._currentWidth = 150;
		/** @private */
		this._minWidth = 150;

		/** @private */
		this._currentHeight = 50;
		/** @private */
		this._minHeight = 50;
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
		let maxWidth = 0;
		for (const span of textEl.getElementsByTagName('tspan')) {
			const width = span.getBBox().width + 4; // 2 padding
			if (width > maxWidth) { maxWidth = width; }
		}
		const newWidth = ceil(this._minWidth, 40, maxWidth);

		const newHeight = ceil(this._minHeight, 20, textEl.getBBox().height + 4); // 2 padding

		if (newWidth !== this._currentWidth || newHeight !== this._currentHeight) {
			this._currentWidth = newWidth;
			this._currentHeight = newHeight;
			this._resize(newWidth, newHeight);
			this.panelUpdPos();
		}
	}

	/**
	 * @private
	 * @param {number} width
	 * @param {number} height
	 */
	_resize(width, height) {
		const rect = rectCalc(this._minWidth, this._minHeight, width, height);
		const connectors = {
			r: { cx: width + rect.x, cy: height / 2 + rect.y },
			l: { cx: rect.x, cy: height / 2 + rect.y },
			b: { cx: width / 2 + rect.x, cy: height + rect.y },
			t: { cx: width / 2 + rect.x, cy: rect.y }
		};
		this._diagram.shapeUpdate(this, {
			// visability
			props: {
				main: rect,
				outer: rectCalc(this._minWidth, this._minHeight, width + 40, height + 40),
				// out connectors
				outright: connectors.r,
				outleft: connectors.l,
				outbottom: connectors.b,
				outtop: connectors.t,
				// in connectors
				'inright-empty': connectors.r,
				'inright-not-empty': { x: -1 * connectors.r.cx, y: -1 * connectors.r.cy },
				'inleft-empty': connectors.l,
				'inleft-not-empty': { x: connectors.l.cx, y: connectors.r.cy },
				'inbottom-empty': connectors.b,
				'inbottom-not-empty': { x: -1 * connectors.b.cy, y: connectors.b.cx },
				'intop-empty': connectors.t,
				'intop-not-empty': { x: connectors.t.cy, y: -1 * connectors.t.cx }
			},
			// connectors data
			connectors: {
				// out
				outright: { innerPosition: { x: connectors.r.cx, y: connectors.r.cy } },
				outleft: { innerPosition: { x: connectors.l.cx, y: connectors.l.cy } },
				outbottom: { innerPosition: { x: connectors.b.cx, y: connectors.b.cy } },
				outtop: { innerPosition: { x: connectors.t.cx, y: connectors.t.cy } },
				// in
				inright: { innerPosition: { x: connectors.r.cx, y: connectors.r.cy } },
				inleft: { innerPosition: { x: connectors.l.cx, y: connectors.l.cy } },
				inbottom: { innerPosition: { x: connectors.b.cx, y: connectors.b.cy } },
				intop: { innerPosition: { x: connectors.t.cx, y: connectors.t.cy } }
			}
		});
	}
}

function rectCalc(baseWidth, baseHeight, width, height) {
	return {
		y: (baseHeight - height) / 2,
		x: (baseWidth - width) / 2,
		width,
		height
	};
}
