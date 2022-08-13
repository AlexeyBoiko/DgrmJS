import { SvgElementEditableAbstract } from '../../../diagram-extensions/text-editor/svg-shape-editable-abstract-decorator.js';
import { SvgShapeTextEditorDecorator } from '../../../diagram-extensions/text-editor/svg-shape-texteditor-decorator.js';
import { delBtnDel, delBtnMove, delBtnShow, delBtnSymbol } from '../panel-create.js';

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
		delBtnDel(this);
	}

	/** @private */
	_panelShow() {
		delBtnShow(this, 0, 0, () => {
			this.diagram.del(this);
		});
		this.panelUpdPos();
	}

	/** update panel position */
	panelUpdPos() {
		if (this[delBtnSymbol]) {
			const position = this.svgEl.getBoundingClientRect();
			delBtnMove(this, position.left + 10, position.top - 35);
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
		delBtnShow(this, evt.clientX - 20, evt.clientY - 55, () => {
			this.diagram.del(this);
		});
	}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {
		delBtnDel(this);
	}
}
