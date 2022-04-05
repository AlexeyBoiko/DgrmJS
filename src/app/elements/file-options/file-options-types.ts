export type FileOptionsEventType = 'dgrmGenerateLink' | 'dgrmSave' | 'dgrmOpen' | 'dgrmNew';
export interface IFileOptions extends HTMLElement {
	on(type:FileOptionsEventType, listener:EventListenerOrEventListenerObject): this;
}