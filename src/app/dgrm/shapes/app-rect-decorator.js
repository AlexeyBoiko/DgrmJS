import { AppShapeEditorDecorator } from './app-editor-decorator.js';
import { ceil } from './infrastructure/resize-utils.js';

export class AppRectDecorator extends AppShapeEditorDecorator {
	/**
	 * @param {IDiagram} diagram
	 * @param {ISvgPresenterShape} svgShape
	 * @param {DiagramShapeProps} initProps
	 */
	constructor(diagram, svgShape, initProps) {
		super(diagram, svgShape, initProps);

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
		const cons = {
			r: { cx: width + rect.x, cy: height / 2 + rect.y },
			l: { cx: rect.x, cy: height / 2 + rect.y },
			b: { cx: width / 2 + rect.x, cy: height + rect.y },
			t: { cx: width / 2 + rect.x, cy: rect.y }
		};
		const consData = {
			right: { innerPosition: { x: cons.r.cx, y: cons.r.cy } },
			left: { innerPosition: { x: cons.l.cx, y: cons.l.cy } },
			bottom: { innerPosition: { x: cons.b.cx, y: cons.b.cy } },
			top: { innerPosition: { x: cons.t.cx, y: cons.t.cy } }
		};
		this.diagram.shapeUpdate(this, {
			// visability
			props: {
				main: rect,
				outer: rectCalc(this._minWidth, this._minHeight, width + 40, height + 40),
				// out connectors
				outright: cons.r,
				outleft: cons.l,
				outbottom: cons.b,
				outtop: cons.t,
				// in connectors
				inright: cons.r,
				inleft: cons.l,
				inbottom: cons.b,
				intop: cons.t
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

function rectCalc(baseWidth, baseHeight, width, height) {
	return {
		y: (baseHeight - height) / 2,
		x: (baseWidth - width) / 2,
		width,
		height
	};
}
