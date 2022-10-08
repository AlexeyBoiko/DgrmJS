// JSON

interface IAppDiagramSerializable {
	svg: SVGSVGElement;

	/** Add shape and make it active (bind to pointer) */
 	shapeActiveAdd(param: DiagramShapeAddParam): void;

	clear(): void;

	dataGet(): AppSerializeData;
	dataSet(data:AppSerializeData): void;

	on(evtType: DiagramEventType, listener: EventListenerOrEventListenerObject): this;
}

interface IAppShape extends IDiagramShape {
	toJson(): IAppShapeData;
}

interface AppSerializeData {
	/** shapes */
	s: IAppShapeData[],
	/** connector info */
	c?: AppSerializeConnector[]
}

interface IAppShapeData {
	templateKey: string;
	detail: string;
	position: Point;
}

interface AppSerializeConnectorEnd {
	/** index in 'shapes' */
	i: number;
	/** connector */
	c: string;
}

interface AppSerializeConnector {
	/** start */
	s: AppSerializeConnectorEnd,
	/** end */
	e: AppSerializeConnectorEnd
}


// Png

interface IAppPngExportable {
	pngCreate(callback: BlobCallback): void;
	pngLoad(png: Blob): Promise<Boolean>;
}

