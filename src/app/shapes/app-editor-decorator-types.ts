type AppShapeEditorEventType = ShapeTextEditorEventType | 'del';
interface IAppShapeEditorDecorator extends IShapeTextEditorDecorator {
	on(evtType: AppShapeEditorEventType, listener: EventListenerOrEventListenerObject): IAppShapeEditorDecorator;
}

type AppPathEditorEventType = 'del';
interface IAppPathEditorDecorator extends IConnectorPath {
	on(evtType: AppPathEditorEventType, listener: EventListenerOrEventListenerObject): IAppPathEditorDecorator;
}