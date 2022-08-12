type AppShapeEditorEventType = ShapeTextEditorEventType;
interface IAppShapeEditorDecorator extends IShapeTextEditorDecorator {
	on(evtType: AppShapeEditorEventType, listener: EventListenerOrEventListenerObject): IAppShapeEditorDecorator;
}
