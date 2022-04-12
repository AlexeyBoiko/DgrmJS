interface ISvgPresenterElement extends IPresenterElement {
	get svgEl() : SVGGraphicsElement;
}

interface ISvgPresenterShape extends ISvgPresenterElement, IPresenterShape { 
	readOnly?: boolean;
	on(type: string, listener: EventListenerOrEventListenerObject): ISvgPresenterShape;
}

interface ISvgPresenterShapeFactoryParam { 
	svgCanvas: SVGGElement, 
	listener: EventListenerOrEventListenerObject, 
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IPresenterElement>,
	createParams: PresenterShapeAppendParam
}

interface ISvgPresenterShapeFactory {
	(param: ISvgPresenterShapeFactoryParam) : ISvgPresenterShape
}

interface ISvgPresenterShapeDecoratorFuctory {
	(shape: ISvgPresenterShape, param: ISvgPresenterShapeFactoryParam) : ISvgPresenterShape
}

interface ISvgPresenterShapeEventUpdateDetail {
	target: ISvgPresenterShape;
	props: PresenterShapeProps;
}