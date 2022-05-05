interface ISvgPresenterElement extends IPresenterElement {
	get svgEl() : SVGGraphicsElement;
}

interface ISvgPresenterShape extends ISvgPresenterElement, IPresenterShape { 
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

interface ISvgPresenterShapeDecoratorFactory {
	(shape: ISvgPresenterShape, param: ISvgPresenterShapeFactoryParam) : ISvgPresenterShape
}

interface ISvgPresenterShapeEventUpdateDetail {
	target: ISvgPresenterShape;
	props: PresenterShapeProps;
}