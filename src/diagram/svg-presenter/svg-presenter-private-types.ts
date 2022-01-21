interface ISvgPresenterElement extends IPresenterElement {
	get svgEl() : SVGGraphicsElement
}

interface ISvgPresenterShape extends ISvgPresenterElement, IPresenterShape { }