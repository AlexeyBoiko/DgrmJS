import { fileOpen, fileSave } from '../../../../diagram-extensions/infrastructure/file-utils.js';
import { uiDisable } from '../ui.js';
import { storeSave } from './store.js';

/** @implements {IFileOptions} */
export class FileOptions extends HTMLElement {
	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'closed' });
		shadow.innerHTML = `
			<style>
			.menu {
				position: fixed;
				top: 15px;
				left: 15px;
				cursor: pointer;
			}
			.options {
				position: fixed;
				padding: 15px;
				box-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%);
				border-radius: 16px;
				background-color: rgba(255,255,255, .9);

				top: 0px;
				left: 0px;

				z-index: 1;
			}

			.options div, .options a { 
				color: rgb(13, 110, 253); 
				cursor: pointer; margin: 10px 0;
				display: flex;
				align-items: center;
				line-height: 25px;
				text-decoration: none;
			}
			.options div svg, .options a svg { margin-right: 10px; }

			.load svg { animation: rot 1.2s linear infinite; }
			@keyframes rot {
				0% {
				  transform: rotate(0deg);
				}
				100% {
				  transform: rotate(360deg);
				}
			}
			</style>
			 <svg data-cmd="menu" class="menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg>
			 <div class="options" style="visibility: hidden;">
				<svg data-cmd="menu" class="menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg>
				<div data-cmd="new" style="padding-top:30px;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9 2.003V2h10.998C20.55 2 21 2.455 21 2.992v18.016a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 20.993V8l6-5.997zM5.83 8H9V4.83L5.83 8zM11 4v5a1 1 0 0 1-1 1H5v10h14V4h-8z" fill="rgba(52,71,103,1)"/></svg>New diagram</div>
				<div data-cmd="open"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 21a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2H20a1 1 0 0 1 1 1v3h-2V7h-7.414l-2-2H4v11.998L5.5 11h17l-2.31 9.243a1 1 0 0 1-.97.757H3zm16.938-8H7.062l-1.5 6h12.876l1.5-6z" fill="rgba(52,71,103,1)"/></svg>Open diagram image</div>
				<div data-cmd="save"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z" fill="rgba(52,71,103,1)"/></svg>Save diagram image</div>
				<div data-cmd="link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z" fill="rgba(52,71,103,1)"/></svg>Copy link to diagram</div>
				<a href="/donate.html" target="_blank">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0H24V24H0z"/><path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" fill="rgba(255,66,77,1)"/></svg>Donate
				</a>
		 	</div>`;
		shadow.querySelectorAll('[data-cmd]').forEach(el => el.addEventListener('click', this));

		/**
		 * @type {HTMLDivElement}
		 * @private
		 */
		this._options = shadow.querySelector('.options');
	}

	/**
	 * @param {IAppDiagramSerializable & IAppPngExportable} diagram
	 */
	init(diagram) {
		/** @private */
		this._diagram = diagram;

		this._diagram.svg.addEventListener('dragover', evt => { evt.preventDefault(); });
		this._diagram.svg.addEventListener('drop', async evt => {
			evt.preventDefault();

			if (evt.dataTransfer?.items?.length !== 1 ||
				evt.dataTransfer.items[0].kind !== 'file' ||
				evt.dataTransfer.items[0].type !== 'image/png') {
				this._cantOpen();
				return;
			}

			if (!await diagram.pngLoad(evt.dataTransfer.items[0].getAsFile())) {
				this._cantOpen();
			}
		});
	}

	/** @param {PointerEvent & { currentTarget: Element }} evt */
	async handleEvent(evt) {
		switch (evt.currentTarget.getAttribute('data-cmd')) {
			case 'new':
				this._diagram.clear();
				break;
			case 'open':
				fileOpen('.png', async png => {
					if (!await this._diagram.pngLoad(png)) { this._cantOpen(); }
				});
				break;
			case 'save':
				this._diagram.pngCreate(png => {
					if (!png) { alert('Diagram is empty'); return; }
					fileSave(png, 'dgrm.png');
				});
				break;
			case 'link': {
				const diagramData = this._diagram.dataGet();
				if (!diagramData) { alert('Diagram is empty'); return; }

				this._load(evt.currentTarget, true);
				const url = new URL(window.location.href);
				url.hash = await storeSave(diagramData); // encodeURIComponent(JSON.stringify(diagramData));
				await navigator.clipboard.writeText(url.toString());
				this._load(evt.currentTarget, true);
				alert('Link to diagram copied to clipboard');
				break;
			}
		}
		this._toggle();
	}

	/**
	 * @param {Element} elem
	 * @param {boolean} isLoad
	 */
	_load(elem, isLoad) {
		uiDisable(isLoad);
		if (isLoad) {
			elem.classList.add('load');
		} else {
			elem.classList.remove('load');
		}
	}

	/** @private */
	_toggle() {
		this._options.style.visibility = this._options.style.visibility === 'visible'
			? 'hidden'
			: 'visible';
	}

	/** @private */
	_cantOpen() {
		alert('File cannot be read. Use the exact image file you got from the application.');
	}
};
customElements.define('ap-file-options', FileOptions);
