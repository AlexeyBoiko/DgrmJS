type PanelEventType = 'shapeAddByKey' | 'generateLink';
interface IPanel extends HTMLElement {
	on(type:PanelEventType, listener:EventListenerOrEventListenerObject): this;
}