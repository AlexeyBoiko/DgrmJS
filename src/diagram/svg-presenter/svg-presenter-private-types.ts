interface ISvgPresenterElement extends IDiagramElement {
	get svgEl() : SVGGraphicsElement;
}


// shape

interface ISvgPresenterConnector extends IPresenterConnector, ISvgPresenterElement {
	shape: ISvgPresenterShape;
}

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

interface ISvgPresenterPath extends IPresenterPath, ISvgPresenterElement {
	get start(): ISvgPresenterConnector;
	get end(): ISvgPresenterConnector;
}

interface ISvgPresenterPathFactoryParam { 
	svgCanvas: SVGGElement,
	svgElemToPresenterObj: WeakMap<SVGGraphicsElement, IDiagramElement>,
	createParams: SvgPresenterPathAppendParam
}

interface SvgPresenterPathAppendParam extends PresenterPathAppendParam {
	startConnector?: ISvgPresenterConnector;
	endConnector?: ISvgPresenterConnector;
}

interface SvgPresenterPathUpdateParam extends PresenterPathUpdateParam {
	startConnector?: ISvgPresenterConnector;
	endConnector?: ISvgPresenterConnector;
}

interface ISvgPresenterShapeFactory {
	(type: DiagramChildAddType, param: ISvgPresenterShapeFactoryParam | ISvgPresenterPathFactoryParam) : ISvgPresenterShape | IPresenterPath
}
