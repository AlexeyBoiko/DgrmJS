type ShapeSettingsEventType = 'shapeDel'|'shapeType';

interface IShapeSettings extends HTMLElement {
	update(params:ShapeSettingsUpdateParams):void;
	on(type:ShapeSettingsEventType, listener:EventListenerOrEventListenerObject): this;
}

interface ShapeSettingsUpdateParams {
	text?: string;
	disabled?: boolean;
	selected?: boolean;
}