type PanelEventType = ShapeSettingsEventType | MenuEventType;
interface IPanel extends HTMLElement {
	on(type:PanelEventType, listener:EventListenerOrEventListenerObject): this;
	shapeSettingsUpdate(params:ShapeSettingsUpdateParams):void;
}