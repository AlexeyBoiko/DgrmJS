type DiagramEventType = 'select' | 'move';

interface DiagramShapeUpdateParam extends PresenterFigureUpdateParam {
	shape?: IPresenterFigure;
	selector?: string;
}

interface DiagramShapeDelParam {
	shape?: IPresenterFigure;
	selector?: string;
}