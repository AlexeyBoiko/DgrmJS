# DgrmJS

DgrmJS is a JavaScript library for creating SVG diagrams.  
The main goal of the library is to set up workflows in BPM (Business Process Management) systems.

- Works on desktop and mobile
- Has no dependency
- Small size

<br />

[Demo state machine workflow editor](https://alexeyboiko.github.io/DgrmJS/ "Diagram builder demo")

<img src="https://raw.githubusercontent.com/AlexeyBoiko/DgrmJS/doc/img/dgrmjs-sample-workflow.png" alt="workflow" width="600"/>


## Main idea
- Allow developers to use standard SVG objects and features to declaratively create shapes that will be used in the diagram.  
To create shape, developers should add special data- attributes to standard SVG markup.
- DgrmJS dispatch events, like ‘shape is selected’ or ‘shape is connecting to another shape’.  
Developers can use these events to implement their own logic, for example, make a JSON description of the workflow.
## How to use
### Install
npm, cdn soon
### Simple shape
This is a circle shape:

<img src="https://raw.githubusercontent.com/AlexeyBoiko/DgrmJS/doc/img/dgrmjs-simple-shape-code.png" alt="Simple shape code" width="650"/>

diagram.shapeAdd method add to canvas shape:
- created by template with name ‘circle’
- to position at point 120, 120
- props set
  - ```<g>``` tag ```fill``` attribute to ```#344767```
  - ```textContent``` of the inner element with ```data-name="text"``` to "Title"

This way you can set any attribute of any shape object.

Result is a draggable circle with “Title” text:

<img src="https://raw.githubusercontent.com/AlexeyBoiko/DgrmJS/doc/img/dgrmjs-simple-shape-drag.gif" alt="draggable shape" width="500" />

### Add out connectors to shape
"Out connector" is an element from which you can draw out a connecting line.  
Add ```data-connect="out"``` to mark element as a out connector:

```html
<g data-templ="circle">
    <circle ... />
    <text data-name="text"></text>
 
    <!--
        out connector
        data-connect-point - point into shape where connector line starts
        data-connect-dir - direction of connector line
    -->
    <circle
        data-connect="out"
        data-connect-point="60,0"
        data-connect-dir="right" ...>
    </circle>
</g>
```
<img src="https://raw.githubusercontent.com/AlexeyBoiko/DgrmJS/doc/img/dgrmjs-out-connector.gif" alt="draggable shape" width="500" />

### Add in connectors to shape
"In connector" is an element where you can connect a connection line to a shape.
```html
<g data-templ="circle">
    <circle ... />
    <text data-name="text"></text>
 
    <!--
        out connector
        data-connect-point - point into shape where connector line starts
        data-connect-dir - direction of connector line
    -->
    <circle
        data-connect="out"
        data-connect-point="60,0"
        data-connect-dir="right" ...>
    </circle>
 
    <!--
        in connector
    -->
    <circle
        data-connect="in"
        data-connect-point="-60,0"
        data-connect-dir="left" ...>
    </circle>
</g>
```
<img src="https://raw.githubusercontent.com/AlexeyBoiko/DgrmJS/doc/img/dgrmjs-in-connector.gif" alt="draggable shape" width="500" />

### Events
In this example:
- we subscribe to the ```select``` event
- update title of the selected shape

```html
<svg id="diagram" style="touch-action: none;">
    <defs>
        <!-- shape template 'circle' -->
        <g data-templ="circle">
            <circle ... />
            <!-- inner named element,
                we can use 'data-name' value as a key
                in shapeAdd(...) method -->
            <text data-name="text"></text>
 
            <!-- connectors -->
            <circle data-connect="out" ...></circle>
            <circle data-connect="in" ...></circle>
        </g>
    </defs>
    <g data-name="canvas"></g>
</svg>
<script type="module">
    import { svgDiagramCreate } from './diagram/svg-presenter/svg-diagram-fuctory.js';
 
    const diagram = svgDiagramCreate(document.getElementById('diagram'))
        // subscribe to 'select' event
        .on('select', evt => {
 
            // update selected shape
            evt.detail.target.update({
                props: {
                    text: { textContent: 'New title' }
                }
            });
 
        });
 
    // add shape to canvas
    diagram.shapeAdd('shape', {
        templateKey: 'circle',
        position: { x: 120, y: 120 },
        props: {
            fill="#344767",
            text: { textContent: 'Title' }
        }
    });
</script>
```
<img src="https://github.com/AlexeyBoiko/DgrmJS/blob/doc/img/dgrmjs-update-on-select.gif" alt="draggable shape" width="500" />

## Documentation
Soon

## License
Not for commercial use. Contact me for details: [Alexey Boyko](https://github.com/AlexeyBoiko "Alexey Boyko").

