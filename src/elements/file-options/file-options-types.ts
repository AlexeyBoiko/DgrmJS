type FileOptionsEventType = 'dgrmGenerateLink' | 'dgrmSave' | 'dgrmOpen' | 'dgrmNew';
interface IFileOptions extends HTMLElement {
	on(type:FileOptionsEventType, listener:EventListenerOrEventListenerObject): this;
}