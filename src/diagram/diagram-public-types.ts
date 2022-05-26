// TODO: replace 'Presenter'types with 'Diagram'types

interface IDiagram {
	on(evtType: DiagramEventType, listener: EventListenerOrEventListenerObject): this;
	shapeAdd(param: PresenterShapeAppendParam): IDiagramShape;
	shapeDel(shape: IDiagramShape): void;
	shapeConnect(param: DiagramShapeConnectParam): void;
	shapeSetMoving(shape: IDiagramShape, offsetPoint: Point): void;
	shapeUpdate(shape: IDiagramShape, param: PresenterShapeUpdateParam): void;
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

interface IDiagramEventSelectDetail<T extends IDiagramShape | IDiagramConnector> {
	target: T;
}

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