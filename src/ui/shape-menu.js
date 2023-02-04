import { pointInCanvas } from '../infrastructure/move-scale-applay.js';
import { listen } from '../infrastructure/util.js';
import { tipShow } from './ui.js';

export class ShapeMenu extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML =
			`<style>
			.menu {
				overflow-x: auto;
				padding: 0;
				position: fixed;
				top: 50%;
				left: 15px;
				transform: translateY(-50%);
				box-shadow: 0px 0px 58px 2px rgba(34, 60, 80, 0.2);
				border-radius: 16px;
				background-color: rgba(255,255,255, .9);
			}

			.content {
				white-space: nowrap;
				display: flex;
				flex-direction: column;
			}
			
			[data-cmd] {
				cursor: pointer;
			}

			.menu svg { padding: 10px; }
			.stroke {
				stroke: #344767;
				stroke-width: 2px;
				fill: transparent;
			}
		
			.menu .big {
				width: 62px;
				min-width: 62px;
			}

			@media only screen and (max-width: 700px) {
				.menu {
					width: 100%;
					border-radius: 0;
					bottom: 0;
					display: flex;
  					flex-direction: column;
					top: unset;
					left: unset;
					transform: unset;
				}

				.content {
					align-self: center;
					flex-direction: row;
				}
			}
			</style>
			<div id="menu" class="menu" style="touch-action: none;">
				<div class="content">
					<svg class="stroke" data-cmd="shapeAdd" data-cmd-arg="1" viewBox="0 0 24 24" width="24" height="24"><circle r="9" cx="12" cy="12"></circle></svg>
					<svg class="stroke" data-cmd="shapeAdd" data-cmd-arg="4" viewBox="0 0 24 24" width="24" height="24"><path d="M2 12 L12 2 L22 12 L12 22 Z" stroke-linejoin="round"></path></svg>
					<svg class="stroke" data-cmd="shapeAdd" data-cmd-arg="2" viewBox="0 0 24 24" width="24" height="24"><rect x="2" y="4" width="20" height="16" rx="3" ry="3"></rect></svg>
					<svg data-cmd="shapeAdd" data-cmd-arg="0" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 8v8a3 3 0 0 1-3 3H7.83a3.001 3.001 0 1 1 0-2H10a1 1 0 0 0 1-1V8a3 3 0 0 1 3-3h3V2l5 4-5 4V7h-3a1 1 0 0 0-1 1z" fill="rgba(52,71,103,1)"/></svg>
					<svg data-cmd="shapeAdd" data-cmd-arg="3" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13 6v15h-2V6H5V4h14v2z" fill="rgba(52,71,103,1)"/></svg>
				</div>
			</div>`;

		const menu = shadow.getElementById('menu');
		menu.querySelectorAll('[data-cmd="shapeAdd"]').forEach(el => listen(el, 'pointerdown', this));
		listen(menu, 'pointerleave', this);
		listen(menu, 'pointerup', this);
		listen(menu, 'pointermove', this);
	};

	/**
	 * @param {SVGGElement} canvas
	 * @param {{position:{x:number, y:number}, scale:number, cell:number}} canvasData
	 * @param {Record<number, ShapeType>} shapeTypeMap
	 */
	init(canvas, canvasData, shapeTypeMap) {
		/** @private */ this._canvas = canvas;
		/** @private */ this._canvasData = canvasData;
		/** @private */ this._shapeTypeMap = shapeTypeMap;
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'pointermove':
				if (!this._isNativePointerleaveTriggered) {
					// emulate pointerleave for mobile

					const pointElem = document.elementFromPoint(evt.clientX, evt.clientY);
					if (pointElem === this._pointElem) {
						return;
					}

					// pointerleave
					if (this._parentElem === this._pointElem) {
						// TODO: check mobile
						this._canvas.ownerSVGElement.setPointerCapture(evt.pointerId);
						// this._shapeCreate(evt);
					}

					/**
					 * @type {Element}
					 * @private
					 */
					this._pointElem = pointElem;
				}
				break;
			case 'pointerleave':
				this._isNativePointerleaveTriggered = true;
				if (this._pressedShapeTemplKey != null) {
					// when shape drag out from menu panel
					this._shapeCreate(evt);
				}
				this._clean();
				break;
			case 'pointerdown':
				this._pressedShapeTemplKey = parseInt(evt.currentTarget.getAttribute('data-cmd-arg'));

				// for emulate pointerleave
				this._parentElem = document.elementFromPoint(evt.clientX, evt.clientY);
				this._pointElem = this._parentElem;
				this._isNativePointerleaveTriggered = null;
				break;
			case 'pointerup':
				this._clean();
				break;
		}
	}

	/**
	 * @param {PointerEvent} evt
	 * @private
	 */
	_shapeCreate(evt) {
		tipShow(false);

		const evtPoint = pointInCanvas(this._canvasData, evt.clientX, evt.clientY);

		//  TODO: create facktory map with increasing
		const shapeData = this._pressedShapeTemplKey === 0
			? /** @type {import('../shapes/path.js').PathData} */({
				s: { data: { dir: 'right', position: { x: evtPoint.x - 24, y: evtPoint.y } } },
				e: { data: { dir: 'right', position: { x: evtPoint.x + 24, y: evtPoint.y } } }
			})
			: {
				type: this._pressedShapeTemplKey,
				position: {
					x: evtPoint.x,
					y: evtPoint.y
				},
				title: 'Title'
			};

		const shapeEl = this._shapeTypeMap[this._pressedShapeTemplKey].create(shapeData);
		this._canvas.append(shapeEl);
		shapeEl.dispatchEvent(new PointerEvent('pointerdown', evt));
	}

	/** @private */
	_clean() {
		this._pressedShapeTemplKey = null;
		this._parentElem = null;
		this._pointElem = null;
	}
}
customElements.define('ap-menu-shape', ShapeMenu);

/** @typedef { import('../shapes/shape-type-map.js').ShapeType } ShapeType */
