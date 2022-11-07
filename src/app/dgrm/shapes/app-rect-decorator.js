import { AppShapeEditorDecorator } from './app-shape-editor-decorator.js';
import { ceil } from './infrastructure/resize-utils.js';

export class AppRectDecorator extends AppShapeEditorDecorator {
	/**
	 * @param {IDiagram} diagram
	 * @param {ISvgPresenterShape} svgShape
	 * @param {IAppShapeData} addParam
	 * @param { {resizeFromCenter:boolean}?= } rectProps
	 */
	constructor(diagram, svgShape, addParam, rectProps) {
		super(diagram, svgShape, addParam);

		/** @private */
		this._minWidth = this._currentWidth = 96;

		/** @private */
		this._minHeight = this._currentHeight = 48;

		/**
		 * outer svg elem position
		 * @private
		 */
		this._outerPost = { x: -24, y: -24 };

		/** @private */
		this._resizeFromCenter = rectProps?.resizeFromCenter ?? true;
	}

	/**
	 * @param {SVGTextElement} textEl
	 * @param {DiagramShapeProps} updatedProp
	 * private
	 */
	onTextChange(textEl, updatedProp) {
		let maxWidth = 0;
		for (const span of textEl.getElementsByTagName('tspan')) {
			const width = span.getBBox().width + 4 + // 2 padding
				(this._resizeFromCenter ? 0 : 6); // 6 left margin for textinput
			if (width > maxWidth) { maxWidth = width; }
		}
		const newWidth = ceil(this._minWidth, 48, maxWidth);
		const newHeight = ceil(
			this._minHeight,
			48,
			textEl.getBBox().height + 4); // + (this._resizeFromCenter ? 0 : 20)); // 2 padding

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
		const rect = this._rectCalc(width, height, { x: 0, y: 0 });

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
				outer: this._rectCalc(width + 48, height + 48, this._outerPost),
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

	/**
	 * @private
	 * @param {number} width
	 * @param {number} height
	 * @param {Point} currentPosition
	 * @returns {{x:number, y:number, width:number, height:number}}
	 */
	_rectCalc(width, height, currentPosition) {
		return this._resizeFromCenter
			? rectCalc(this._minWidth, this._minHeight, width, height)
			: { x: currentPosition.x, y: (this._minHeight - height) / 2, width, height };
	}
}

/**
 * @param {number} baseWidth
 * @param {number} baseHeight
 * @param {number} width
 * @param {number} height
 * @returns {{x:number, y:number, width:number, height:number}}
 */
function rectCalc(baseWidth, baseHeight, width, height) {
	return {
		y: (baseHeight - height) / 2,
		x: (baseWidth - width) / 2,
		width,
		height
	};
}
