interface ShapeTextEditorDecoratorEventUpdateDetail {
	target: ISvgPresenterShape;
	props?: PresenterShapeProps;
}

type ShapeTextEditorEventType = 'txtUpd' | 'del';
interface IShapeTextEditorDecorator extends ISvgPresenterShape {
	on(evtType: ShapeTextEditorEventType, listener: EventListenerOrEventListenerObject): IShapeTextEditorDecorator;
}