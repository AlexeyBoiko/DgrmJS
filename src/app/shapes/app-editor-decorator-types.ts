type AppShapeEditorEventType = ShapeTextEditorEventType | 'del';
interface IAppShapeEditorDecorator extends IShapeTextEditorDecorator {
	on(evtType: AppShapeEditorEventType, listener: EventListenerOrEventListenerObject): IAppShapeEditorDecorator;
}