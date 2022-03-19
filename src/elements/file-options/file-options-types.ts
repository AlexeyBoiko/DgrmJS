type FileOptionsEventType = 'dgrmGenerateLink' | 'dgrmSave' | 'dgrmOpen';
interface IFileOptions extends HTMLElement {
	on(type:FileOptionsEventType, listener:EventListenerOrEventListenerObject): this;
}