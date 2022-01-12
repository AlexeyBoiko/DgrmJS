import { svgPositionSet, svgPositionGet, svgRotate } from '../infrastructure/svg-utils.js';

/** @implements {IPresenterShape} */
export class SvgShape {
	/**
	 * @param {object} param
	 * @param {SVGGraphicsElement} param.svgEl
	 * @param {boolean=} param.connectable
	 * @param {IPresenterConnector=} param.defaultInConnector
	 */
	constructor({ svgEl, connectable = null, defaultInConnector = null }) {
		/** @private */
		this._svgEl = svgEl;

		/**
		 * @type {Set<PresenterShapeState>}
		 * @private
		 */
		this._state = new Set();

		/** @type {PresenterElementType} */
		this.type = 'shape';
		this.connectable = connectable;
		this.defaultInConnector = defaultInConnector;
	}

	/**
	 * NOT immutable, change with update method
	 * @returns {Set<PresenterShapeState>}
	 */
	stateGet() {
		return this._state;
	}

	/** @returns {Point} */
	postionGet() {
		return svgPositionGet(this._svgEl);
	}

	/** @param {PresenterShapeUpdateParam} param */
	update(param) {
		if (param.position) {
			svgPositionSet(this._svgEl, param.position);
		}

		if (param.rotate) {
			svgRotate(this._svgEl, param.rotate);
		}

		if (param.props) {
			SvgShape._attrsSet(this._svgEl, param.props);
		}

		if (param.state) {
			this._state = param.state;
			if (this._state.has('selected')) { this._svgEl.classList.add('selected'); } else { this._svgEl.classList.remove('selected'); }
			if (this._state.has('hovered')) { this._svgEl.classList.add('hover'); } else { this._svgEl.classList.remove('hover'); }
			if (this._state.has('disabled')) { this._svgEl.style.pointerEvents = 'none'; } else { this._svgEl.style.pointerEvents = 'auto'; }
		}
	}

	/**
	 * @param {Element} elem
	 * @param {PresenterFigureProps} props
	 * @private
	 */
	static _attrsSet(elem, props) {
		Object.keys(props).forEach(name => {
			const shape = (name === 'root')
				? elem
				: elem.querySelector(`[data-name='${name}'`);

			Object.keys(props[name]).forEach(attr => {
				switch (attr) {
					case 'textContent':
						shape.textContent = props[name][attr].toString();
						break;
					default:
						shape.setAttribute(attr, props[name][attr].toString());
						break;
				}
			});
		});
	}
}
