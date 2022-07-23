// JSON

interface IAppDiagramSerializable {
	svg: SVGSVGElement;
	shapeAdd(param: DiagramShapeAddParam): IDiagramShape;
	set activeElement(elem: IDiagramElement);
	shapeUpdate(shape: IDiagramShape, param: DiagramShapeUpdateParam): void;
	clear(): void;

	dataGet(): AppSerializeData;
	dataSet(data:AppSerializeData): void;

	on(evtType: AppDiagramEventType, listener: EventListenerOrEventListenerObject): this;
}

type AppDiagramEventType = 'shapeAdd';
interface IAppDiagramDetail<T extends IDiagramShape> {
	target: T;
}

interface AppSerializeData {
	/** shapes */
	s: AppSerializeShape[],
	/** connector info */
	c?: AppSerializeConnector[]
}

interface AppSerializeShape {
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

