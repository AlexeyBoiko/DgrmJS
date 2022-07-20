interface ISvgPresenterElement extends IDiagramElement {
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
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IDiagramElement>,
	createParams: DiagramShapeAddParam
}


// path

interface ISvgPresenterPath extends IPresenterPath, ISvgPresenterElement {}

interface ISvgPresenterPathFactoryParam { 
	svgCanvas: SVGGElement,
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IDiagramElement>,
	createParams: PresenterPathAppendParam
}

interface ISvgPresenterShapeFactory {
	(type: DiagramChildAddType, param: ISvgPresenterShapeFactoryParam | ISvgPresenterPathFactoryParam) : ISvgPresenterShape | IPresenterPath
}
