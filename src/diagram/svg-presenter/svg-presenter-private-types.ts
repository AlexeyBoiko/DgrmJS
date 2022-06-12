interface ISvgPresenterElement extends IPresenterElement {
	get svgEl() : SVGGraphicsElement;
}


// shape

interface ISvgPresenterShape extends ISvgPresenterElement, IPresenterShape { 
}

interface ISvgPresenterShapeFactoryParam { 
	svgCanvas: SVGGElement,
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IPresenterElement>,
	createParams: DiagramShapeAddParam
}

interface ISvgPresenterShapeFactory {
	(param: ISvgPresenterShapeFactoryParam) : ISvgPresenterShape
}
