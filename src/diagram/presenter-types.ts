interface IPresenter {
	on(type: PresenterEventType, listener: EventListenerOrEventListenerObject): IPresenter;
	append(type: DiagramChildAddType, param: DiagramShapeAddParam | PresenterPathAppendParam): IPresenterShape | IPresenterPath;
	delete(elem: IDiagramElement): void;

	get scale(): number;
	scaleSet(scale: number, fixedPoint: Point): void;
}


//
// events

type PresenterEventType = 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerenter' | 'pointerleave' | 'canvasleave';
interface IPresenterEventDetail {
	/**	null for pointermove */
	target?: IDiagramElement;
	clientX?: number;
	clientY?: number;
}


//
// ui elements

// interface IPresenterElement extends IDisposable {
// 	type: DiagramElementType;
// }

interface IPresenterStatable extends IDiagramElement {
	stateHas(state: DiagramShapeState): boolean;
	stateGet(): Set<DiagramShapeState>;
	update(param: { state?: Set<DiagramShapeState> }): void;
}

interface IPresenterShape extends IDiagramShape, IPresenterStatable {

	/** can be used as connector end  */
	connectable?: boolean;
	defaultInConnector?: IPresenterConnector;

	/** should be readonly */
	connectors: Map<string, IPresenterConnector>;

	update(param: DiagramShapeUpdateParam): void;
	connectedPaths?: Set<IPresenterPath>;
}

type PresenterConnectorType = 'in' | 'out';
interface IPresenterConnector extends IDiagramElement, IPresenterStatable {
	connectorType: PresenterConnectorType;
	shape: IPresenterShape;
	/** unique id into shape */
	key: string;
	/** position into parent shape */
	innerPosition: Point;
	dir: DiagramPathEndDirection;
}

interface IPresenterPath extends IDiagramElement, IPresenterStatable {
	get start(): IPresenterConnector;
	get end(): IPresenterConnector;
	update(param: PresenterPathUpdateParam): void;
}

interface PresenterPathEnd {
	position?: Point,
	dir?: DiagramPathEndDirection
}

interface PresenterPathUpdateParam {
	start?: PresenterPathEnd;
	end?: PresenterPathEnd;
	startConnector?: IPresenterConnector;
	endConnector?: IPresenterConnector;
	state?: Set<DiagramShapeState>;
}

interface PresenterPathAppendParam extends PresenterPathUpdateParam {
	templateKey: string;
}