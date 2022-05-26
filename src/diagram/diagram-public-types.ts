// TODO: replace 'Presenter'types with 'Diagram'types

interface IDiagram {
	on(evtType: DiagramEventType, listener: EventListenerOrEventListenerObject): this;
	add(type: PresenterChildAddType, param: PresenterShapeAppendParam | DiagramShapeConnectParam): IDiagramElement;
	del(element: IDiagramElement): void;
	shapeUpdate(shape: IDiagramShape, param: PresenterShapeUpdateParam): void;
	shapeSetMoving(shape: IDiagramShape, offsetPoint: Point): void;
}


// ui elements

interface IDiagramElement {
	type: PresenterElementType
}

/** type = 'shape'  */
interface IDiagramShape extends IDiagramElement {
	positionGet(): Point;
}

/** type = 'connector' */
interface IDiagramConnector extends IDiagramElement {
	shape: IDiagramShape;
	/** connector id into shape */
	key: string;
}


// event

type DiagramEventType = 'add' | 'select' | 'connect' | 'disconnect';

// DiagramEventType = 'add' | 'select'
interface IDiagramEventSelectDetail<T extends IDiagramShape | IDiagramConnector> {
	target: T;
}

// DiagramEventType = 'connect' | 'disconnect'
interface IDiagramEventConnectDetail {
	start: IDiagramConnector;
	end: IDiagramConnector;
}


// method params

interface DiagramConnectorEnd {
	shape: IDiagramShape;
	/** connector id into shape */
	key: string;
}
interface DiagramShapeConnectParam {
	start: DiagramConnectorEnd;
	end: DiagramConnectorEnd;
}