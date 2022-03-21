type MenuShapeEventType = 'tab' | 'shapeDragOut'|'shapeMove';
interface IMenuShape extends HTMLElement {
	on(type:MenuShapeEventType, listener:EventListenerOrEventListenerObject): this;
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
