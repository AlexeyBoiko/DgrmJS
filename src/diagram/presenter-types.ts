interface IPresenter {
	on(type: PresenterEventType, listener: EventListenerOrEventListenerObject): IPresenter;
	append(type: DiagramChildAddType, param: DiagramShapeAddParam | PresenterPathAppendParam): IPresenterShape | IPresenterPath;
	delete(elem: IPresenterElement): void;
}


//
// create/update ui elements params

interface IPresenterStatable extends IDiagramElement {
	stateHas(state: DiagramShapeState): boolean;
	stateGet(): Set<DiagramShapeState>;
	update(param: { state: Set<DiagramShapeState> }): void;
}

interface PresenterPathUpdateParam {
	start?: PresenterPathEnd;
	end?: PresenterPathEnd;
}
interface PresenterPathAppendParam extends PresenterPathUpdateParam {
	templateKey: string;
}


//
// events

type PresenterEventType = 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerenter' | 'pointerleave';
interface IPresenterEventDetail {
	/**	null for pointermove */
	target?: IPresenterElement;
	clientX: number;
	clientY: number;
}


//
// ui elements

interface IPresenterElement extends IDisposable {
	type: DiagramElementType;
}

interface IPresenterShape extends IPresenterElement, IPresenterStatable {

	/** can be used as connector end  */
	connectable?: boolean;
	defaultInConnector?: IPresenterConnector;

	/** should be readonly */
	connectors: Map<string, IPresenterConnector>;

	positionGet(): Point;
	update(param: DiagramShapeUpdateParam): void;
}

type PresenterConnectorType = 'in' | 'out';
interface IPresenterConnector extends IPresenterElement, IPresenterStatable {
	connectorType: PresenterConnectorType;
	shape: IPresenterShape;
	/** unique id into shape */
	key: string;
	/** position into parent shape */
	innerPosition: Point;
	dir: DiagramPathEndDirection;
}

interface PresenterPathEnd {
	position: Point,
	dir?: DiagramPathEndDirection
}
interface IPresenterPath extends IPresenterElement {
	start?: IPresenterConnector;
	end?: IPresenterConnector;
	/**
	 * update path
	 * @param endType end or start of path that change position
	 * @param {PresenterPathEnd} param new position and direction
	 */
	update(param: PresenterPathUpdateParam): void;
}
