!function(){"use strict";function t(t,e){for(const i of t)if(!e||e(i))return i;return null}function e(t,e){if(!t)return!1;for(const i of t)if(!e||e(i))return!0;return!1}function i(t,e){if(!t.stateHas(e)){const i=t.stateGet();t.update({state:i.add(e)})}}function s(t,e){if(t.stateHas(e)){const n=t.stateGet();t.update({state:(i=n,s=e,i.delete(s),i)})}var i,s}function n(t){const e=t.shape.positionGet(),i=t.innerPosition;return{templateKey:"connect-end",position:{x:e.x+i.x,y:e.y+i.y},postionIsIntoCanvas:!0}}class o{constructor(t){this.o=t}add(t,e){const s=this.o.append("path",{templateKey:"path",start:{position:o.h(t),dir:t.dir},end:{position:o.h(e),dir:e.dir?e.dir:o.p(t.dir)},startConnector:t,endConnector:e});return i(e,"connected"),o.u(t.shape,s),o.u(e.shape,s),s}replaceEnd(t,n){const h=t.end;t.update({end:{position:o.h(n),dir:n.dir?n.dir:t.end.dir},endConnector:n}),h.shape!==n.shape&&(t.start.shape!==h.shape&&h.shape.connectedPaths.delete(t),o.u(n.shape,t)),e(h.shape.connectedPaths,(t=>t.start===h||t.end===h))||s(h,"connected"),i(n,"connected")}updatePosition(t){if(!e(t.connectedPaths))return;const i=t.positionGet();for(const e of t.connectedPaths)e.update({start:e.start.shape===t?{position:{x:i.x+e.start.innerPosition.x,y:i.y+e.start.innerPosition.y}}:null,end:e.end.shape===t?{position:{x:i.x+e.end.innerPosition.x,y:i.y+e.end.innerPosition.y}}:null})}del(t){switch(t.type){case"shape":this.g(t);break;case"path":this.m(t)}}m(t){t.end.shape.connectedPaths.delete(t),e(t.end.shape.connectedPaths,(e=>e.end===t.end))||s(t.end,"connected"),t.start.shape.connectedPaths.delete(t),t.end.shape.connectable&&this.o.delete(t.end.shape),this.o.delete(t)}g(t){if(this.o.delete(t),e(t.connectedPaths))for(const e of t.connectedPaths)this.m(e)}pathGetByEnd(t){return function(t,e){if(!t)return null;let i;for(const s of t)e&&!e(s)||(i=s);return i}(t.shape.connectedPaths,(e=>e.end===t))}static u(t,e){t.connectedPaths||(t.connectedPaths=new Set),t.connectedPaths.add(e)}static h(t){const e=t.shape.positionGet();return{x:e.x+t.innerPosition.x,y:e.y+t.innerPosition.y}}static p(t){switch(t){case"bottom":return"top";case"top":return"bottom";case"left":return"right";case"right":return"left"}}}class h extends EventTarget{constructor(t,e){super(),this.o=t.on("pointermove",this).on("pointerdown",this).on("pointerup",this).on("pointerenter",this).on("pointerleave",this),this.v=e}on(t,e){return this.addEventListener(t,e),this}add(t,e){let i;switch(t){case"shape":i=this.o.append("shape",e);break;case"path":i=this.v.add(a(e.start),a(e.end))}return this.k("add",i),i}shapeUpdate(t,e){t.update(e),(e.position||e.connectors)&&this.v.updatePosition(t)}del(t){this.v.del(t)}handleEvent(t){switch(t.type){case"pointermove":if(this.C){const e={x:t.detail.clientX,y:t.detail.clientY};"connector"===this.C.type?this.$(this.C,e):this.shapeSetMoving("shape"===this.C.type?this.C:this.o.canvas,e),this.C=null}this._&&(this._.update({position:{x:this.M.x+t.detail.clientX,y:this.M.y+t.detail.clientY}}),this.v.updatePosition(this._));break;case"pointerdown":this.C=t.detail.target;break;case"pointerup":"connector"===t.detail.target.type?this.H(t):this.C&&this.L(this.C.connectable?this.v.pathGetByEnd(this.C.defaultInConnector):this.C),this.C=null,this.movedClean(),this.S();break;case"pointerenter":this._&&this._.connectable&&("connector"===t.detail.target.type||"shape"===t.detail.target.type)&&this.V(t.detail.target);break;case"pointerleave":this.S()}}$(t,e){switch(t.connectorType){case"out":{const i=this.add("shape",n(t));this.add("path",{start:t,end:i.defaultInConnector}),this.shapeSetMoving(i,e);break}case"in":if(t.stateGet().has("connected")){const i="path"===this.T?.type&&this.T.end===t?this.T:this.v.pathGetByEnd(t);if(!this.k("disconnect",i))return;const s=this.add("shape",n(t));this.v.replaceEnd(i,s.defaultInConnector),this.shapeSetMoving(s,e)}}}H(t){if("in"!==t.detail.target.connectorType)return;if(!this._?.connectable)return void this.L(this.v.pathGetByEnd(t.detail.target));const e=this.v.pathGetByEnd(this._.defaultInConnector);this.k("connect",e)&&(s(e,"disabled"),this.v.replaceEnd(e,t.detail.target),this.del(this._))}L(t){t!==this.T&&(this.k("select",t),this.T&&s(this.T,"selected"),t&&i(t,"selected"),this.T=t)}shapeSetMoving(t,e){this._=t,this.P(this._,!0);const i=this._.positionGet();this.M={x:i.x-e.x,y:i.y-e.y},this.L()}movedClean(){this._&&this.P(this._,!1),this.M=null,this._=null}P(t,e){const n=e?i:s;if(n(t,"disabled"),t.connectable){this.v.pathGetByEnd(t.defaultInConnector)&&n(this.v.pathGetByEnd(t.defaultInConnector),"disabled")}}V(t){this.D=t,i(t,"hovered"),"connector"===t.type&&i(t.shape,"hovered")}S(){this.D&&(s(this.D,"hovered"),"connector"===this.D.type&&s(this.D.shape,"hovered"),this.D=null)}k(t,e){return this.dispatchEvent(new CustomEvent(t,{cancelable:!0,detail:{target:e}}))}}function a(t){return t.type?t:t.shape.connectors.get(t.key)}function r(e,i,s){let n=t(e.transform.baseVal,(t=>t.type===i));return n||(n=(e.ownerSVGElement||s).createSVGTransform(),e.transform.baseVal.appendItem(n)),n}function c(t,e,i){r(t,SVGTransform.SVG_TRANSFORM_TRANSLATE,i).setTranslate(e.x,e.y)}function d(t){const e=r(t,SVGTransform.SVG_TRANSFORM_TRANSLATE).matrix;return{x:e.e,y:e.f}}function l(t,e,i){t.innerHTML=function(t,e,i){return t.split("\n").map(((t,s)=>`<tspan x="${e}" dy="${0===s?".4em":`${i}px`}" ${0===t.length?'visibility="hidden"':""}>${0===t.length?".":function(t){return t.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}(t).replaceAll(" ","&nbsp;")}</tspan>`)).join("")}(e,t.x?.baseVal[0]?.value??0,i.lineHeight),null!=i.verticalMiddle&&(t.y.baseVal[0].value=i.verticalMiddle-t.getBBox().height/2)}function p(t,e,i){t.has(i)?e.classList.add(i):e.classList.remove(i)}class u{constructor({svgEl:t,start:e,end:i,startConnector:s,endConnector:n}){this.type="path",this.svgEl=t,this.O=t.querySelector('[data-key="path"]'),this.U=t.querySelector('[data-key="outer"]'),this.A=t.querySelector('[data-key="selected"]'),this.G=t.querySelector('[data-key="arrow"]'),this.j=new Set,this.B={},this.R={},this.update({start:e,end:i,startConnector:s,endConnector:n})}stateHas(t){return this.j.has(t)}stateGet(){return new Set(this.j)}update(t){if(t.start&&Object.assign(this.B,t.start),t.end&&(Object.assign(this.R,t.end),this.I()),(t.start||t.end)&&this.F(),t.endConnector&&this.end!==t.endConnector&&(this.end&&s(this.end,"selected"),this.end=t.endConnector,this.svgEl.parentNode.appendChild(this.svgEl)),t.startConnector&&(this.start=t.startConnector),t.state){this.j=t.state;for(const t of["selected","disabled"])p(this.j,this.svgEl,t);t.state.has("selected")?i(this.end.shape.connectable?this.end.shape:this.end,"selected"):s(this.end.shape.connectable?this.end.shape:this.end,"selected")}}F(){const t=u.K(70,this.B,this.R);this.O.setAttribute("d",t),this.U.setAttribute("d",t),this.A.setAttribute("d",t)}I(){c(this.G,this.R.position),function(t,e,i){r(t,SVGTransform.SVG_TRANSFORM_ROTATE,i).setRotate(e,0,0)}(this.G,"right"===this.R.dir?180:"left"===this.R.dir?0:"bottom"===this.R.dir?270:90)}dispose(){this.O=null,this.U=null,this.A=null,this.G=null}static K(t,e,i){return`M ${e.position.x} ${e.position.y} C ${u.X(e.dir,e.position.x,t)} ${u.N(e.dir,e.position.y,t)}, ${u.X(i.dir,i.position.x,t)} ${u.N(i.dir,i.position.y,t)}, ${i.position.x} ${i.position.y}`}static X(t,e,i){return"right"===t||"left"===t?"right"===t?e+i:e-i:e}static N(t,e,i){return"right"===t||"left"===t?e:"bottom"===t?e+i:e-i}}function f(t){const e=t.svgCanvas.ownerSVGElement.getElementsByTagName("defs")[0].querySelector(`[data-templ='${t.createParams.templateKey}']`).cloneNode(!0);return t.svgCanvas.append(e),new u({svgEl:e,start:t.createParams.start,end:t.createParams.end,startConnector:t.createParams.startConnector,endConnector:t.createParams.endConnector})}class g{constructor({svgEl:t,type:e=null,connectable:i=null,defaultInConnector:s=null}){this.j=new Set,this.svgEl=t,this.type=e||"shape",this.connectable=i,this.defaultInConnector=s,this.connectors=new Map}stateHas(t){return this.j.has(t)}stateGet(){return new Set(this.j)}positionGet(){return d(this.svgEl)}update(t){if(t.position&&c(this.svgEl,t.position),t.props&&g.J(this.svgEl,t.props),t.connectors&&Object.keys(t.connectors).forEach((e=>{const i=t.connectors[e],s=this.connectors.get(e);i.innerPosition&&(s.innerPosition=i.innerPosition),i.dir&&(s.dir=i.dir)})),t.state){this.j=t.state;for(const t of["selected","hovered","disabled"])p(this.j,this.svgEl,t)}}static J(t,e){Object.keys(e).forEach((i=>{const s="root"===i?t:t.querySelector(`[data-key='${i}'`);Object.keys(e[i]).forEach((t=>{if("textContent"===t)l(s,e[i][t]?.toString(),m(s));else s.setAttribute(t,e[i][t].toString())}))}))}}function m(t){return{lineHeight:parseInt(t.getAttribute("data-line-height")),verticalMiddle:t.hasAttribute("data-vertical-middle")?parseInt(t.getAttribute("data-vertical-middle")):null}}class v extends EventTarget{constructor(t,e){super(),this.Y=e,this.Z=t,this.Z.addEventListener("pointermove",this),this.Z.addEventListener("pointerdown",this),this.Z.addEventListener("pointerup",this),this.q=new WeakMap,this.W=t.querySelector('[data-key="canvas"]'),this.canvas=new g({svgEl:this.W,type:"canvas"}),this.q.set(this.W,this.canvas)}append(t,e){return this.Y(t,{svgCanvas:this.W,svgElemToPresenterObj:this.q,createParams:e})}delete(t){if(t.dispose&&t.dispose(),this.q.delete(t.svgEl),"shape"===t.type){for(const e of t.connectors)this.q.delete(e[1].svgEl);t.defaultInConnector&&this.q.delete(t.defaultInConnector.svgEl)}t.svgEl.remove()}on(t,e){return this.addEventListener(t,e),this}handleEvent(t){switch(t.type){case"pointermove":this.tt(t),this.k(t,"pointermove",null);break;case"pointerdown":case"pointerup":this.k(t,t.type,v.et(t,!0))}}tt(t){const e=v.et(t,!1);e!==this.it&&(this.it&&this.k(t,"pointerleave",this.it),e&&this.k(t,"pointerenter",e),this.it=e)}static et(e,i){const s=document.elementsFromPoint(e.clientX,e.clientY);return i?t(s,(t=>t.hasAttribute("data-evt-z-index")&&!t.hasAttribute("data-evt-no-click")))??(s[0].hasAttribute("data-evt-no-click")?s[1]:s[0]):t(s,(t=>t.hasAttribute("data-evt-z-index")))??s[0]}k(t,e,i){let s=null;i&&(s=this.q.get(i===this.Z||i.ownerSVGElement!==this.Z?this.W:i),s||(s=this.q.get(i.closest("[data-connect]"))),s||(s=this.q.get(i.closest("[data-templ]")))),this.dispatchEvent(new CustomEvent(e,{detail:{target:s,clientX:t.clientX,clientY:t.clientY}}))}}class w{constructor({svgEl:t,connectorType:e,shape:i,key:s,innerPosition:n,dir:o}){this.svgEl=t,this.j=new Set,this.type="connector",this.connectorType=e,this.shape=i,this.key=s,this.innerPosition=n,this.dir=o}stateHas(t){return this.j.has(t)}stateGet(){return new Set(this.j)}update(t){this.j=t.state;for(const t of["connected","hovered","selected"])p(this.j,this.svgEl,t)}}function x(t,e){const i=t.ownerSVGElement.getElementsByTagName("defs")[0].querySelector(`[data-templ='${e.templateKey}']`).cloneNode(!0);return t.append(i),new g({svgEl:i})}function y(t,e){return new w({svgEl:t,connectorType:"in"===t.getAttribute("data-connect")?"in":"out",shape:e,key:t.getAttribute("data-key"),innerPosition:b(t),dir:t.getAttribute("data-connect-dir")})}function b(t){if(!t.getAttribute("data-connect-point"))return null;const e=t.getAttribute("data-connect-point").split(",");return{x:parseFloat(e[0]),y:parseFloat(e[1])}}function k(t,e){const i=new v(t,(function(t,i){switch(t){case"shape":return function(t,e){if(!t.createParams.postionIsIntoCanvas){const e=d(t.svgCanvas);t.createParams.position.x-=e.x,t.createParams.position.y-=e.y}const i=e?e("shape",t):x(t.svgCanvas,t.createParams);return t.svgElemToPresenterObj.set(i.svgEl,i),function(t,e){e.connectable="true"===e.svgEl.getAttribute("data-connectable"),b(e.svgEl)&&(e.defaultInConnector=y(e.svgEl,e)),e.svgEl.querySelectorAll("[data-connect]").forEach((i=>{const s=y(i,e);t.set(i,s),e.connectors.set(s.key,s)})),t.set(e.svgEl,e)}(t.svgElemToPresenterObj,i),i.update(t.createParams),i}(i,e);case"path":{const t=e?e("path",i):f(i);return i.svgElemToPresenterObj.set(t.svgEl,t),t}}}));return new h(i,new o(i))}class E{constructor(t){this.svgElement=t,this.type=t.type,this.svgEl=this.svgElement.svgEl,this.svgElement.svgEl.addEventListener("pointerdown",this),this.svgElement.svgEl.addEventListener("pointerup",this),this.svgElement.svgEl.addEventListener("click",this)}update(t){t.state&&this.st&&(this.st=!1,this.onEditLeave()),t.state&&(this.nt=!1),this.svgElement.update(t)}dispose(){this.st&&this.onEditLeave()}handleEvent(t){if(!t.target.hasAttribute("data-evt-no-click")&&document.elementFromPoint(t.clientX,t.clientY)===t.target)if("click"!==t.type){if(!this.st)switch(t.type){case"pointerdown":this.nt=this.svgElement.stateGet().has("selected");break;case"pointerup":this.nt&&(this.st=!0,this.onEdit(t))}}else this.onClick(t,this.st)}onEdit(t){}onEditLeave(){}onClick(t,e){}}class C extends E{constructor(t){super(t),this.connectable=this.svgElement.connectable,this.defaultInConnector=this.svgElement.defaultInConnector,this.connectors=this.svgElement.connectors}stateHas(t){return this.svgElement.stateHas(t)}stateGet(){return this.svgElement.stateGet()}positionGet(){return this.svgElement.positionGet()}update(t){t.state&&this.st&&(this.st=!1,this.onEditLeave()),super.update(t)}}function $(t,e,i,s,n){const o=t.getBBox(),h=o.width+20;e.width.baseVal.value=h+2*s+2,e.x.baseVal.value=o.x-s-("center"===n?10:0),e.height.baseVal.value=o.height+2*s+3,e.y.baseVal.value=o.y-s,i.style.width=`${h}px`,i.style.height=`${o.height}px`}function z(t,e,i,s,n){let o;switch(i.tagName){case"tspan":o=t.querySelector(`[data-text-for=${i.parentElement.getAttribute("data-key")}]`);break;case"text":o=t.querySelector(`[data-text-for=${i.getAttribute("data-key")}]`);break;default:i.getAttribute("data-text-for")&&(o=i)}if(!o)return;o.classList.remove("empty");const h=o.getAttribute("data-text-for"),a=t.querySelector(`[data-key=${h}]`);return function(t,e,i,s,n){const o=document.createElementNS("http://www.w3.org/2000/svg","foreignObject"),h=document.createElement("textarea");h.style.caretColor=t.getAttribute("fill"),h.value=i,h.oninput=function(){l(t,h.value,e),$(t,o,h,r,a.textAlign),s(h.value)},h.onblur=function(){n(h.value)},h.onpointerdown=function(t){t.stopImmediatePropagation()},o.appendChild(h),t.parentElement.appendChild(o);const a=getComputedStyle(h),r=parseInt(a.padding)+parseInt(a.borderWidth);return $(t,o,h,r,a.textAlign),h.focus(),o}(a,m(a),e[h]?.textContent.toString(),(t=>{s(a,{[h]:{textContent:t}})}),(t=>{t?o.classList.remove("empty"):o.classList.add("empty"),n()}))}class _ extends C{constructor(t,e){super(t),this.ot=Object.assign({},e)}on(t,e){return this.svgEl.addEventListener(t,e),this}update(t){var e,i;t.props&&Object.assign(this.ot,t.props),t.state&&t.state.has("selected")&&!this.stateGet().has("selected")&&(e=this.svgEl,i=this.ot,e.querySelectorAll("[data-text-for]").forEach((t=>{i[t.getAttribute("data-text-for")]?.textContent||t.classList.add("empty")}))),super.update(t)}onClick(t,e){e&&this.ht(t)}onEditLeave(){this.rt()}ht(t){this.ct||(this.ct=z(this.svgEl,this.ot,t.target,((t,e)=>{Object.assign(this.ot,e),this.onTextChange(t,e)}),(t=>{this.rt()})))}onTextChange(t,e){this.svgEl.dispatchEvent(new CustomEvent("txtUpd",{detail:{target:this,props:e}}))}rt(){this.ct&&!this.dt&&(this.dt=!0,this.ct.remove(),this.ct=null,this.dt=!1)}}class M extends _{onEdit(t){this.svgEl.classList.add("edit"),this.lt()}onEditLeave(){super.onEditLeave(),this.svgEl.classList.remove("edit"),this.ut()}lt(){this.ft=L(),this.ft.onclick=t=>{this.ut(),this.svgEl.dispatchEvent(new CustomEvent("del",{detail:{target:this}}))},this.panelUpdPos(),document.body.append(this.ft)}panelUpdPos(){if(!this.ft)return;const t=this.svgEl.getBoundingClientRect();this.ft.style.top=window.scrollY+t.top-35+"px",this.ft.style.left=`${t.left+10}px`}ut(){this.ft&&(this.ft.remove(),this.ft=null)}}class H extends E{get end(){return this.svgElement.end}get start(){return this.svgElement.start}stateHas(t){return this.svgElement.stateHas(t)}stateGet(){return this.svgElement.stateGet()}on(t,e){return this.svgElement.svgEl.addEventListener(t,e),this}onEdit(t){this.ft=L(),this.ft.style.top=t.clientY-55+"px",this.ft.style.left=t.clientX-20+"px",this.ft.onclick=t=>{this.ut(),this.svgEl.dispatchEvent(new CustomEvent("del",{detail:{target:this}}))},document.body.append(this.ft)}onEditLeave(){this.ut()}ut(){this.ft&&(this.ft.remove(),this.ft=null)}}function L(){const t=document.createElement("div");return t.style.cssText="position: fixed; padding: 10px;\tbox-shadow: 0px 0px 58px 2px rgb(34 60 80 / 20%); border-radius: 16px; background-color: rgba(255,255,255, .9);",t.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 6h5v2h-2v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8H2V6h5V3a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3zm1 2H6v12h12V8zm-9 3h2v6H9v-6zm4 0h2v6h-2v-6zM9 4v2h6V4H9z" fill="rgba(52,71,103,1)"/></svg>',t}function S(t,e=0){const i=t.x-e,s=t.x+t.width+e,n=t.y-e,o=t.y+t.height+e;return[{x:i,y:n},{x:s,y:n},{x:i,y:o},{x:s,y:o}]}function V(t,e,i){return i<=t?t:t+Math.ceil((i-t)/e)*e}class T extends M{constructor(t,e,i){super(e,i),this.gt=t,this.vt=60}update(t){super.update(t),void 0!==t.props?.text?.textContent&&this.wt(this.svgEl.querySelector('[data-key="text"]'))}onTextChange(t,e){super.onTextChange(t,e),this.wt(t)}wt(t){let e=0;for(const i of t.getElementsByTagName("tspan"))for(const t of S(i.getBBox())){const i=t.x**2+t.y**2;i>e&&(e=i)}const i=V(60,20,Math.sqrt(e));i!==this.vt&&(this.vt=i,this.xt(i),this.panelUpdPos())}xt(t){const e=-1*t,i={right:{cx:t},left:{cx:e},bottom:{cy:t},top:{cy:e}},s={right:{innerPosition:{x:t,y:0}},left:{innerPosition:{x:e,y:0}},bottom:{innerPosition:{x:0,y:t}},top:{innerPosition:{x:0,y:e}}};this.gt.shapeUpdate(this,{props:{main:{r:t},outer:{r:t+20},outright:i.right,outleft:i.left,outbottom:i.bottom,outtop:i.top,inright:i.right,inleft:i.left,inbottom:i.bottom,intop:i.top},connectors:{outright:s.right,outleft:s.left,outbottom:s.bottom,outtop:s.top,inright:s.right,inleft:s.left,inbottom:s.bottom,intop:s.top}})}}class P extends M{constructor(t,e,i){super(e,i),this.gt=t,this.yt=150,this.bt=150,this.kt=50,this.Et=50}update(t){super.update(t),void 0!==t.props?.text?.textContent&&this.wt(this.svgEl.querySelector('[data-key="text"]'))}onTextChange(t,e){super.onTextChange(t,e),this.wt(t)}wt(t){let e=0;for(const i of t.getElementsByTagName("tspan")){const t=i.getBBox().width+4;t>e&&(e=t)}const i=V(this.bt,40,e),s=V(this.Et,20,t.getBBox().height+4);i===this.yt&&s===this.kt||(this.yt=i,this.kt=s,this.xt(i,s),this.panelUpdPos())}xt(t,e){const i=D(this.bt,this.Et,t,e),s={r:{cx:t+i.x,cy:e/2+i.y},l:{cx:i.x,cy:e/2+i.y},b:{cx:t/2+i.x,cy:e+i.y},t:{cx:t/2+i.x,cy:i.y}},n={right:{innerPosition:{x:s.r.cx,y:s.r.cy}},left:{innerPosition:{x:s.l.cx,y:s.l.cy}},bottom:{innerPosition:{x:s.b.cx,y:s.b.cy}},top:{innerPosition:{x:s.t.cx,y:s.t.cy}}};this.gt.shapeUpdate(this,{props:{main:i,outer:D(this.bt,this.Et,t+40,e+40),outright:s.r,outleft:s.l,outbottom:s.b,outtop:s.t,inright:s.r,inleft:s.l,inbottom:s.b,intop:s.t},connectors:{outright:n.right,outleft:n.left,outbottom:n.bottom,outtop:n.top,inright:n.right,inleft:n.left,inbottom:n.bottom,intop:n.top}})}}function D(t,e,i,s){return{y:(e-s)/2,x:(t-i)/2,width:i,height:s}}function O(t,e,i){const s=t.ownerSVGElement.createSVGPoint();return s.x=e,s.y=i,t.isPointInFill(s)||t.isPointInStroke(s)}class U extends M{constructor(t,e,i){super(e,i),this.gt=t,this.Ct=120}update(t){super.update(t),void 0!==t.props?.text?.textContent&&this.wt(this.svgEl.querySelector('[data-key="text"]'))}onTextChange(t,e){super.onTextChange(t,e),this.wt(t)}wt(t){this.$t||(this.$t=function(t,e){const i=t.querySelector(`[data-key="${e}"]`),s=i.cloneNode(!1);return s.style.fill="transparent",s.style.stroke="transparent",s.removeAttribute("data-key"),t.insertBefore(s,i),s}(this.svgEl,"main"));const i=function(t,e,i,s){let n=i;if(s(n)){do{n+=e}while(s(n));return n}if(t===n)return null;do{n-=e}while(t<=n&&!s(n));return n+=e,i!==n?n:null}(120,40,this.Ct,(i=>(this.$t.setAttribute("d",G(120,70,i)),function(t,i,s=0){return e(t.getElementsByTagName("tspan"),(t=>{const e=t.getBBox(),n=e.x-s,o=e.x+e.width+s,h=e.y-s,a=e.y+e.height+s;return!(O(i,n,h)&&O(i,o,h)&&O(i,n,a)&&O(i,o,a))}))}(t,this.$t))));i&&(this.Ct=i,this.xt(i),this.panelUpdPos())}xt(t){const e={d:G(120,70,t)},i=A(120,70,t+16),s={left:{cx:i.l.x},right:{cx:i.r.x},top:{cy:i.t.y},bottom:{cy:i.b.y}},n={left:{innerPosition:i.l},right:{innerPosition:i.r},top:{innerPosition:i.t},bottom:{innerPosition:i.b}};this.gt.shapeUpdate(this,{props:{main:e,outer:{d:G(120,70,t+80)},border:e,outleft:s.left,outright:s.right,outtop:s.top,outbottom:s.bottom,inleft:s.left,inright:s.right,intop:s.top,inbottom:s.bottom},connectors:{outleft:n.left,outright:n.right,outtop:n.top,outbottom:n.bottom,inleft:n.left,inright:n.right,intop:n.top,inbottom:n.bottom}})}onEditLeave(){super.onEditLeave(),this.$t&&(this.$t.remove(),this.$t=null)}}function A(t,e,i){const s=(i-t)/2,n=-1*s;return{l:{x:n,y:e/2},t:{x:t/2,y:n},r:{x:t+s,y:e/2},b:{x:t/2,y:e+s}}}function G(t,e,i){const s=A(t,e,i);return`M${s.l.x} ${s.l.y} L${s.t.x} ${s.t.y} L${s.r.x} ${s.r.y} L${s.b.x} ${s.b.y} Z`}async function j(t,e,i){return function(t,e,i){let s,n;const o=B(t,e);if(o)s=new DataView(t,0,o.byteOffset-8),n=new DataView(t,o.byteOffset+o.byteLength+4);else{const e=t.byteLength-12;s=new DataView(t,0,e),n=new DataView(t,e)}const h=new DataView(new ArrayBuffer(8));return h.setUint32(0,i.length),h.setUint32(4,e),new Blob([s,h,i,new Uint32Array([0]),n],{type:"image/png"})}(await t.arrayBuffer(),R(e),i)}function B(t,e){const i=new DataView(t,8);let s,n=0,o=i.getUint32(4);for(;1229278788!==o;){if(s=i.getUint32(n),o===e)return new DataView(t,n+16,s);n=n+12+s,o=i.getUint32(n+4)}return null}function R(t){return new DataView((new TextEncoder).encode(t).buffer).getUint32(0)}async function I(t){const e=await async function(t,e){return B(await t.arrayBuffer(),R(e))}(t,"dgRm");return e?(new TextDecoder).decode(e):null}function F(t,e,i){const s=t.cloneNode(!0);s.querySelectorAll(".selected").forEach((t=>t.classList.remove("selected")));const n=function(t,e){let i;for(const s of t.querySelectorAll(e)){i||(i={top:1/0,left:1/0,bottom:-1/0,right:-1/0});const t=s.getBoundingClientRect();t.top<i.top&&(i.top=t.top),t.left<i.left&&(i.left=t.left),t.right>i.right&&(i.right=t.right),t.bottom>i.bottom&&(i.bottom=t.bottom)}return i?{x:i.left,y:i.top,height:i.bottom-i.top,width:i.right-i.left}:null}(t,'[data-key="canvas"]'),o=s.querySelector('[data-key="canvas"]'),h=d(o);c(o,{x:-1*n.x+h.x+15,y:-1*n.y+h.y+15}),function(t,e,i,s){const n=new Image;n.width=e.width*i*window.devicePixelRatio,n.height=e.height*i*window.devicePixelRatio,n.onload=function(){const t=document.createElement("canvas");t.width=n.width,t.height=n.height,t.style.width=`${n.width}px`,t.style.height=`${n.height}px`;const i=t.getContext("2d");i.imageSmoothingEnabled=!1,i.drawImage(n,e.x,e.y,e.width,e.height,0,0,n.width,n.height),URL.revokeObjectURL(n.src),t.toBlob(s,"image/png")},t.width.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,n.width),t.height.baseVal.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX,n.height),n.src=URL.createObjectURL(new Blob([(new XMLSerializer).serializeToString(t)],{type:"image/svg+xml;charset=utf-8"}))}(s,{x:0,y:0,height:n.height+30,width:n.width+30},3,i?async function(t){e(await j(t,"dgRm",(new TextEncoder).encode(i)))}:e)}const K={pngCreate(t){const e=this.dataGet();e?F(this.svg,t,JSON.stringify(e)):t(null)},async pngLoad(t){const e=await I(t);return!!e&&(this.dataSet(JSON.parse(e)),!0)}};class X extends EventTarget{constructor(t,e){super(),this.svg=t,this.zt=new Map,this._t=new Set,this.gt=e.on("connect",this).on("disconnect",this).on("add",this)}handleEvent(t){switch(t.type){case"add":t.detail.target instanceof M?t.detail.target.on("txtUpd",this).on("del",this):t.detail.target instanceof H&&t.detail.target.on("del",this);break;case"txtUpd":this.zt.get(t.detail.target).detail=t.detail.props.text.textContent;break;case"del":this.Mt(t.detail.target);break;case"connect":this._t.add(t.detail.target);break;case"disconnect":this._t.delete(t.detail.target)}}Mt(t){switch(this.gt.del(t),t.type){case"shape":this.zt.delete(t),function(t,e){const i=[];for(const s of t)e(s)||i.push(s);for(const e of i)t.delete(e)}(this._t,(e=>e.start.shape!==t&&e.end.shape!==t));break;case"path":this._t.delete(t)}}shapeAdd(t){const e=this.gt.add("shape",t);return this.zt.set(e,{templateKey:t.templateKey,detail:t.props.text?.textContent}),this.dispatchEvent(new CustomEvent("shapeAdd",{cancelable:!0,detail:e})),e}shapeUpdate(t,e){this.gt.shapeUpdate(t,e)}shapeSetMoving(t,e){this.gt.shapeSetMoving(t,e)}movedClean(){this.gt.movedClean()}clear(){for(const t of this.zt)this.Mt(t[0])}dataGet(){if(!this.zt||0===this.zt.size)return null;const t={s:[]},e=new Map;for(const i of this.zt)i[1].position=i[0].positionGet(),e.set(i[0],t.s.push(i[1])-1);return this._t&&this._t.size>0&&(t.c=function(t,e){const i=[];for(const s of t)i.push(e(s));return i}(this._t,(t=>({s:{i:e.get(t.start.shape),c:t.start.key},e:{i:e.get(t.end.shape),c:t.end.key}})))),t}dataSet(t){if(this.clear(),!(t.s&&t.s.length>0))return;const e=[];for(const i of t.s){const t=this.shapeAdd({templateKey:i.templateKey,position:i.position,props:{text:{textContent:i.detail}}});e.push(t)}if(t.c&&t.c.length>0)for(const i of t.c)this._t.add(this.gt.add("path",{start:{shape:e[i.s.i],key:i.s.c},end:{shape:e[i.e.i],key:i.e.c}}))}on(t,e){return this.addEventListener(t,e),this}}Object.assign(X.prototype,K);const N="https://dgrm.boyko.tech/api";class J extends HTMLElement{connectedCallback(){const t=this.attachShadow({mode:"closed"});t.innerHTML='<style>.menu{overflow-x:auto;padding:0;position:fixed;bottom:15px;left:50%;transform:translateX(-50%);box-shadow:0 0 58px 2px rgba(34,60,80,.2);border-radius:16px;background-color:rgba(255,255,255,.9)}.content{white-space:nowrap;display:flex}[data-cmd]{cursor:pointer}.menu svg{height:42px;display:inline-block;padding:15px 10px;stroke:#344767;stroke-width:2px;fill:#fff;width:42px;min-width:42px}.menu .big{width:62px;min-width:62px}@media only screen and (max-width:700px){.menu{width:100%;border-radius:0;bottom:0;display:flex;flex-direction:column}.content{align-self:center}}</style><div id="menu" class="menu" style="touch-action:none"><div class="content"><svg data-cmd="shapeAdd" data-cmd-arg="circle" style="padding-left:20px"><circle r="20" cx="21" cy="21"></circle></svg> <svg data-cmd="shapeAdd" data-cmd-arg="rect" class="big"><rect x="1" y="1" width="60" height="40" rx="15" ry="15"></rect></svg> <svg data-cmd="shapeAdd" data-cmd-arg="rhomb" class="big"><g transform="translate(1,1)"><path d="M0 20 L30 0 L60 20 L30 40 Z" stroke-width="2" stroke-linejoin="round"></path></g></svg> <svg data-cmd="shapeAdd" data-cmd-arg="text"><text x="5" y="40" font-size="52px" fill="#344767" stroke-width="0">T</text></svg></div></div>';const e=t.getElementById("menu");e.querySelectorAll('[data-cmd="shapeAdd"]').forEach((t=>t.addEventListener("pointerdown",this))),e.addEventListener("pointerleave",this),e.addEventListener("pointerup",this),e.addEventListener("pointermove",this)}init(t){this.Ht=new Y(t)}handleEvent(t){switch(t.type){case"pointerdown":this.Lt=!1,this.St=!1,this.Vt=t.currentTarget.getAttribute("data-cmd-arg"),this.Tt=document.elementFromPoint(t.clientX,t.clientY),this.it=this.Tt;break;case"pointerup":this.Lt=!1,this.St=!1,this.Vt=null,this.Ht.pointerUpMobile();break;case"pointermove":this.Pt(t),!this.Lt&&this.St&&this.Ht.shapeMoveMobile({clientX:t.clientX,clientY:t.clientY});break;case"pointerleave":this.Lt=!0,this.Dt(t)}}Pt(t){if(!this.Vt)return;const e=document.elementFromPoint(t.clientX,t.clientY);e!==this.it&&(this.Tt===this.it&&this.Dt(t),this.it=e)}Dt(t){this.Vt&&(this.Ht.shapeDragOut({shape:this.Vt,clientX:t.clientX,clientY:t.clientY}),this.Vt=null,this.St=!0)}}customElements.define("ap-menu-shape",J);class Y{constructor(t){this.gt=t}shapeDragOut(t){const e=this.gt.svg.querySelector(`[data-templ='${t.shape}']`).getAttribute("data-center").split(",");this.Ot={x:parseFloat(e[0]),y:parseFloat(e[1])},this.Ut=this.gt.shapeAdd({templateKey:t.shape,position:{x:t.clientX-this.Ot.x,y:t.clientY-this.Ot.y},props:{text:{textContent:"Title"}}}),this.gt.shapeSetMoving(this.Ut,{x:t.clientX,y:t.clientY});const i=this.Ut.positionGet();this.At={x:t.clientX-this.Ot.x-i.x,y:t.clientY-this.Ot.y-i.y}}shapeMoveMobile(t){this.gt.shapeUpdate(this.Ut,{position:{x:t.clientX-this.Ot.x-this.At.x,y:t.clientY-this.Ot.y-this.At.y}})}pointerUpMobile(){this.Ut&&this.gt.movedClean()}}let Z;function q(t,e){t?(Z||(Z=document.createElement("div"),Z.style.cssText="z-index: 2; position: fixed; left: 0; top: 0; width:100%; height:100%; background: #fff; opacity: 0",Z.innerHTML="<style>@keyframes blnk{0%{opacity:0}50%{opacity:.7}100%{opacity:0}}.blnk{animation:blnk 1.6s linear infinite}</style>",document.body.append(Z)),e?Z.classList.add("blnk"):Z.classList.remove("blnk")):!t&&Z&&(Z.remove(),Z=null)}class W extends HTMLElement{connectedCallback(){const t=this.attachShadow({mode:"closed"});t.innerHTML='<style>.menu{position:fixed;top:15px;left:15px;cursor:pointer}.options{position:fixed;padding:15px;box-shadow:0 0 58px 2px rgb(34 60 80 / 20%);border-radius:16px;background-color:rgba(255,255,255,.9);top:0;left:0;z-index:1}.options a,.options div{color:#0d6efd;cursor:pointer;margin:10px 0;display:flex;align-items:center;line-height:25px;text-decoration:none}.options a svg,.options div svg{margin-right:10px}.load svg{animation:rot 1.2s linear infinite}@keyframes rot{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}</style><svg data-cmd="menu" class="menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg><div class="options" style="visibility:hidden"><svg data-cmd="menu" class="menu" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" fill="rgba(52,71,103,1)"/></svg><div data-cmd="new" style="padding-top:30px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M9 2.003V2h10.998C20.55 2 21 2.455 21 2.992v18.016a.993.993 0 0 1-.993.992H3.993A1 1 0 0 1 3 20.993V8l6-5.997zM5.83 8H9V4.83L5.83 8zM11 4v5a1 1 0 0 1-1 1H5v10h14V4h-8z" fill="rgba(52,71,103,1)"/></svg>New diagram</div><div data-cmd="open"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 21a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h7.414l2 2H20a1 1 0 0 1 1 1v3h-2V7h-7.414l-2-2H4v11.998L5.5 11h17l-2.31 9.243a1 1 0 0 1-.97.757H3zm16.938-8H7.062l-1.5 6h12.876l1.5-6z" fill="rgba(52,71,103,1)"/></svg>Open diagram image</div><div data-cmd="save"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M3 19h18v2H3v-2zm10-5.828L19.071 7.1l1.414 1.414L12 17 3.515 8.515 4.929 7.1 11 13.17V2h2v11.172z" fill="rgba(52,71,103,1)"/></svg>Save diagram image</div><div data-cmd="link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M13.06 8.11l1.415 1.415a7 7 0 0 1 0 9.9l-.354.353a7 7 0 0 1-9.9-9.9l1.415 1.415a5 5 0 1 0 7.071 7.071l.354-.354a5 5 0 0 0 0-7.07l-1.415-1.415 1.415-1.414zm6.718 6.011l-1.414-1.414a5 5 0 1 0-7.071-7.071l-.354.354a5 5 0 0 0 0 7.07l1.415 1.415-1.415 1.414-1.414-1.414a7 7 0 0 1 0-9.9l.354-.353a7 7 0 0 1 9.9 9.9z" fill="rgba(52,71,103,1)"/></svg>Copy link to diagram</div><a href="/donate.html" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0H24V24H0z"/><path d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z" fill="rgba(255,66,77,1)"/></svg>Donate</a></div>',t.querySelectorAll("[data-cmd]").forEach((t=>t.addEventListener("click",this))),this.Gt=t.querySelector(".options")}init(t){this.gt=t,this.gt.svg.addEventListener("dragover",(t=>{t.preventDefault()})),this.gt.svg.addEventListener("drop",(async e=>{e.preventDefault(),1===e.dataTransfer?.items?.length&&"file"===e.dataTransfer.items[0].kind&&"image/png"===e.dataTransfer.items[0].type&&await t.pngLoad(e.dataTransfer.items[0].getAsFile())||this.jt()}))}async handleEvent(t){switch(t.currentTarget.getAttribute("data-cmd")){case"new":this.gt.clear();break;case"open":!function(t,e){const i=document.createElement("input");i.type="file",i.multiple=!1,i.accept=t,i.onchange=async function(){e(i.files?.length?i.files[0]:null)},i.click(),i.remove()}(".png",(async t=>{await this.gt.pngLoad(t)||this.jt()}));break;case"save":this.gt.pngCreate((t=>{t?function(t,e){const i=document.createElement("a");i.download=e,i.href=URL.createObjectURL(t),i.click(),URL.revokeObjectURL(i.href),i.remove()}(t,"dgrm.png"):alert("Diagram is empty")}));break;case"link":{const e=this.gt.dataGet();if(!e)return void alert("Diagram is empty");const i=t.currentTarget;this.Bt(i,!0);const s=function(){const t=new Uint8Array(4);window.crypto.getRandomValues(t);const e=new Date;return`${e.getUTCFullYear()}${(e.getUTCMonth()+1).toString().padStart(2,"0")}${Array.from(t,(t=>t.toString(16).padStart(2,"0"))).join("")}`}(),n=new URL(window.location.href);n.searchParams.set("k",s),await navigator.clipboard.writeText(n.toString()),await async function(t,e){return await fetch(`${N}/${t}`,{method:"POST",headers:{"Content-Type":"application/json;charset=utf-8"},body:JSON.stringify(e)})}(s,e),this.Bt(i,!1),alert("Link to diagram copied to clipboard");break}}this.Rt()}Bt(t,e){q(e),e?t.classList.add("load"):t.classList.remove("load")}Rt(){this.Gt.style.visibility="visible"===this.Gt.style.visibility?"hidden":"visible"}jt(){alert("File cannot be read. Use the exact image file you got from the application.")}}customElements.define("ap-file-options",W);const Q=document.getElementById("diagram"),tt=new X(Q,function(t){const e=k(t,((t,i)=>{switch(t){case"shape":{const t=x(i.svgCanvas,i.createParams);switch(i.createParams.templateKey){case"circle":return new T(e,t,i.createParams.props);case"rhomb":return new U(e,t,i.createParams.props);case"rect":return new P(e,t,i.createParams.props);case"connect-end":return t;case"text":return new M(t,i.createParams.props)}break}case"path":return new H(f(i))}}));return e}(Q)).on("shapeAdd",(function(){document.getElementById("tip")?.remove()}));document.getElementById("file-options").init(tt),document.getElementById("menu-shape").init(tt);let et=new URL(window.location.href);et.searchParams.get("k")?(q(!0,!0),async function(t){return(await fetch(`${N}/${t}`)).json()}(et.searchParams.get("k")).then((t=>{et.searchParams.delete("k"),tt.dataSet(t),history.replaceState(null,null,et),q(!1),et=null}))):et=null}();
