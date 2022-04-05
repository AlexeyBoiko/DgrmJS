// TODO: replace 'Presenter'types with 'Diagram'types

import { Point, PresenterElementType, PresenterShapeAppendParam, PresenterShapeUpdateParam } from './presenter-types';

export interface IDiagram {
	on(evtType: DiagramEventType, listener: EventListenerOrEventListenerObject): this;
	shapeAdd(param: PresenterShapeAppendParam): IDiagramShape;
	shapeDel(shape: IDiagramShape): void;
	shapeConnect(param: DiagramShapeConnectParam): void;
	shapeSetMoving(shape: IDiagramShape, offsetPoint: Point): void;
}


// ui elements

export interface IDiagramElement {
	type: PresenterElementType
}

/** type = 'shape'  */
export interface IDiagramShape extends IDiagramElement {
	postionGet(): Point;
	update(param: PresenterShapeUpdateParam): void;
}

/** type = 'connector' */
export interface IDiagramConnector extends IDiagramElement {
	/** unique id into shape */
	key: string;
	shape: IDiagramShape;
}


// event

export type DiagramEventType = 'select' | 'connect' | 'disconnect';

export interface IDiagramEventSelectDetail<T extends IDiagramShape & IDiagramConnector> {
	target: T;
}

export interface IDiagramEventConnectDetail {
	start: IDiagramConnector;
	end: IDiagramConnector;
}


// method params

export interface DiagramConnectorEnd {
	shape: IDiagramShape;
	/** connector id */
	connector: string;
}
export interface DiagramShapeConnectParam {
	start: DiagramConnectorEnd;
	end: DiagramConnectorEnd;
}