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

interface ISvgPresenterPathFactoryParam { 
	svgCanvas: SVGGElement,
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IPresenterElement>,
	createParams: PresenterPathAppendParam
}

interface ISvgPresenterShapeFactory {
	(type: DiagramChildAddType, param: ISvgPresenterShapeFactoryParam | ISvgPresenterPathFactoryParam) : ISvgPresenterShape | IPresenterPath
}
