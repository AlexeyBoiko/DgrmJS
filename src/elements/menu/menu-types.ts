type MenuEventType = 'shapeAddByKey'|'generateLink'|'settingsToggle';
interface IMenu extends HTMLElement {
	on(type:MenuEventType, listener:EventListenerOrEventListenerObject): this;
}