/** @implements {Menu} */
export class Menu extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML = `
			<style>
			.menu {
				overflow-x: auto;
				white-space: nowrap;
				/*left: 50%;
				transform: translate(-50%, 0);*/
				display: flex;
				padding: 0 5px;
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
			
				.menu a {
					display: none;
					line-height: 42px;
					padding: 10px;
					font-size:large;
				}
			
				.menu .big {
					width: 62px;
					min-width: 62px;
				}
			
				.menu svg:nth-of-type(2), .menu a:first-of-type {
					padding-left: 15px;
				}
			
				.menu .itm {
					padding-right: 15px;
					border-right: 1px solid rgb(204 207 210);
					fill: rgba(58, 65, 111, 0.5);
				}

				@media only screen and (max-width: 700px) {
					.menu a {
						display:unset;
					}
				
					.menu svg:last-of-type {
						padding-right: 15px;
						border-right: 1px solid rgb(204 207 210);
						fill: rgba(58, 65, 111, 0.5);
					}
				}
			</style>
			<div class="menu">
			<svg class="itm" data-cmd="generateLink" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
				<path
					d="M1536 768v128q76 0 145 17t123 56 84 99 32 148q0 66-25 124t-69 101-102 69-124 26h-512q-66 0-124-25t-101-69-69-102-26-124q0-87 31-147t85-99 122-56 146-18V768h-64q-93 0-174 35t-142 96-96 142-36 175q0 93 35 174t96 142 142 96 175 36h512q93 0 174-35t142-96 96-142 36-175q0-93-35-174t-96-142-142-96-175-36h-64zm-640 512v-128q76 0 145-17t123-56 84-99 32-148q0-66-25-124t-69-101-102-69-124-26H448q-66 0-124 25t-101 69-69 102-26 124q0 87 31 147t85 99 122 56 146 18v128h-64q-93 0-174-35t-142-96-96-142T0 832q0-93 35-174t96-142 142-96 175-36h512q93 0 174 35t142 96 96 142 36 175q0 93-35 174t-96 142-142 96-175 36h-64z">
				</path>
			</svg>
			<svg class="itm" data-cmd="settingsToggle" viewBox="0 0 612 612">
				<path
					d="M342.982,612h-73.975c-14.775,0-27.011-11.073-28.467-25.747l-7.584-45.446c-14.249-4.43-28.093-10.184-41.32-17.141
					l-38.064,27.183c-4.551,3.772-10.982,6.077-17.576,6.077c-7.646,0-14.825-2.982-20.236-8.393l-52.303-52.304
					c-10.446-10.446-11.255-26.93-1.901-38.357l26.778-37.508c-6.978-13.247-12.722-27.102-17.141-41.311l-46.114-7.695
					C11.083,370.014,0,357.777,0,342.982v-73.964c0-14.775,11.073-27.011,25.747-28.478l45.446-7.605
					c4.439-14.269,10.193-28.113,17.131-41.3l-27.173-38.064C52.191,142.7,53,126.217,63.457,115.78l52.313-52.323
					c10.083-10.062,27.345-10.901,38.327-1.921l37.559,26.789c13.177-6.947,27.021-12.691,41.3-17.131l7.675-46.104
					C241.997,11.073,254.243,0,269.018,0h73.974c14.755,0,26.991,11.063,28.478,25.727l7.595,45.467
					c14.259,4.439,28.103,10.184,41.29,17.131l38.074-27.183c4.541-3.762,10.973-6.058,17.565-6.058
					c7.646,0,14.825,2.973,20.226,8.373l52.303,52.323c10.437,10.406,11.275,26.879,1.941,38.317l-26.788,37.539
					c6.957,13.187,12.691,27.031,17.131,41.3l46.114,7.696C600.937,242.007,612,254.243,612,269.018v73.964
					c0,14.795-11.073,27.021-25.768,28.446l-45.426,7.595c-4.439,14.279-10.184,28.134-17.131,41.32l27.183,38.055
					c8.95,10.911,8.11,27.405-2.346,37.821l-52.293,52.293c-10.042,10.052-27.345,10.941-38.357,1.911l-37.508-26.769
					c-13.228,6.968-27.071,12.722-41.29,17.142l-7.706,46.124C369.983,600.927,357.747,612,342.982,612z M190.907,501.641
					c1.699,0,3.408,0.424,4.945,1.294c15.412,8.637,31.814,15.442,48.794,20.245c3.762,1.062,6.573,4.207,7.22,8.07l8.707,52.344
					c0.506,4.874,4.177,8.181,8.434,8.181h73.975c4.257,0,7.918-3.297,8.333-7.514l8.828-53.011c0.637-3.853,3.458-6.998,7.221-8.06
					c16.938-4.794,33.341-11.6,48.763-20.246c3.408-1.921,7.636-1.688,10.821,0.597l43.19,30.854c4.359,3.509,8.799,2.78,11.751-0.162
					l52.313-52.313c3.074-3.063,3.316-7.888,0.586-11.234l-31.268-43.718c-2.286-3.186-2.508-7.402-0.597-10.83
					c8.636-15.352,15.432-31.754,20.226-48.764c1.062-3.772,4.206-6.583,8.079-7.23l52.354-8.728c4.875-0.506,8.182-4.156,8.182-8.414
					v-73.964c0-4.257-3.297-7.928-7.514-8.343l-53.011-8.818c-3.873-0.647-7.009-3.458-8.08-7.23
					c-4.794-17.01-11.6-33.413-20.226-48.743c-1.911-3.429-1.688-7.646,0.597-10.831l30.874-43.211
					c3.125-3.863,2.872-8.677-0.182-11.731L481.91,77.797c-2.942-2.943-8.009-3.195-11.205-0.576l-43.747,31.278
					c-3.186,2.286-7.413,2.508-10.82,0.597c-15.361-8.626-31.765-15.432-48.764-20.246c-3.762-1.052-6.573-4.207-7.221-8.07
					l-8.717-52.343c-0.536-4.976-4.126-8.211-8.454-8.211h-73.975c-4.338,0-7.918,3.226-8.343,7.514l-8.798,53
					c-0.637,3.863-3.458,7.008-7.22,8.07c-17.03,4.824-33.433,11.62-48.753,20.246c-3.438,1.912-7.655,1.689-10.831-0.597
					l-43.232-30.874c-4.349-3.479-8.808-2.781-11.751,0.182L77.767,130.08c-3.054,3.054-3.287,7.868-0.556,11.195l31.258,43.758
					c2.286,3.195,2.508,7.412,0.597,10.831c-8.616,15.331-15.422,31.733-20.246,48.753c-1.052,3.762-4.207,6.574-8.07,7.221
					l-52.343,8.727c-4.956,0.526-8.181,4.116-8.181,8.455v73.964c0,4.328,3.216,7.908,7.493,8.322l53.021,8.818
					c3.863,0.638,7.008,3.459,8.07,7.23c4.783,16.919,11.589,33.332,20.246,48.784c1.912,3.418,1.689,7.625-0.597,10.811
					L77.605,470.14c-3.155,3.883-2.913,8.696,0.151,11.761l52.313,52.303c2.973,2.963,8.02,3.226,11.205,0.576l43.748-31.258
					C186.781,502.277,188.844,501.641,190.907,501.641z M306.01,427.049c-66.764,0-121.079-54.305-121.079-121.059
					c0-66.764,54.315-121.079,121.079-121.079c66.765,0,121.069,54.315,121.069,121.079
					C427.069,372.733,372.764,427.049,306.01,427.049z M306.01,205.136c-55.609,0-100.854,45.245-100.854,100.854
					c0,55.6,45.244,100.833,100.854,100.833c55.6,0,100.844-45.233,100.844-100.833C406.844,250.38,361.609,205.136,306.01,205.136z" />
			</svg>
			<svg data-shape="circle">
				<circle r="20" cx="21" cy="21"></circle>
			</svg>
			<svg data-shape="rect" class="big">
				<rect x="1" y="1" width="60" height="40" rx="15" ry="15"></rect>
			</svg>
			<svg data-shape="rhomb" class="big">
				<g transform="translate(1,1)">
					<path d="M0 20 L30 0 L60 20 L30 40 Z" stroke-width="2" stroke-linejoin="round"></path>
				</g>
			</svg>
			<svg data-shape="text">
				<text x="5" y="40" font-size="52px" fill="#344767" stroke-width="0">T</text>
			</svg>
			<a href="https://github.com/AlexeyBoiko/DgrmJS" target="_blank">GitHub</a>
			<a href="https://linkedin.com/in/alexey-boyko-tech" target="_blank">LinkedIn</a>
			<a href="https://alexey-boyko.medium.com/" target="_blank">Blog</a>
			<a href="https://boyko.tech/" target="_blank">boyko.tech</a>
		</div>`;

		shadow.querySelectorAll('[data-shape]').forEach(el => el.addEventListener('click',
			/** @param {PointerEvent & { currentTarget: Element }} evt */ evt => this._shapeClick(evt)));
		shadow.querySelectorAll('.itm').forEach(el => el.addEventListener('click',
			/** @param {PointerEvent & { currentTarget: Element }} evt */ evt => this._itmClick(evt)));
	};

	/**
	 * subscribe to event
	 * @param {string} evtType
	 * @param {EventListenerOrEventListenerObject} listener
	 */
	on(evtType, listener) {
		this.addEventListener(evtType, listener);
		return this;
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	_shapeClick(evt) {
		this._dispatchEvent('shapeAddByKey', evt.currentTarget.getAttribute('data-shape'));
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	_itmClick(evt) {
		this._dispatchEvent(evt.currentTarget.getAttribute('data-cmd'));
	}

	/**
	 * @param {string} type
	 */
	_dispatchEvent(type, detail) {
		this.dispatchEvent(new CustomEvent(type, {
			bubbles: true,
			composed: true,
			detail: detail
		}));
	}
}
customElements.define('ap-menu', Menu);
