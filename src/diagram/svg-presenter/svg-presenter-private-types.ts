interface ISvgPresenterElement extends IPresenterElement {
	get svgEl() : SVGGraphicsElement;
}

interface ISvgPresenterShape extends ISvgPresenterElement, IPresenterShape { 
}

interface ISvgPresenterShapeFactoryParam { 
	svgCanvas: SVGGElement,
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IPresenterElement>,
	createParams: PresenterShapeAppendParam
}

interface ISvgPresenterShapeFactory {
	(param: ISvgPresenterShapeFactoryParam) : ISvgPresenterShape
}
