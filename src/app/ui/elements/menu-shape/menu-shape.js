/** @implements {Menu} */
export class Menu extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML =
			`<style>
			.menu {
				overflow-x: auto;
				padding: 0;
				position: fixed;
				bottom: 15px;
				left: 50%;
				transform: translateX(-50%);
				box-shadow: 0px 0px 58px 2px rgba(34, 60, 80, 0.2);
				border-radius: 16px;
				background-color: rgba(255,255,255, .9);
			}

			.content {
				white-space: nowrap;
				display: flex;
			}
			
			[data-cmd] {
				cursor: pointer;
			}

			.menu svg {
				height: 42px;
				display: inline-block;
				padding: 15px 10px;
				stroke: #344767;
				stroke-width: 2px;
				fill: #fff;
				width: 42px;
				min-width: 42px;
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
				}

				.content {
					align-self: center;
				}
			}
			</style>
			<div id="menu" class="menu" style="touch-action: none;">
				<div class="content">
					<svg data-cmd="shapeAdd" data-cmd-arg="circle" style="padding-left: 20px;">
						<circle r="20" cx="21" cy="21"></circle>
					</svg>
					<svg data-cmd="shapeAdd" data-cmd-arg="rect" class="big">
						<rect x="1" y="1" width="60" height="40" rx="15" ry="15"></rect>
					</svg>
					<svg data-cmd="shapeAdd" data-cmd-arg="rhomb" class="big">
						<g transform="translate(1,1)">
							<path d="M0 20 L30 0 L60 20 L30 40 Z" stroke-width="2" stroke-linejoin="round"></path>
						</g>
					</svg>
					<svg data-cmd="shapeAdd" data-cmd-arg="text">
						<text x="5" y="40" font-size="52px" fill="#344767" stroke-width="0">T</text>
					</svg>
				</div>
			</div>`;

		const menu = shadow.getElementById('menu');
		menu.querySelectorAll('[data-cmd="shapeAdd"]').forEach(el => el.addEventListener('pointerdown', this));
		menu.addEventListener('pointerleave', this);
		menu.addEventListener('pointerup', this);
		menu.addEventListener('pointermove', this);
	};

	/**
	 * @param {IAppDiagramSerializable} diagram
	 */
	init(diagram) {
		this._menuLogic = new MenuLogic(diagram);
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	handleEvent(evt) {
		switch (evt.type) {
			case 'pointerdown':
				this._isNativePointerleaveTriggered = false;
				this._isShapeDragOutDispatched = false;
				this._pressedShape = evt.currentTarget.getAttribute('data-cmd-arg');

				// for emulate pointerleave
				this._parentElem = document.elementFromPoint(evt.clientX, evt.clientY);
				this._pointElem = this._parentElem;
				break;
			case 'pointerup':
				this._isNativePointerleaveTriggered = false;
				this._isShapeDragOutDispatched = false;
				this._pressedShape = null;
				this._menuLogic.pointerUpMobile();
				break;
			case 'pointermove':
				this._emulatePointerleave(evt);

				// if native 'pointerleave' don't fire -> mobile
				if (!this._isNativePointerleaveTriggered && this._isShapeDragOutDispatched) {
					this._menuLogic.shapeMoveMobile({
						clientX: evt.clientX,
						clientY: evt.clientY
					});
				}
				break;
			case 'pointerleave':
				this._isNativePointerleaveTriggered = true;
				this._leave(evt);
				break;
		}
	}

	/**
	 * @param {PointerEvent & { currentTarget: Element }} evt
	 * @private
	 */
	_emulatePointerleave(evt) {
		// emulate pointerleave for mobile

		// if standart 'pointerleave' works -> this._pressedShape = null
		// emulation will not trigger event second time

		if (!this._pressedShape) { return; }

		const pointElem = document.elementFromPoint(evt.clientX, evt.clientY);
		if (pointElem === this._pointElem) {
			return;
		}

		// pointerleave
		if (this._parentElem === this._pointElem) {
			this._leave(evt);
		}

		/**
		 * @type {Element}
		 * @private
		 */
		this._pointElem = pointElem;
	}

	/**
	 * @param {PointerEvent & { currentTarget: Element }} evt
	 * @private
	 */
	_leave(evt) {
		if (!this._pressedShape) { return; }

		this._menuLogic.shapeDragOut({
			shape: this._pressedShape,
			clientX: evt.clientX,
			clientY: evt.clientY
		});

		this._pressedShape = null;
		this._isShapeDragOutDispatched = true;
	}
}
customElements.define('ap-menu-shape', Menu);

/**
 * Menu
 * implement UI and provide events
 * - shapeDragOut from shapes panel
 * - shape is moving (only for mobile)
 *
 * MenuLogic
 * implements logic of adding shape to diagram
 */
class MenuLogic {
	/**
	 * @param {IAppDiagramSerializable} diagram
	 */
	constructor(diagram) {
		this._diagram = diagram;
	}

	/**
	 * when shape drag put from menu panel
	 * @param {IMenuShapeDragOutEventDetail} evt
	 */
	shapeDragOut(evt) {
		const point = this._diagram.svg.querySelector(`[data-templ='${evt.shape}']`).getAttribute('data-center').split(',');
		/**
		 * @type {Point}
		 * @private
		 */
		this._addingShapeCenter = { x: parseFloat(point[0]), y: parseFloat(point[1]) };

		/**
		 * @type {IDiagramShape}
		 * @private
		 */
		this._addingShape = this._diagram.shapeAdd({
			templateKey: evt.shape,
			position: {
				x: evt.clientX - this._addingShapeCenter.x,
				y: evt.clientY - this._addingShapeCenter.y
			},
			props: {
				text: { textContent: 'Title' }
			}
		});

		this._diagram.shapeSetMoving(
			this._addingShape,
			// cursorPosition
			{ x: evt.clientX, y: evt.clientY });

		//
		// remember canvas position for mobile

		const shapePosition = this._addingShape.positionGet();

		/**
		 * needed only for mobile
		 * @type {Point}
		 * @private
		 */
		this._shapeAddingCanvasPositionForMobile = {
			x: evt.clientX - this._addingShapeCenter.x - shapePosition.x,
			y: evt.clientY - this._addingShapeCenter.y - shapePosition.y
		};
	}

	/**
	 * when shape is moved
	 * fire only on mobile
	 * @param {IMenuShapeMoveEventDetail} evt
	 */
	shapeMoveMobile(evt) {
		this._diagram.shapeUpdate(
			this._addingShape,
			{
				position: {
					x: evt.clientX - this._addingShapeCenter.x - this._shapeAddingCanvasPositionForMobile.x,
					y: evt.clientY - this._addingShapeCenter.y - this._shapeAddingCanvasPositionForMobile.y
				}
			});
	}

	pointerUpMobile() {
		if (this._addingShape) {
			this._diagram.movedClean();
		}
	}
}
