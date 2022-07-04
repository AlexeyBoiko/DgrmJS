interface IMenuShape extends HTMLElement {
	init(diagram: IAppDiagramSerializable):void;
}

interface IMenuShapeDragOutEventDetail {
	shape: string;
	clientX: number;
	clientY: number;
}

interface IMenuShapeMoveEventDetail {
	clientX: number;
	clientY: number;
}
