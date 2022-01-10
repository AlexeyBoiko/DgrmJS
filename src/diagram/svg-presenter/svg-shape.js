import { svgPositionSet, svgPositionGet } from '../infrastructure/svg-utils';

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

		/** @type {PresenterElementType} */
		this.type = 'shape';
		this.connectable = connectable;
		this.defaultInConnector = defaultInConnector;
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

		if (param.props) {
			SvgShape._attrsSet(this._svgEl, param.props);
		}
	}

	/**
	 * @param {boolean} flag
	 */
	select(flag) {
		if (flag) {
			this._svgEl.classList.add('selected');
		} else {
			this._svgEl.classList.remove('selected');
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
