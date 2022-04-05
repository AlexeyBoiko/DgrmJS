export type MenuShapeEventType = 'tab' | 'shapeDragOut'|'shapeMove';
export interface IMenuShape extends HTMLElement {
	on(type:MenuShapeEventType, listener:EventListenerOrEventListenerObject): this;
}

export interface IMenuShapeDragOutEventDetail {
	shape: string;
	clientX: number;
	clientY: number;
}

export interface IMenuShapeMoveEventDetail {
	shape: string;
	clientX: number;
	clientY: number;
}
