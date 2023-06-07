import{r as g,B as H,o as z,R,y as p,z as S,h as y,g as L,A as V,a as _,s as k,c as d,w as h}from"./index.e5e5ad80.js";import{c as q,a as D}from"./render.4975c230.js";function N(){const o=g(!H.value);return o.value===!1&&z(()=>{o.value=!0}),o}const C=typeof ResizeObserver!="undefined",O=C===!0?{}:{style:"display:block;position:absolute;top:0;left:0;right:0;bottom:0;height:100%;width:100%;overflow:hidden;pointer-events:none;z-index:-1;",url:"about:blank"};var P=q({name:"QResizeObserver",props:{debounce:{type:[String,Number],default:100}},emits:["resize"],setup(o,{emit:w}){let s=null,r,t={width:-1,height:-1};function u(n){n===!0||o.debounce===0||o.debounce==="0"?i():s===null&&(s=setTimeout(i,o.debounce))}function i(){if(clearTimeout(s),s=null,r){const{offsetWidth:n,offsetHeight:a}=r;(n!==t.width||a!==t.height)&&(t={width:n,height:a},w("resize",t))}}const f=L();if(Object.assign(f.proxy,{trigger:u}),C===!0){let n;return z(()=>{R(()=>{r=f.proxy.$el.parentNode,r&&(n=new ResizeObserver(u),n.observe(r),i())})}),p(()=>{clearTimeout(s),n!==void 0&&(n.disconnect!==void 0?n.disconnect():r&&n.unobserve(r))}),S}else{let m=function(){clearTimeout(s),a!==void 0&&(a.removeEventListener!==void 0&&a.removeEventListener("resize",u,V.passive),a=void 0)},b=function(){m(),r&&r.contentDocument&&(a=r.contentDocument.defaultView,a.addEventListener("resize",u,V.passive),i())};const n=N();let a;return z(()=>{R(()=>{r=f.proxy.$el,r&&b()})}),p(m),()=>{if(n.value===!0)return y("object",{style:O.style,tabindex:-1,type:"text/html",data:O.url,"aria-hidden":"true",onLoad:b})}}}}),A=q({name:"QFooter",props:{modelValue:{type:Boolean,default:!0},reveal:Boolean,bordered:Boolean,elevated:Boolean,heightHint:{type:[String,Number],default:50}},emits:["reveal","focusin"],setup(o,{slots:w,emit:s}){const{proxy:{$q:r}}=L(),t=_(k,()=>{console.error("QFooter needs to be child of QLayout")}),u=g(parseInt(o.heightHint,10)),i=g(!0),f=g(H.value===!0||t.isContainer.value===!0?0:window.innerHeight),n=d(()=>o.reveal===!0||t.view.value.indexOf("F")>-1||r.platform.is.ios&&t.isContainer.value===!0),a=d(()=>t.isContainer.value===!0?t.containerHeight.value:f.value),m=d(()=>{if(o.modelValue!==!0)return 0;if(n.value===!0)return i.value===!0?u.value:0;const e=t.scroll.value.position+a.value+u.value-t.height.value;return e>0?e:0}),b=d(()=>o.modelValue!==!0||n.value===!0&&i.value!==!0),Q=d(()=>o.modelValue===!0&&b.value===!0&&o.reveal===!0),B=d(()=>"q-footer q-layout__section--marginal "+(n.value===!0?"fixed":"absolute")+"-bottom"+(o.bordered===!0?" q-footer--bordered":"")+(b.value===!0?" q-footer--hidden":"")+(o.modelValue!==!0?" q-layout--prevent-focus"+(n.value!==!0?" hidden":""):"")),F=d(()=>{const e=t.rows.value.bottom,l={};return e[0]==="l"&&t.left.space===!0&&(l[r.lang.rtl===!0?"right":"left"]=`${t.left.size}px`),e[2]==="r"&&t.right.space===!0&&(l[r.lang.rtl===!0?"left":"right"]=`${t.right.size}px`),l});function c(e,l){t.update("footer",e,l)}function v(e,l){e.value!==l&&(e.value=l)}function $({height:e}){v(u,e),c("size",e)}function E(){if(o.reveal!==!0)return;const{direction:e,position:l,inflectionPoint:j}=t.scroll.value;v(i,e==="up"||l-j<100||t.height.value-a.value-l-u.value<300)}function T(e){Q.value===!0&&v(i,!0),s("focusin",e)}h(()=>o.modelValue,e=>{c("space",e),v(i,!0),t.animate()}),h(m,e=>{c("offset",e)}),h(()=>o.reveal,e=>{e===!1&&v(i,o.modelValue)}),h(i,e=>{t.animate(),s("reveal",e)}),h([u,t.scroll,t.height],E),h(()=>r.screen.height,e=>{t.isContainer.value!==!0&&v(f,e)});const x={};return t.instances.footer=x,o.modelValue===!0&&c("size",u.value),c("space",o.modelValue),c("offset",m.value),p(()=>{t.instances.footer===x&&(t.instances.footer=void 0,c("size",0),c("offset",0),c("space",!1))}),()=>{const e=D(w.default,[y(P,{debounce:0,onResize:$})]);return o.elevated===!0&&e.push(y("div",{class:"q-layout__shadow absolute-full overflow-hidden no-pointer-events"})),y("footer",{class:B.value,style:F.value,onFocusin:T},e)}}});export{P as Q,A as a};
