interface ISvgPresenterElement extends IPresenterElement {
	get svgEl() : SVGGraphicsElement;
}

interface ISvgPresenterShape extends ISvgPresenterElement, IPresenterShape { }

interface ISvgPresenterShapeFuctoryParam { 
	svgCanvas: SVGGElement, 
	listener: EventListenerOrEventListenerObject, 
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IPresenterElement>,
	createParams: PresenterShapeAppendParam
}

interface ISvgPresenterShapeFuctory {
	(param: ISvgPresenterShapeFuctoryParam) : ISvgPresenterShape
}

interface ISvgPresenterShapeDecoratorFuctory {
	(shape: ISvgPresenterShape, param: ISvgPresenterShapeFuctoryParam) : ISvgPresenterShape
}