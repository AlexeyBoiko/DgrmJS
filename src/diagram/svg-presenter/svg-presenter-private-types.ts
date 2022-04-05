import { IPresenterElement, IPresenterShape, PresenterShapeAppendParam, PresenterShapeProps } from '../presenter-types';

export interface ISvgPresenterElement extends IPresenterElement {
	get svgEl(): SVGGraphicsElement;
}

export interface ISvgPresenterShape extends ISvgPresenterElement, IPresenterShape {
	on(type: string, listener: EventListenerOrEventListenerObject): ISvgPresenterShape;
}

export interface ISvgPresenterShapeFuctoryParam {
	svgCanvas: SVGGElement,
	listener: EventListenerOrEventListenerObject,
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IPresenterElement>,
	createParams: PresenterShapeAppendParam
}

export interface ISvgPresenterShapeFuctory {
	(param: ISvgPresenterShapeFuctoryParam): ISvgPresenterShape
}

export interface ISvgPresenterShapeDecoratorFuctory {
	(shape: ISvgPresenterShape, param: ISvgPresenterShapeFuctoryParam): ISvgPresenterShape
}

export interface ISvgPresenterShapeEventUpdateDetail {
	target: ISvgPresenterShape;
	props: PresenterShapeProps;
}