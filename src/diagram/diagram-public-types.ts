interface IDiagram {
	on(evtType: DiagramEventType, listener: EventListenerOrEventListenerObject): this;
	add(type: DiagramChildAddType, param: DiagramShapeAddParam | DiagramPathAddParam): IDiagramElement;
	del(element: IDiagramElement): void;
	shapeUpdate(shape: IDiagramShape, param: DiagramShapeUpdateParam): void;
	shapeSetMoving(shape: IDiagramShape, offsetPoint: Point): void;
	movedClean(): void;
}


//
// IDiagram.add/update params

type DiagramChildAddType = 'shape' | 'path';


// shape

type DiagramShapeState = 'selected' | 'disabled' | 'hovered' | 'connected';
type DiagramPathEndDirection = 'left' | 'right' | 'top' | 'bottom';

interface DiagramShapeUpdateParam {
	position?: Point;
	/** position inside canvas, 
	 * otherwise, the absolute coordinate disregarding the canvas offset
	 */
	postionIsIntoCanvas?: boolean;
	state?: Set<DiagramShapeState>;
	/**
	 * 'root' - key for outer element.
	 * Other keys for inner elements: key = value of the 'data-key' attribute.
	 */
	props?: DiagramShapeProps;

	connectors?: { [key: string]: { innerPosition?: Point; dir?: DiagramPathEndDirection; } };
}
interface DiagramShapeProps {
	[key: string]: { [key: string]: string | number | boolean }
}

interface DiagramShapeAddParam extends DiagramShapeUpdateParam {
	templateKey: string;
}


// path

interface DiagramConnectorEnd {
	shape: IDiagramShape;
	/** connector id into shape */
	key: string;
}
interface DiagramPathAddParam {
	start: DiagramConnectorEnd;
	end: DiagramConnectorEnd;
}


//
// ui elements

type DiagramElementType = 'shape' | 'path' | 'canvas' | 'connector';

interface IDiagramElement {
	type: DiagramElementType
}

/** type = 'shape'  */
interface IDiagramShape extends IDiagramElement {
	positionGet(): Point;
	connectedPaths?: Set<IDiagramPath>;
}

/** type = 'connector' */
interface IDiagramConnector extends IDiagramElement {
	shape: IDiagramShape;
	/** connector id into shape */
	key: string;
}

/** type = 'path' */
interface IDiagramPath extends IDiagramElement {
	start: IDiagramConnector;
	end: IDiagramConnector;
}


// event

type DiagramEventType = 'add' | 'select' | 'connect' | 'disconnect';

// TODO: remove IDiagramEventDetail replace with CustomEvent
interface IDiagramEventDetail<T extends IDiagramElement> {
	target: T;
}
