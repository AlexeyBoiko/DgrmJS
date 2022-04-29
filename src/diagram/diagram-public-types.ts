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
	//update(param: PresenterShapeUpdateParam): void;
}

/** type = 'connector' */
interface IDiagramConnector extends IDiagramElement {
	/** unique id into shape */
	key: string;
	shape: IDiagramShape;
}


// event

type DiagramEventType = 'select' | 'connect' | 'disconnect';

interface IDiagramEventSelectDetail<T extends IDiagramShape & IDiagramConnector> {
	target: T;
}

interface IDiagramEventConnectDetail {
	start: IDiagramConnector;
	end: IDiagramConnector;
}


// method params

interface DiagramConnectorEnd {
	shape: IDiagramShape;
	/** connector id */
	connector: string;
}
interface DiagramShapeConnectParam {
	start: DiagramConnectorEnd;
	end: DiagramConnectorEnd;
}