interface ISvgPresenterElement extends IPresenterElement {
	get svgEl() : SVGGraphicsElement;
}


// shape

interface ISvgPresenterConnector extends IPresenterConnector, ISvgPresenterElement { }

interface ISvgPresenterShape extends ISvgPresenterElement, IPresenterShape { 
	connectors: Map<string, ISvgPresenterConnector>;
	defaultInConnector?: ISvgPresenterConnector;
}

interface ISvgPresenterShapeFactoryParam { 
	svgCanvas: SVGGElement,
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IPresenterElement>,
	createParams: DiagramShapeAddParam
}


// path

interface ISvgPresenterPath extends IPresenterPath, ISvgPresenterElement {}

interface ISvgPresenterPathFactoryParam { 
	svgCanvas: SVGGElement,
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IPresenterElement>,
	createParams: PresenterPathAppendParam
}

interface ISvgPresenterShapeFactory {
	(type: DiagramChildAddType, param: ISvgPresenterShapeFactoryParam | ISvgPresenterPathFactoryParam) : ISvgPresenterShape | IPresenterPath
}
