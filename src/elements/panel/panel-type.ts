type PanelEventType = MenuEventType | FileOptionsEventType;
interface IPanel extends HTMLElement {
	on(type:PanelEventType, listener:EventListenerOrEventListenerObject): this;
}