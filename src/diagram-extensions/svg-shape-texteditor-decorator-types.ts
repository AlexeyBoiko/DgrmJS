interface ShapeTextEditorDecoratorEventUpdateDetail {
	target: ISvgPresenterShape;
	props?: DiagramShapeProps;
}

type ShapeTextEditorEventType = 'txtUpd' | 'del';
interface IShapeTextEditorDecorator extends ISvgPresenterShape {
	on(evtType: ShapeTextEditorEventType, listener: EventListenerOrEventListenerObject): IShapeTextEditorDecorator;
}