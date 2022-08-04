!function(){"use strict";function t(t,e){if(!t)return null;let i;for(const s of t)e&&!e(s)||(i=s);return i}function e(t,e){for(const i of t)if(!e||e(i))return i;return null}function i(t,e){if(!t)return!1;for(const i of t)if(!e||e(i))return!0;return!1}function s(t,i,s){let n=e(t.transform.baseVal,(t=>t.type===i));return n||(n=(t.ownerSVGElement||s).createSVGTransform(),t.transform.baseVal.appendItem(n)),n}function n(t,e,i){s(t,SVGTransform.SVG_TRANSFORM_TRANSLATE,i).setTranslate(e.x,e.y)}function o(t){const e=s(t,SVGTransform.SVG_TRANSFORM_TRANSLATE).matrix;return{x:e.e,y:e.f}}function a(t,e,i){t.innerHTML=function(t,e,i){return t.split("\n").map(((t,s)=>`<tspan x="${e}" dy="${0===s?".4em":`${i}px`}" ${0===t.length?'visibility="hidden"':""}>${0===t.length?".":function(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}(t).replaceAll(" ","&nbsp;")}</tspan>`)).join("")}(e,t.x?.baseVal[0]?.value??0,i.lineHeight),null!=i.verticalMiddle&&(t.y.baseVal[0].value=i.verticalMiddle-t.getBBox().height/2)}function h(t,e){if(!t.stateHas(e)){const i=t.stateGet();t.update({state:i.add(e)})}}function r(t,e){if(t.stateHas(e)){const n=t.stateGet();t.update({state:(i=n,s=e,i.delete(s),i)})}var i,s}function c(t,e,i){t.has(i)?e.classList.add(i):e.classList.remove(i)}function l(t,e){return t.getElementsByTagName("defs")[0].querySelector(`[data-templ='${e}']`)}function d(t,e){const i=l(t.ownerSVGElement??t,e).cloneNode(!0);return t.append(i),i}class p{constructor({svgEl:t,type:e=null,connectable:i=null,defaultInConnector:s=null}){this.o=new Set,this.svgEl=t,this.type=e||"shape",this.connectable=i,this.defaultInConnector=s,this.connectors=new Map}stateHas(t){return this.o.has(t)}stateGet(){return new Set(this.o)}positionGet(){return o(this.svgEl)}update(t){if(t.position&&n(this.svgEl,t.position),t.props&&p.h(this.svgEl,t.props),t.connectors&&Object.keys(t.connectors).forEach((e=>{const i=t.connectors[e],s=this.connectors.get(e);i.innerPosition&&(s.innerPosition=i.innerPosition),i.dir&&(s.dir=i.dir)})),t.state){this.o=t.state;for(const t of["selected","hovered","disabled"])c(this.o,this.svgEl,t);this.connectors?.forEach((e=>{t.state.has("hovered")||r(e,"hovered")}))}}static h(t,e){Object.keys(e).forEach((i=>{const s="root"===i?t:t.querySelector(`[data-key='${i}'`);Object.keys(e[i]).forEach((t=>{if("textContent"===t)a(s,e[i][t]?.toString(),u(s));else s.setAttribute(t,e[i][t].toString())}))}))}}function u(t){return{lineHeight:parseInt(t.getAttribute("data-line-height")),verticalMiddle:t.hasAttribute("data-vertical-middle")?parseInt(t.getAttribute("data-vertical-middle")):null}}class f extends EventTarget{constructor(t,e){super(),this.p=e,this.u=t,this.u.addEventListener("pointermove",this),this.u.addEventListener("pointerdown",this),this.u.addEventListener("pointerup",this),this.u.addEventListener("pointerleave",this),this.v=new WeakMap,this.g=t.querySelector('[data-key="canvas"]'),this.canvas=new p({svgEl:this.g,type:"canvas"}),this.v.set(this.g,this.canvas)}append(t,e){return this.p(t,{svgCanvas:this.g,svgElemToPresenterObj:this.v,createParams:e})}delete(t){if(t.dispose&&t.dispose(),this.v.delete(t.svgEl),"shape"===t.type){for(const e of t.connectors)this.v.delete(e[1].svgEl);t.defaultInConnector&&this.v.delete(t.defaultInConnector.svgEl)}t.svgEl.remove()}on(t,e){return this.addEventListener(t,e),this}handleEvent(t){switch(t.type){case"pointermove":0===t.movementX&&0===t.movementY||(this.m(t),this.k(t,"pointermove",null));break;case"pointerdown":case"pointerup":this.k(t,t.type,f.C(t,!0));break;case"pointerleave":this.dispatchEvent(new CustomEvent("canvasleave"))}}m(t){const e=f.C(t,!1);e!==this.$&&(e&&this.k(t,"pointerenter",e),this.$=e)}static C(t,i){const s=document.elementsFromPoint(t.clientX,t.clientY);return i?e(s,(t=>t.hasAttribute("data-evt-z-index")&&!t.hasAttribute("data-evt-no-click")))??(s[0].hasAttribute("data-evt-no-click")?s[1]:s[0]):e(s,(t=>t.hasAttribute("data-evt-z-index")))??s[0]}k(t,e,i){let s=null;i&&(s=this.v.get(i===this.u||i.ownerSVGElement!==this.u?this.g:i),s||(s=this.v.get(i.closest("[data-connect]"))),s||(s=this.v.get(i.closest("[data-templ]")))),this.dispatchEvent(new CustomEvent(e,{detail:{target:s,clientX:t.clientX,clientY:t.clientY}}))}}class v{constructor(t){this.M=t}add(t,e){const i=this.M.append("path",{templateKey:"path",start:{position:v.H(t),dir:t.dir},end:{position:v.H(e),dir:e.dir?e.dir:v._(t.dir)},startConnector:t,endConnector:e});return h(e,"connected"),v.L(t.shape,i),v.L(e.shape,i),i}replaceEnd(t,e){const s=t.end;t.update({end:{position:v.H(e),dir:e.dir?e.dir:t.end.dir},endConnector:e}),s.shape!==e.shape&&(t.start.shape!==s.shape&&s.shape.connectedPaths.delete(t),v.L(e.shape,t)),i(s.shape.connectedPaths,(t=>t.start===s||t.end===s))||r(s,"connected"),h(e,"connected")}updatePosition(t){if(!i(t.connectedPaths))return;const e=t.positionGet();for(const i of t.connectedPaths)i.update({start:i.start.shape===t?{position:{x:e.x+i.start.innerPosition.x,y:e.y+i.start.innerPosition.y}}:null,end:i.end.shape===t?{position:{x:e.x+i.end.innerPosition.x,y:e.y+i.end.innerPosition.y}}:null})}del(t){switch(t.type){case"shape":this.V(t);break;case"path":this.S(t)}}S(t){t.end.shape.connectedPaths.delete(t),i(t.end.shape.connectedPaths,(e=>e.end===t.end))||r(t.end,"connected"),t.start.shape.connectedPaths.delete(t),t.end.shape.connectable&&this.M.delete(t.end.shape),this.M.delete(t)}V(t){if(this.M.delete(t),i(t.connectedPaths))for(const e of t.connectedPaths)this.S(e)}static L(t,e){t.connectedPaths||(t.connectedPaths=new Set),t.connectedPaths.add(e)}static H(t){const e=t.shape.positionGet();return{x:e.x+t.innerPosition.x,y:e.y+t.innerPosition.y}}static _(t){switch(t){case"bottom":return"top";case"top":return"bottom";case"left":return"right";case"right":return"left"}}}class g extends EventTarget{constructor(t,e,i){super(),this.M=t.on("pointermove",this).on("pointerdown",this).on("pointerup",this).on("pointerenter",this).on("canvasleave",this),this.T=e,this.P=i(this)}on(t,e){return this.addEventListener(t,e),this}add(t,e){let i;switch(t){case"shape":i=this.M.append("shape",e);break;case"path":i=this.T.add(m(e.start),m(e.end))}return this.dispatch("add",i),i}shapeUpdate(t,e){t.update(e),(e.position||e.connectors)&&this.T.updatePosition(t)}del(t){this.selected=null,this.T.del(t)}handleEvent(t){switch(t.type){case"pointermove":case"canvasleave":this.D&&this.O(this.D,t);break;case"pointerdown":this.D=t.detail.target,this.O(this.D,t);break;case"pointerup":this.D&&this.O(this.D,t),this.D=null;break;case"pointerenter":this.D&&(this.U&&this.O(this.D,{type:"pointerleave",detail:{target:this.U,enterTo:t.detail.target}}),this.O(this.D,t)),this.U=t.detail.target}}O(t,e){this.P.get(t.type).process(t,e)}set activeElement(t){this.D=t}set selected(t){t!==this.A&&(this.A&&this.O(this.A,{type:"unselect"}),this.A=t,t&&(this.dispatch("select",t),h(t,"selected")))}get selected(){return this.A}dispatch(t,e){return this.dispatchEvent(new CustomEvent(t,{cancelable:!0,detail:{target:e}}))}}function m(t){return t.type?t:t.shape.connectors.get(t.key)}class w{constructor({svgEl:t,connectorType:e,shape:i,key:s,innerPosition:n,dir:o}){this.svgEl=t,this.o=new Set,this.type="connector",this.connectorType=e,this.shape=i,this.key=s,this.innerPosition=n,this.dir=o}stateHas(t){return this.o.has(t)}stateGet(){return new Set(this.o)}update(t){this.o=t.state;for(const t of["connected","hovered","selected"])c(this.o,this.svgEl,t);t.state.has("hovered")&&h(this.shape,"hovered")}}function x(t,e){return new w({svgEl:t,connectorType:"in"===t.getAttribute("data-connect")?"in":"out",shape:e,key:t.getAttribute("data-key"),innerPosition:y(t),dir:t.getAttribute("data-connect-dir")})}function y(t){if(!t.getAttribute("data-connect-point"))return null;const e=t.getAttribute("data-connect-point").split(",");return{x:parseFloat(e[0]),y:parseFloat(e[1])}}class b{constructor({svgEl:t,start:e,end:i,startConnector:s,endConnector:n}){this.type="path",this.svgEl=t,this.j=t.querySelector('[data-key="path"]'),this.G=t.querySelector('[data-key="outer"]'),this.A=t.querySelector('[data-key="selected"]'),this.B=t.querySelector('[data-key="arrow"]'),this.o=new Set,this.R={},this.I={},this.update({start:e,end:i,startConnector:s,endConnector:n})}stateHas(t){return this.o.has(t)}stateGet(){return new Set(this.o)}update(t){if(t.start&&Object.assign(this.R,t.start),t.end&&(Object.assign(this.I,t.end),this.F()),(t.start||t.end)&&this.K(),t.endConnector&&this.end!==t.endConnector&&(this.end&&r(this.end,"selected"),this.end=t.endConnector,this.svgEl.parentNode.appendChild(this.svgEl)),t.startConnector&&(this.start=t.startConnector),t.state){this.o=t.state;for(const e of["selected","disabled"])c(this.o,this.svgEl,e),t.state.has(e)?h(this.end.shape.connectable?this.end.shape:this.end,e):r(this.end.shape.connectable?this.end.shape:this.end,e)}}K(){const t=b.X(70,this.R,this.I);this.j.setAttribute("d",t),this.G.setAttribute("d",t),this.A.setAttribute("d",t)}F(){n(this.B,this.I.position),function(t,e,i){s(t,SVGTransform.SVG_TRANSFORM_ROTATE,i).setRotate(e,0,0)}(this.B,"right"===this.I.dir?180:"left"===this.I.dir?0:"bottom"===this.I.dir?270:90)}dispose(){this.j=null,this.G=null,this.A=null,this.B=null}static X(t,e,i){return`M ${e.position.x} ${e.position.y} C ${b.N(e.dir,e.position.x,t)} ${b.J(e.dir,e.position.y,t)}, ${b.N(i.dir,i.position.x,t)} ${b.J(i.dir,i.position.y,t)}, ${i.position.x} ${i.position.y}`}static N(t,e,i){return"right"===t||"left"===t?"right"===t?e+i:e-i:e}static J(t,e,i){return"right"===t||"left"===t?e:"bottom"===t?e+i:e-i}}class k{constructor(t){this.svgElement=t,this.type=t.type,this.svgEl=this.svgElement.svgEl,this.svgElement.svgEl.addEventListener("pointerdown",this),this.svgElement.svgEl.addEventListener("pointerup",this),this.svgElement.svgEl.addEventListener("click",this)}update(t){t.state&&this.Y&&(this.Y=!1,this.onEditLeave()),t.state&&(this.Z=!1),this.svgElement.update(t)}dispose(){this.Y&&this.onEditLeave(),this.svgElement.dispose&&this.svgElement.dispose()}handleEvent(t){if(!t.target.hasAttribute("data-evt-no-click")&&document.elementFromPoint(t.clientX,t.clientY)===t.target)if("click"!==t.type){if(!this.Y)switch(t.type){case"pointerdown":this.Z=this.svgElement.stateGet().has("selected");break;case"pointerup":this.Z&&(this.Y=!0,this.onEdit(t))}}else this.onClick(t,this.Y)}onEdit(t){}onEditLeave(){}onClick(t,e){}}class E extends k{constructor(t){super(t),this.connectable=this.svgElement.connectable,this.defaultInConnector=this.svgElement.defaultInConnector,this.connectors=this.svgElement.connectors}stateHas(t){return this.svgElement.stateHas(t)}stateGet(){return this.svgElement.stateGet()}positionGet(){return this.svgElement.positionGet()}update(t){t.state&&this.Y&&(this.Y=!1,this.onEditLeave()),super.update(t)}}function C(t,e,i,s,n){const o=t.getBBox(),a=o.width+20;e.width.baseVal.value=a+2*s+2,e.x.baseVal.value=o.x-s-("center"===n?10:0),e.height.baseVal.value=o.height+2*s+3,e.y.baseVal.value=o.y-s,i.style.width=`${a}px`,i.style.height=`${o.height}px`}function z(t,e,i,s,n){let o;switch(i.tagName){case"tspan":o=t.querySelector(`[data-text-for=${i.parentElement.getAttribute("data-key")}]`);break;case"text":o=t.querySelector(`[data-text-for=${i.getAttribute("data-key")}]`);break;default:i.getAttribute("data-text-for")&&(o=i)}if(!o)return;o.classList.remove("empty");const h=o.getAttribute("data-text-for"),r=t.querySelector(`[data-key=${h}]`);return function(t,e,i,s,n){const o=document.createElementNS("http://www.w3.org/2000/svg","foreignObject"),h=document.createElement("textarea");h.style.caretColor=t.getAttribute("fill"),h.value=i,h.oninput=function(){a(t,h.value,e),C(t,o,h,c,r.textAlign),s(h.value)},h.onblur=function(){n(h.value)},h.onpointerdown=function(t){t.stopImmediatePropagation()},o.appendChild(h),t.parentElement.appendChild(o);const r=getComputedStyle(h),c=parseInt(r.padding)+parseInt(r.borderWidth);return C(t,o,h,c,r.textAlign),h.focus(),o}(r,u(r),e[h]?.textContent.toString(),(t=>{s(r,{[h]:{textContent:t}})}),(t=>{t?o.classList.remove("empty"):o.classList.add("empty"),n()}))}class $ extends E{constructor(t,e){super(t),this.q=Object.assign({},e)}on(t,e){return this.W||(this.W=[]),this.W.push({t:t,l:e}),this.svgEl.addEventListener(t,e),this}dispose(){this.W?.forEach((t=>this.svgElement.svgEl.removeEventListener(t.t,t.l))),super.dispose()}update(t){var e,i;t.props&&Object.assign(this.q,t.props),t.state&&t.state.has("selected")&&!this.stateGet().has("selected")&&(e=this.svgEl,i=this.q,e.querySelectorAll("[data-text-for]").forEach((t=>{i[t.getAttribute("data-text-for")]?.textContent||t.classList.add("empty")}))),super.update(t)}onClick(t,e){e&&this.tt(t)}onEditLeave(){this.et()}tt(t){this.it||(this.it=z(this.svgEl,this.q,t.target,((t,e)=>{Object.assign(this.q,e),this.onTextChange(t,e)}),(t=>{this.et()})))}onTextChange(t,e){this.svgEl.dispatchEvent(new CustomEvent("txtUpd",{detail:{target:this,props:e}}))}et(){this.it&&!this.st&&(this.st=!0,this.it.remove(),this.it=null,this.st=!1)}}class M extends ${onEdit(t){this.svgEl.classList.add("edit"),this.nt()}onEditLeave(){super.onEditLeave(),this.svgEl.classList.remove("edit"),this.ot()}nt(){this.ht=_(),this.ht.onclick=t=>{this.ot(),this.svgEl.dispatchEvent(new CustomEvent("del",{detail:{target:this}}))},this.panelUpdPos(),document.body.append(this.ht)}panelUpdPos(){if(!this.ht)return;const t=this.svgEl.getBoundingClientRect();this.ht.style.top=window.scrollY+t.top-35+"px",this.ht.style.left=`${t.left+10}px`}ot(){this.ht&&(this.ht.remove(),this.ht=null)}}class H extends k{get end(){return this.svgElement.end}get start(){return this.svgElement.start}stateHas(t){return this.svgElement.stateHas(t)}stateGet(){return this.svgElement.stateGet()}on(t,e){return this.W||(this.W=[]),this.W.push({t:t,l:e}),this.svgElement.svgEl.addEventListener(t,e),this}dispose(){this.W?.forEach((t=>this.svgElement.svgEl.removeEventListener(t.t,t.l))),super.dispose()}onEdit(t){this.ht=_(),this.ht.style.top=t.clientY-55+"px",this.ht.style.left=t.clientX-20+"px",this.ht.onclick=t=>{this.ot(),this.svgEl.dispatchEvent(new CustomEvent("del",{detail:{target:this}}))},document.body.append(this.ht)}onEditLeave(){this.ot()}ot(){this.ht&&(this.ht.remove(),this.ht=null)}}function _(){const t=document.createElement("div");return t.style.cssText="position: fixed; padding: 10px;\tbox-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);",t.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>',t}function L(t,e=0){const i=t.x-e,s=t.x+t.width+e,n=t.y-e,o=t.y+t.height+e;return[{x:i,y:n},{x:s,y:n},{x:i,y:o},{x:s,y:o}]}function V(t,e,i){return i<=t?t:t+Math.ceil((i-t)/e)*e}class S extends M{constructor(t,e,i){super(e,i),this.rt=t,this.ct=60}update(t){super.update(t),void 0!==t.props?.text?.textContent&&this.lt(this.svgEl.querySelector('[data-key="text"]'))}onTextChange(t,e){super.onTextChange(t,e),this.lt(t)}lt(t){let e=0;for(const i of t.getElementsByTagName("tspan"))for(const t of L(i.getBBox())){const i=t.x**2+t.y**2;i>e&&(e=i)}const i=V(60,20,Math.sqrt(e));i!==this.ct&&(this.ct=i,this.dt(i),this.panelUpdPos())}dt(t){const e=-1*t,i={right:{cx:t},left:{cx:e},bottom:{cy:t},top:{cy:e}},s={right:{innerPosition:{x:t,y:0}},left:{innerPosition:{x:e,y:0}},bottom:{innerPosition:{x:0,y:t}},top:{innerPosition:{x:0,y:e}}};this.rt.shapeUpdate(this,{props:{main:{r:t},outer:{r:t+20},outright:i.right,outleft:i.left,outbottom:i.bottom,outtop:i.top,inright:i.right,inleft:i.left,inbottom:i.bottom,intop:i.top},connectors:{outright:s.right,outleft:s.left,outbottom:s.bottom,outtop:s.top,inright:s.right,inleft:s.left,inbottom:s.bottom,intop:s.top}})}}class T extends M{constructor(t,e,i){super(e,i),this.rt=t,this.ut=150,this.ft=150,this.vt=50,this.gt=50}update(t){super.update(t),void 0!==t.props?.text?.textContent&&this.lt(this.svgEl.querySelector('[data-key="text"]'))}onTextChange(t,e){super.onTextChange(t,e),this.lt(t)}lt(t){let e=0;for(const i of t.getElementsByTagName("tspan")){const t=i.getBBox().width+4;t>e&&(e=t)}const i=V(this.ft,40,e),s=V(this.gt,20,t.getBBox().height+4);i===this.ut&&s===this.vt||(this.ut=i,this.vt=s,this.dt(i,s),this.panelUpdPos())}dt(t,e){const i=P(this.ft,this.gt,t,e),s={r:{cx:t+i.x,cy:e/2+i.y},l:{cx:i.x,cy:e/2+i.y},b:{cx:t/2+i.x,cy:e+i.y},t:{cx:t/2+i.x,cy:i.y}},n={right:{innerPosition:{x:s.r.cx,y:s.r.cy}},left:{innerPosition:{x:s.l.cx,y:s.l.cy}},bottom:{innerPosition:{x:s.b.cx,y:s.b.cy}},top:{innerPosition:{x:s.t.cx,y:s.t.cy}}};this.rt.shapeUpdate(this,{props:{main:i,outer:P(this.ft,this.gt,t+40,e+40),outright:s.r,outleft:s.l,outbottom:s.b,outtop:s.t,inright:s.r,inleft:s.l,inbottom:s.b,intop:s.t},connectors:{outright:n.right,outleft:n.left,outbottom:n.bottom,outtop:n.top,inright:n.right,inleft:n.left,inbottom:n.bottom,intop:n.top}})}}function P(t,e,i,s){return{y:(e-s)/2,x:(t-i)/2,width:i,height:s}}function D(t,e,i){const s=t.ownerSVGElement.createSVGPoint();return s.x=e,s.y=i,t.isPointInFill(s)||t.isPointInStroke(s)}class O extends M{constructor(t,e,i){super(e,i),this.rt=t,this.wt=120}update(t){super.update(t),void 0!==t.props?.text?.textContent&&this.lt(this.svgEl.querySelector('[data-key="text"]'))}onTextChange(t,e){super.onTextChange(t,e),this.lt(t)}lt(t){this.xt||(this.xt=function(t,e){const i=t.querySelector(`[data-key="${e}"]`),s=i.cloneNode(!1);return s.style.fill="transparent",s.style.stroke="transparent",s.removeAttribute("data-key"),t.insertBefore(s,i),s}(this.svgEl,"main"));const e=function(t,e,i,s){let n=i;if(s(n)){do{n+=e}while(s(n));return n}if(t===n)return null;do{n-=e}while(t<=n&&!s(n));return n+=e,i!==n?n:null}(120,40,this.wt,(e=>(this.xt.setAttribute("d",A(120,70,e)),function(t,e,s=0){return i(t.getElementsByTagName("tspan"),(t=>{const i=t.getBBox(),n=i.x-s,o=i.x+i.width+s,a=i.y-s,h=i.y+i.height+s;return!(D(e,n,a)&&D(e,o,a)&&D(e,n,h)&&D(e,o,h))}))}(t,this.xt))));e&&(this.wt=e,this.dt(e),this.panelUpdPos())}dt(t){const e={d:A(120,70,t)},i=U(120,70,t+16),s={left:{cx:i.l.x},right:{cx:i.r.x},top:{cy:i.t.y},bottom:{cy:i.b.y}},n={left:{innerPosition:i.l},right:{innerPosition:i.r},top:{innerPosition:i.t},bottom:{innerPosition:i.b}};this.rt.shapeUpdate(this,{props:{main:e,outer:{d:A(120,70,t+80)},border:e,outleft:s.left,outright:s.right,outtop:s.top,outbottom:s.bottom,inleft:s.left,inright:s.right,intop:s.top,inbottom:s.bottom},connectors:{outleft:n.left,outright:n.right,outtop:n.top,outbottom:n.bottom,inleft:n.left,inright:n.right,intop:n.top,inbottom:n.bottom}})}onEditLeave(){super.onEditLeave(),this.xt&&(this.xt.remove(),this.xt=null)}}function U(t,e,i){const s=(i-t)/2,n=-1*s;return{l:{x:n,y:e/2},t:{x:t/2,y:n},r:{x:t+s,y:e/2},b:{x:t/2,y:e+s}}}function A(t,e,i){const s=U(t,e,i);return`M${s.l.x} ${s.l.y} L${s.t.x} ${s.t.y} L${s.r.x} ${s.r.y} L${s.b.x} ${s.b.y} Z`}class j{constructor(t,e){this.rt=t,this.T=e}process(t,i){switch(i.type){case"pointermove":!function(t,e,i){if(!e[G]){t.selected=null,B(e,!0);const s=e.positionGet();e[G]={x:s.x-i.detail.clientX,y:s.y-i.detail.clientY}}t.shapeUpdate(e,{position:{x:e[G].x+i.detail.clientX,y:e[G].y+i.detail.clientY}})}(this.rt,t,i);break;case"pointerup":if(!t[G])return void(this.rt.selected=R(t));if(t.connectable&&"in"===i.detail.target.connectorType){const s=e(t.connectedPaths);if(!this.rt.dispatch("connect",s))return;this.T.replaceEnd(s,i.detail.target),this.rt.del(t),r(s,"disabled"),t=null}this.yt(t);break;case"unselect":r(R(t),"selected");break;case"canvasleave":this.yt(t);break;case"pointerenter":t.connectable&&["connector","shape"].includes(i.detail.target.type)&&(h(i.detail.target,"hovered"),this.bt("shape"===i.detail.target.type?i.detail.target:i.detail.target.shape));break;case"pointerleave":if(!t.connectable)return;switch(i.detail.target.type){case"shape":i.detail.enterTo?.shape!==i.detail.target&&this.bt(null);break;case"connector":i.detail.target?.shape!==i.detail.enterTo?this.bt(null):r(i.detail.target,"hovered")}}}yt(t){t&&function(t){B(t,!1),delete t[G]}(t),this.bt(null),this.rt.activeElement=null}bt(t){this.U&&this.U!==t&&r(this.U,"hovered"),this.U=t}}const G=Symbol(0);function B(t,e){!function(t,e,i){(i?h:r)(t,e)}(R(t),"disabled",e)}function R(t){return t.connectable?e(t.connectedPaths):t}class I{constructor(t,e){this.rt=t,this.T=e}process(e,i){switch(i.type){case"pointermove":switch(e.connectorType){case"out":{const t=this.rt.add("shape",F(e));this.rt.add("path",{start:e,end:t.defaultInConnector}),this.rt.activeElement=t;break}case"in":{const i="path"===this.rt.selected?.type&&this.rt.selected.end===e?this.rt.selected:t(e.shape.connectedPaths,(t=>t.end===e));if(!this.rt.dispatch("disconnect",i))return;const s=this.rt.add("shape",F(e));this.T.replaceEnd(i,s.defaultInConnector),this.rt.activeElement=s}}break;case"pointerup":if("in"!==e.connectorType)return;this.rt.selected=t(e.shape.connectedPaths,(t=>t.end===e))}}}function F(t){const e=t.shape.positionGet(),i=t.innerPosition;return{templateKey:"connect-end",position:{x:e.x+i.x,y:e.y+i.y},postionIsIntoCanvas:!0}}class K{constructor(t){this.rt=t}process(t,e){switch(e.type){case"pointerup":this.rt.selected=t;break;case"unselect":r(t,"selected")}}}async function X(t,e,i){return function(t,e,i){let s,n;const o=N(t,e);if(o)s=new DataView(t,0,o.byteOffset-8),n=new DataView(t,o.byteOffset+o.byteLength+4);else{const e=t.byteLength-12;s=new DataView(t,0,e),n=new DataView(t,e)}const a=new DataView(new ArrayBuffer(8));return a.setUint32(0,i.length),a.setUint32(4,e),new Blob([s,a,i,new Uint32Array([0]),n],{type:"image/png"})}(await t.arrayBuffer(),J(e),i)}function N(t,e){const i=new DataView(t,8);let s,n=0,o=i.getUint32(4);for(;1229278788!==o;){if(s=i.getUint32(n),o===e)return new DataView(t,n+16,s);n=n+12+s,o=i.getUint32(n+4)}return null}function J(t){return new DataView((new TextEncoder).encode(t).buffer).getUint32(0)}function Y(t,e,i){const s=t.cloneNode(!0);s.querySelectorAll(".selected").forEach((t=>t.classList.remove("selected")));const a=function(t,e){let i;for(const s of t.querySelectorAll(e)){i||(i={top:1/0,left:1/0,bottom:-1/0,right:-1/0});const t=s.getBoundingClientRect();t.top<i.top&&(i.top=t.top),t.left<i.left&&(i.left=t.left),t.right>i.right&&(i.right=t.right),t.bottom>i.bottom&&(i.bottom=t.bottom)}return i?{x:i.left,y:i.top,height:i.bottom-i.top,width:i.right-i.left}:null}(t,'[data-key="canvas"]'),h=s.querySelector('[data-key="canvas"]'),r=o(h);n(h,{x:-1*a.x+r.x+15,y:-1*a.y+r.y+15}),function(t,e,i,s){const n=new Image;n.width=e.width*i*window.devicePixelRatio,n.height=e.height*i*window.devicePixelRatio,n.onload=function(){const t=document.createElement("canvas");t.width=n.width,t.height=n.height,t.style.width=`${n.width}px`,t.style.height=`${n.height}px`;const i=t.getContext("2d");i.imageSmoothingEnabled=!1,i.drawImage(n,e.x,e.y,e.width,e.height,0,0,n.width,n.height),URL.revokeObjectURL(n.src),t.toBlob(s,"image/png")},t.width.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,n.width),t.height.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,n.height),n.src=URL.createObjectURL(new Blob([(new XMLSerializer).serializeToString(t)],{type:"image/svg+xml;charset=utf-8"}))}(s,{x:0,y:0,height:a.height+30,width:a.width+30},3,i?async function(t){e(await X(t,"dgRm",(new TextEncoder).encode(i)))}:e)}async function Z(t){const e=await async function(t,e){return N(await t.arrayBuffer(),J(e))}(t,"dgRm");return e?(new TextDecoder).decode(e):null}const q={pngCreate(t){const e=this.dataGet();e?Y(this.svg,t,JSON.stringify(e)):t(null)},async pngLoad(t){const e=await Z(t);return!!e&&(this.dataSet(JSON.parse(e)),!0)}};class W extends EventTarget{constructor(t,e){super(),this.svg=t,this.kt=new Map,this.rt=e.on("add",this)}handleEvent(t){switch(t.type){case"add":t.detail.target instanceof M?t.detail.target.on("txtUpd",this).on("del",this):t.detail.target instanceof H&&t.detail.target.on("del",this);break;case"txtUpd":this.kt.get(t.detail.target).detail=t.detail.props.text.textContent;break;case"del":this.Et(t.detail.target)}}Et(t){this.rt.del(t),"shape"===t.type&&this.kt.delete(t)}shapeAdd(t){const e=this.rt.add("shape",t);return this.kt.set(e,{templateKey:t.templateKey,detail:t.props.text?.textContent}),this.dispatchEvent(new CustomEvent("shapeAdd",{cancelable:!0,detail:e})),e}shapeUpdate(t,e){this.rt.shapeUpdate(t,e)}set activeElement(t){this.rt.activeElement=t}clear(){for(const t of this.kt)this.Et(t[0])}dataGet(){if(!i(this.kt))return null;const t={s:[],c:[]},e=new Map;for(const i of this.kt){const s=i[0].positionGet();s.x=Math.trunc(s.x),s.y=Math.trunc(s.y),i[1].position=s,e.set(i[0],t.s.push(i[1])-1)}const s=new Set;for(const n of this.kt)if(i(n[0].connectedPaths))for(const i of n[0].connectedPaths)!s.has(i)&&i.end.key&&(s.add(i),t.c.push({s:{i:e.get(i.start.shape),c:i.start.key},e:{i:e.get(i.end.shape),c:i.end.key}}));return 0===s.size&&delete t.c,t}dataSet(t){if(this.clear(),!(t.s&&t.s.length>0))return;const e=[];for(const i of t.s){const t=this.shapeAdd({templateKey:i.templateKey,position:i.position,props:{text:{textContent:i.detail}}});e.push(t)}if(t.c&&t.c.length>0)for(const i of t.c)this.rt.add("path",{start:{shape:e[i.s.i],key:i.s.c},end:{shape:e[i.e.i],key:i.e.c}})}on(t,e){return this.addEventListener(t,e),this}}Object.assign(W.prototype,q);const Q="https://dgrm.boyko.tech/api";class tt extends HTMLElement{connectedCallback(){const t=this.attachShadow({mode:"closed"});t.innerHTML='<style>.menu{overflow-x:auto;padding:0;position:fixed;bottom:15px;left:50%;transform:translateX(-50%);box-shadow:0 0 58px 2px rgba(34,60,80,.2);border-radius:16px;background-color:rgba(255,255,255,.9)}.content{white-space:nowrap;display:flex}[data-cmd]{cursor:pointer}.menu svg{height:42px;display:inline-block;padding:15px 10px;stroke:#344767;stroke-width:2px;fill:#fff;width:42px;min-width:42px}.menu .big{width:62px;min-width:62px}@media only screen and (max-width:700px){.menu{width:100%;border-radius:0;bottom:0;display:flex;flex-direction:column}.content{align-self:center}}</style><div id="menu" class="menu" style="touch-action:none"><div class="content"><svg data-cmd="shapeAdd" data-cmd-arg="circle" style="padding-left:20px"><circle r="20" cx="21" cy="21"></circle></svg> <svg data-cmd="shapeAdd" data-cmd-arg="rect" class="big"><rect x="1" y="1" width="60" height="40" rx="15" ry="15"></rect></svg> <svg data-cmd="shapeAdd" data-cmd-arg="rhomb" class="big"><g transform="translate(1,1)"><path d="M0 20 L30 0 L60 20 L30 40 Z" stroke-width="2" stroke-linejoin="round"></path></g></svg> <svg data-cmd="shapeAdd" data-cmd-arg="text"><text x="5" y="40" font-size="52px" fill="#344767" stroke-width="0">T</text></svg></div></div>';const e=t.getElementById("menu");e.querySelectorAll('[data-cmd="shapeAdd"]').forEach((t=>t.addEventListener("pointerdown",this))),e.addEventListener("pointerleave",this),e.addEventListener("pointerup",this),e.addEventListener("pointermove",this)}init(t){this.Ct=new et(t)}handleEvent(t){switch(t.type){case"pointerdown":this.zt=!1,this.$t=!1,this.Mt=t.currentTarget.getAttribute("data-cmd-arg"),this.Ht=document.elementFromPoint(t.clientX,t.clientY),this.$=this.Ht;break;case"pointerup":this.zt=!1,this.$t=!1,this.Mt=null,this.Ct.pointerUpMobile();break;case"pointermove":this._t(t),!this.zt&&this.$t&&this.Ct.shapeMoveMobile({clientX:t.clientX,clientY:t.clientY});break;case"pointerleave":this.zt=!0,this.Lt(t)}}_t(t){if(!this.Mt)return;const e=document.elementFromPoint(t.clientX,t.clientY);e!==this.$&&(this.Ht===this.$&&this.Lt(t),this.$=e)}Lt(t){this.Mt&&(this.Ct.shapeDragOut({shape:this.Mt,clientX:t.clientX,clientY:t.clientY}),this.Mt=null,this.$t=!0)}}customElements.define("ap-menu-shape",tt);class et{constructor(t){this.rt=t}shapeDragOut(t){this.Vt=function(t){const e=t.getAttribute("data-center").split(",");return{x:parseFloat(e[0]),y:parseFloat(e[1])}}(l(this.rt.svg,t.shape)),this.St=this.rt.shapeAdd({templateKey:t.shape,position:{x:t.clientX-this.Vt.x,y:t.clientY-this.Vt.y},props:{text:{textContent:"Title"}}}),this.rt.activeElement=this.St;const e=this.St.positionGet();this.Tt={x:t.clientX-this.Vt.x-e.x,y:t.clientY-this.Vt.y-e.y}}shapeMoveMobile(t){this.rt.shapeUpdate(this.St,{position:{x:t.clientX-this.Vt.x-this.Tt.x,y:t.clientY-this.Vt.y-this.Tt.y}})}pointerUpMobile(){this.St&&(this.rt.activeElement=null)}}let it;function st(t,e){t?(it||(it=document.createElement("div"),it.style.cssText="z-index: 2; position: fixed; left: 0; top: 0; width:100%; height:100%; background: #fff; opacity: 0",it.innerHTML="<style>@keyframes blnk{0%{opacity:0}50%{opacity:.7}100%{opacity:0}}.blnk{animation:blnk 1.6s linear infinite}</style>",document.body.append(it)),e?it.classList.add("blnk"):it.classList.remove("blnk")):!t&&it&&(it.remove(),it=null)}class nt extends HTMLElement{connectedCallback(){const t=this.attachShadow({mode:"closed"});t.innerHTML='<style>.menu{position:fixed;top:15px;left:15px;cursor:pointer}.options{position:fixed;padding:15px;box-shadow:0 0 58px 2px rgb(34 60 80 / 20%);border-radius:16px;background-color:rgba(255,255,255,.9);top:0;left:0;z-index:1}.options a,.options div{color:#0d6efd;cursor:pointer;margin:10px 0;display:flex;align-items:center;line-height:25px;text-decoration:none}.options a svg,.options div svg{margin-right:10px}.load svg{animation:rot 1.2s linear infinite}@keyframes rot{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}</style><svg data-cmd="menu" class="menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg><div class="options" style="visibility:hidden"><div data-cmd="menu" style="margin:0 0 15px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg></div><div data-cmd="new"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9 2.003V2h10.998C20.55 2 21 2.455 21 2.992v18.016a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 20.993V8l6-5.997zM5.83 8H9V4.83L5.83 8zM11 4v5a1 1 0 0 1-1 1H5v10h14V4h-8z" fill="rgba(52,71,103,1)"/></svg>New diagram</div><div data-cmd="open"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 21a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2H20a1 1 0 0 1 1 1v3h-2V7h-7.414l-2-2H4v11.998L5.5 11h17l-2.31 9.243a1 1 0 0 1-.97.757H3zm16.938-8H7.062l-1.5 6h12.876l1.5-6z" fill="rgba(52,71,103,1)"/></svg>Open diagram image</div><div data-cmd="save"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z" fill="rgba(52,71,103,1)"/></svg>Save diagram image</div><div data-cmd="link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z" fill="rgba(52,71,103,1)"/></svg>Copy link to diagram</div><a href="/donate.html" target="_blank" style="margin-bottom:0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0H24V24H0z"/><path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" fill="rgba(255,66,77,1)"/></svg>Donate</a></div>',t.querySelectorAll("[data-cmd]").forEach((t=>t.addEventListener("click",this))),this.Pt=t.querySelector(".options")}init(t){this.rt=t,this.rt.svg.addEventListener("dragover",(t=>{t.preventDefault()})),this.rt.svg.addEventListener("drop",(async e=>{e.preventDefault(),1===e.dataTransfer?.items?.length&&"file"===e.dataTransfer.items[0].kind&&"image/png"===e.dataTransfer.items[0].type&&await t.pngLoad(e.dataTransfer.items[0].getAsFile())||this.Dt()}))}async handleEvent(t){switch(t.currentTarget.getAttribute("data-cmd")){case"new":this.rt.clear();break;case"open":!function(t,e){const i=document.createElement("input");i.type="file",i.multiple=!1,i.accept=t,i.onchange=async function(){e(i.files?.length?i.files[0]:null)},i.click(),i.remove()}(".png",(async t=>{await this.rt.pngLoad(t)||this.Dt()}));break;case"save":this.rt.pngCreate((t=>{t?function(t,e){const i=document.createElement("a");i.download=e,i.href=URL.createObjectURL(t),i.click(),URL.revokeObjectURL(i.href),i.remove()}(t,"dgrm.png"):alert("Diagram is empty")}));break;case"link":{const e=this.rt.dataGet();if(!e)return void alert("Diagram is empty");const i=t.currentTarget;this.Ot(i,!0);const s=function(){const t=new Uint8Array(4);window.crypto.getRandomValues(t);const e=new Date;return`${e.getUTCFullYear()}${(e.getUTCMonth()+1).toString().padStart(2,"0")}${Array.from(t,(t=>t.toString(16).padStart(2,"0"))).join("")}`}(),n=new URL(window.location.href);n.searchParams.set("k",s),await navigator.clipboard.writeText(n.toString()),await async function(t,e){return await fetch(`${Q}/${t}`,{method:"POST",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(e)})}(s,e),this.Ot(i,!1),alert("Link to diagram copied to clipboard");break}}this.Ut()}Ot(t,e){st(e),e?t.classList.add("load"):t.classList.remove("load")}Ut(){this.Pt.style.visibility="visible"===this.Pt.style.visibility?"hidden":"visible"}Dt(){alert("File cannot be read. Use the exact image file you got from the application.")}}customElements.define("ap-file-options",nt);const ot=document.getElementById("diagram"),at=new W(ot,function(t){let e=null;const i=new f(t,((t,i)=>{switch(t){case"shape":{if(!i.createParams.postionIsIntoCanvas){const t=o(i.svgCanvas);i.createParams.position.x-=t.x,i.createParams.position.y-=t.y}let t=(s=i.svgCanvas,n=i.createParams,new p({svgEl:d(s,n.templateKey)}));switch(i.createParams.templateKey){case"circle":t=new S(e,t,i.createParams.props);break;case"rhomb":t=new O(e,t,i.createParams.props);break;case"rect":t=new T(e,t,i.createParams.props);break;case"text":t=new M(t,i.createParams.props)}return i.svgElemToPresenterObj.set(t.svgEl,t),function(t,e){e.connectable="true"===e.svgEl.getAttribute("data-connectable"),y(e.svgEl)&&(e.defaultInConnector=x(e.svgEl,e)),e.svgEl.querySelectorAll("[data-connect]").forEach((i=>{const s=x(i,e);t.set(i,s),e.connectors.set(s.key,s)})),t.set(e.svgEl,e)}(i.svgElemToPresenterObj,t),t.update(i.createParams),t}case"path":{const t=new H(function(t){return new b({svgEl:d(t.svgCanvas,t.createParams.templateKey),start:t.createParams.start,end:t.createParams.end,startConnector:t.createParams.startConnector,endConnector:t.createParams.endConnector})}(i));return i.svgElemToPresenterObj.set(t.svgEl,t),t}}var s,n})),s=new v(i);return e=new g(i,s,(t=>{const e=new j(t,s);return new Map([["shape",e],["canvas",e],["connector",new I(t,s)],["path",new K(t)]])})),e}(ot)).on("shapeAdd",(function(){document.getElementById("tip")?.remove()}));document.getElementById("file-options").init(at),document.getElementById("menu-shape").init(at);let ht=new URL(window.location.href);ht.searchParams.get("k")?(st(!0,!0),async function(t){return(await fetch(`${Q}/${t}`)).json()}(ht.searchParams.get("k")).then((t=>{ht.searchParams.delete("k"),at.dataSet(t),history.replaceState(null,null,ht),st(!1),ht=null}))):ht=null}();
