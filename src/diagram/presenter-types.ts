interface IPresenter {
	on(type: PresenterEventType, listener: EventListenerOrEventListenerObject): IPresenter;
	appendChild(query: PresenterElementAppendParam): IPresenterElement;
	querySelector(query: string): IPresenterElement;
}

type PresenterEventType = 'pointermove' | 'pointerdown' | 'pointerup' | 'pointerenter' | 'pointerleave';
interface PresenterEvent extends Event {
	type: PresenterEventType,
	targetElem: IPresenterElement,
	offsetX: number;
	offsetY: number;
}

type PresenterElementType = 'canvas' | 'shape' | 'connectorIn' | 'connectorInConnected' | 'connectorEnd';
interface IPresenterElement {
	type: PresenterElementType,
	shape?: IPresenterElement;

	postionGet():Point;

	appendChild(query: PresenterElementAppendParam): IPresenterElement;

	update(query: PresenterElementUpdateParam): void;
	select(): void;
	unSelect(): void;
	hide(): void;
	delete(): void;
}

interface IPresenterConnectorInElement extends IPresenterElement {
	innerPosition: Point;
	dir: PresenterPathEntDirection;
}

interface PresenterElementUpdateParam {
	position?: Point;
	rotateAngle?: number;
	/**
	 * 'root' - key for outer element.
	 * Other keys for inner elements: key = value of the 'data-name' attribute.
	 */
	props?: PresenterElementProps
}

interface PresenterElementAppendParam extends PresenterElementUpdateParam {
	type: PresenterElementType,
	templateKey: string;
}

interface PresenterElementProps {
	[key: string]: { [key: string]: string | number | boolean }
}

type PresenterPathEntType = 'start' | 'ent';
interface IPresenterPath {
	/**
	 * update path
	 * @param entType end or start of path that change position 
	 * @param position new position
	 * @param dir new direction
	 */
	update(entType: PresenterPathEntType, position: Point, dir: PresenterPathEntDirection): void;
}

type PresenterPathEntDirection = 'left' | 'right' | 'top' | 'bottom';

type Point = { x: number, y: number };