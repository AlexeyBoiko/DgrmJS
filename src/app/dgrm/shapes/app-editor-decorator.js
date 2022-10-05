import { SvgElementEditableAbstract } from '../../../diagram-extensions/text-editor/svg-shape-editable-abstract-decorator.js';
import { SvgShapeTextEditorDecorator } from '../../../diagram-extensions/text-editor/svg-shape-texteditor-decorator.js';
import { pnlDel, pnlMove, pnlDelShow, pnlSymbol, pnlColorShow } from '../panel-create.js';

/** @implements {IAppShapeEditorDecorator} */
export class AppShapeEditorDecorator extends SvgShapeTextEditorDecorator {
	/**
	 * @param {IDiagram} diagram
	 * @param {ISvgPresenterShape} svgShape
	 * @param {DiagramShapeProps} initProps
	 */
	constructor(diagram, svgShape, initProps) {
		super(svgShape, initProps);
		this.diagram = diagram;
	}

	/**
	 * when shape enter edit mode
	 * override this method
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	onEdit(evt) {
		this.svgEl.classList.add('highlighted');
		this._panelShow();
	}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {
		super.onEditLeave();
		this.svgEl.classList.remove('highlighted');
		pnlDel(this);
	}

	/** @private */
	_panelShow() {
		// this.svgEl.querySelector('[data-key="main"]').getAttribute('fill')
		pnlColorShow(this, 0, 0, 'red', (cmd, arg) => {
			switch (cmd) {
				case 'del': this.diagram.del(this); break;
				case 'color':
					this.diagram.shapeUpdate(this, {
						props: { main: { fill: arg, stroke: arg } }
					});
					break;
			}
		});
		this.panelUpdPos();
	}

	/** update panel position */
	panelUpdPos() {
		if (this[pnlSymbol]) {
			const position = this.svgEl.getBoundingClientRect();
			pnlMove(this, position.left + 10, position.top - 35);
		}
	}
}

/** @implements {IConnectorPath} */
export class AppPathEditiorDecorator extends SvgElementEditableAbstract {
	/**
	 * @param {IDiagram} diagram
	 * @param {ISvgPresenterPath} svgElement
	 */
	constructor(diagram, svgElement) {
		super(svgElement);
		this.diagram = diagram;
	}

	// @ts-ignore
	get end() {	return /** @type {IConnectorPath} */(this.svgElement).end; }
	// @ts-ignore
	get start() { return /** @type {IConnectorPath} */(this.svgElement).start; }

	/**
	 * @param {DiagramShapeState} state
	 */
	stateHas(state) { return this.svgElement.stateHas(state); }
	stateGet() { return this.svgElement.stateGet(); }

	/**
	 * when shape enter edit mode
	 * override this method
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	onEdit(evt) {
		pnlDelShow(this, evt.clientX - 20, evt.clientY - 55, () => {
			this.diagram.del(this);
		});
	}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {
		pnlDel(this);
	}
}
