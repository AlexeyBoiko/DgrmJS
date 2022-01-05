interface IPresenter extends IPresenterChildAdd {
	on(type: PresenterEventType, listener: EventListenerOrEventListenerObject): IPresenter;
	querySelector(query: string): IPresenterFigure;
}


//
// events

type PresenterEventType = 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerenter' | 'pointerleave';
interface PresenterEvent extends Event {
	type: PresenterEventType,
	targetElem: IPresenterFigure,
	offsetX: number;
	offsetY: number;
}


//
// ui elements

type PresenterElementType = 'canvas' | 'shape' | 'connectorIn' | 'connectorInConnected' | 'connectorEnd' | 'path';

interface IPresenterElement {
	type: PresenterElementType
}

interface IPresenterFigure extends IPresenterElement, IPresenterChildAdd {
	shape?: IPresenterFigure;

	postionGet():Point;

	update(param: PresenterFigureUpdateParam): void;
	select(): void;
	unSelect(): void;
	hide(): void;
	delete(): void;
}

type PresenterPathEndType = 'start' | 'end';
type PresenterPathEntDirection = 'left' | 'right' | 'top' | 'bottom';
interface IPresenterPath extends IPresenterElement {
	/**
	 * update path
	 * @param endType end or start of path that change position 
	 * @param position new position
	 * @param dir new direction
	 */
	update(endType: PresenterPathEndType, position: Point, dir: PresenterPathEntDirection): void;
}

interface IPresenterConnectorInElement extends IPresenterFigure {
	innerPosition: Point;
	dir: PresenterPathEntDirection;
}


//
// create/update ui elements params

interface IPresenterChildAdd {
	appendChild<T extends IPresenterElement>(type: PresenterElementType, param: PresenterFigureAppendParam | PresenterPathAppendParams): T;
}

interface PresenterFigureUpdateParam {
	position?: Point;
	rotateAngle?: number;
	/**
	 * 'root' - key for outer element.
	 * Other keys for inner elements: key = value of the 'data-name' attribute.
	 */
	props?: PresenterFigureProps
}
interface PresenterFigureProps {
	[key: string]: { [key: string]: string | number | boolean }
}

interface PresenterFigureAppendParam extends PresenterFigureUpdateParam {
	templateKey: string;
}

interface PresenterPathAppendParams {
	start: Point;
	end: Point;
}


//
// common

type Point = { x: number, y: number };