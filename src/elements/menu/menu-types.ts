type MenuEventType = 'tab' | 'shapeDragOut'|'shapeMove';
interface IMenu extends HTMLElement {
	on(type:MenuEventType, listener:EventListenerOrEventListenerObject): this;
}

interface IMenuShapeDragOutEventDetail {
	shape: string;
	clientX: number;
	clientY: number;
}

interface IMenuShapeMoveEventDetail {
	shape: string;
	clientX: number;
	clientY: number;
}
