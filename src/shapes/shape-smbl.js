export const ShapeSmbl = Symbol('shape');

/** @typedef { {x:number, y:number} } Point */

/** @typedef { 'left' | 'right' | 'top' | 'bottom' } PathDir */
/** @typedef { {position: Point, dir: PathDir} } PathEnd */
/** @typedef { Object.<string, PathEnd> } ConnectorsData */

/** @typedef { {type: number, position: Point, styles?:string[]} } ShapeData */
/**
@typedef {{
	pathAdd(connectorKey:string, pathEl:PathElement): PathEnd
	pathDel(pathEl:PathElement): void
	drawPosition: ()=>void
	data: ShapeData
	del?: ()=>void
	draw?: ()=>void
}} Shape
 */
/** @typedef {SVGGraphicsElement & { [ShapeSmbl]?: Shape }} ShapeElement */

/** @typedef {import('./path-smbl').PathElement} PathElement */
