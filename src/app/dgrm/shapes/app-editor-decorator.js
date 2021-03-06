import { SvgElementEditableAbstract } from '../../../diagram-extensions/shapes/svg-shape-editable-abstract-decorator.js';
import { SvgShapeTextEditorDecorator } from '../../../diagram-extensions/shapes/svg-shape-texteditor-decorator.js';

/** @implements {IAppShapeEditorDecorator} */
export class AppShapeEditorDecorator extends SvgShapeTextEditorDecorator {
	/**
	 * when shape enter edit mode
	 * override this method
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	onEdit(evt) {
		this.svgEl.classList.add('edit');
		this._panelShow();
	}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {
		super.onEditLeave();
		this.svgEl.classList.remove('edit');
		this._panelDel();
	}

	/** @private */
	_panelShow() {
		/** @private */
		this._panel = panelCreate();
		this._panel.onclick = _ => {
			this._panelDel();
			this.svgEl.dispatchEvent(new CustomEvent('del', {
				/** @type {ShapeTextEditorDecoratorEventUpdateDetail} */
				detail: {
					target: this
				}
			}));
		};
		this.panelUpdPos();

		document.body.append(this._panel);
	}

	/** update panel position */
	panelUpdPos() {
		if (!this._panel) { return; }
		const position = this.svgEl.getBoundingClientRect();
		this._panel.style.top = `${window.scrollY + position.top - 35}px`; // window.scrollY fix IPhone keyboard
		this._panel.style.left = `${position.left + 10}px`;
	}

	/** @private */
	_panelDel() {
		if (!this._panel) { return; }
		this._panel.remove();
		this._panel = null;
	}
}

/** @implements {IAppPathEditorDecorator} */
export class AppPathEditiorDecorator extends SvgElementEditableAbstract {
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
	 * @param {AppPathEditorEventType} type
	 * @param {EventListenerOrEventListenerObject} listener
	 * @returns {IAppPathEditorDecorator}
	 */
	on(type, listener) {
		if (!this._listeners) {
			/**
			 * @type {{t:AppPathEditorEventType, l:EventListenerOrEventListenerObject }[]}
			 * @private
			 */
			this._listeners = [];
		}
		this._listeners.push({ t: type, l: listener });
		this.svgElement.svgEl.addEventListener(type, listener);
		return this;
	}

	dispose() {
		this._listeners?.forEach(ll => this.svgElement.svgEl.removeEventListener(ll.t, ll.l));
		super.dispose();
	}

	/**
	 * when shape enter edit mode
	 * override this method
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	onEdit(evt) {
		/** @private */
		this._panel = panelCreate();
		this._panel.style.top = `${evt.clientY - 55}px`;
		this._panel.style.left = `${evt.clientX - 20}px`;
		this._panel.onclick = _ => {
			this._panelDel();
			this.svgEl.dispatchEvent(new CustomEvent('del', {
				/** @type {IDiagramEventDetail<IAppPathEditorDecorator> } */
				detail: {
					target: this
				}
			}));
		};

		document.body.append(this._panel);
	}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {
		this._panelDel();
	}

	/** @private */
	_panelDel() {
		if (!this._panel) { return; }
		this._panel.remove();
		this._panel = null;
	}
}

/** @return {HTMLDivElement} */
function panelCreate() {
	const panelDiv = document.createElement('div');
	panelDiv.style.cssText = 'position: fixed; padding: 10px;	box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);';
	panelDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>';
	return panelDiv;
}
