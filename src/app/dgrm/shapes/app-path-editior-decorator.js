import { SvgElementEditableAbstract } from '../../../diagram-extensions/text-editor/svg-shape-editable-abstract-decorator.js';
import { pnlDel, pnlDelShow } from '../panel-create.js';

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
