interface IPresenter {
	on(type: PresenterEventType, listener: EventListenerOrEventListenerObject): IPresenter;
	querySelector<T extends IPresenterElement>(query: string): T;
	appendChild(type: PresenterChildAddType, param: PresenterShapeAppendParam | PresenterPathAppendParams): IPresenterElement;
	delete(elem:IPresenterElement): void;
}


//
// create/update ui elements params

type PresenterChildAddType = 'shape' | 'path';

interface PresenterShapeUpdateParam {
	position?: Point;
	/**
	 * 'root' - key for outer element.
	 * Other keys for inner elements: key = value of the 'data-name' attribute.
	 */
	props?: PresenterFigureProps
}
interface PresenterFigureProps {
	[key: string]: { [key: string]: string | number | boolean }
}

interface PresenterShapeAppendParam extends PresenterShapeUpdateParam {
	templateKey: string;
}

interface PresenterPathAppendParams {
	templateKey: string;
	start: PresenterPathEnd;
	end: PresenterPathEnd;
}


//
// events

type PresenterEventType = 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerenter' | 'pointerleave';
interface IPresenterEventDetail {
	/**	null for pointermove */
	target?: IPresenterElement;
	/**	null for pointerenter | pointerleave */
	offsetX?: number;
	/**	null for pointerenter | pointerleave */
	offsetY?: number;
}


//
// ui elements

type PresenterElementType = 'canvas' | 'shape' | 'connector' | 'path';

interface IPresenterElement {
	type: PresenterElementType
}

interface IPresenterShape extends IPresenterElement {

	/** can be used as connector end  */
	connectable?: boolean;
	defaultInConnector?: IPresenterConnector;

	postionGet():Point;
	update(param: PresenterShapeUpdateParam): void;

	select(flag: boolean): void;
}

type PresenterConnectorType = 'in' | 'out';
interface IPresenterConnector extends IPresenterElement {
	connectorType: PresenterConnectorType;
	shape: IPresenterShape;
	/** position into parent shape */
	innerPosition: Point;
	dir?: PresenterPathEndDirection;

	connectedSet(flag: boolean): void;
	connectedGet(): boolean;
}

type PresenterPathEndType = 'start' | 'end';
type PresenterPathEndDirection = 'left' | 'right' | 'top' | 'bottom';
interface PresenterPathEnd {
	position: Point, 
	dir?: PresenterPathEndDirection
}
interface IPresenterPath extends IPresenterElement {
	/**
	 * update path
	 * @param endType end or start of path that change position
	 * @param {PresenterPathEnd} param new position and direction
	 */
	update(endType: PresenterPathEndType, param: PresenterPathEnd): void;
}


//
// common

type Point = { x: number, y: number };