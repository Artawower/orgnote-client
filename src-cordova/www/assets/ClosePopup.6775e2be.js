import{u as K,a as j,c as Re}from"./selection.f044c102.js";import{j as z,aQ as Oe,aR as Ke,r as E,a as g,h as y,n as P,aA as te,a6 as Y,aS as je,m as ne,w as H,aT as Ne,v as Ee,U as Z,O as Te,x as N,aU as $e,as as Ue,aV as I,G as Ge,ar as Xe,a5 as Ye,aw as ce,aq as he,aW as ge,aX as Ze,z as se,aY as X,F as Je,a8 as et,aN as tt,aZ as nt,a_ as lt,D as at,a$ as ot,s as it,a1 as ut,av as st,H as rt,b0 as ct}from"./index.446b2176.js";var Gt=z({name:"QItem",props:{...K,...Oe,tag:{type:String,default:"div"},active:{type:Boolean,default:null},clickable:Boolean,dense:Boolean,insetLevel:Number,tabindex:[String,Number],focused:Boolean,manualFocus:Boolean},emits:["click","keyup"],setup(e,{slots:n,emit:t}){const{proxy:{$q:l}}=P(),a=j(e,l),{hasLink:u,linkAttrs:o,linkClass:c,linkTag:d,navigateOnClick:v}=Ke(),s=E(null),p=E(null),x=g(()=>e.clickable===!0||u.value===!0||e.tag==="label"),i=g(()=>e.disable!==!0&&x.value===!0),r=g(()=>"q-item q-item-type row no-wrap"+(e.dense===!0?" q-item--dense":"")+(a.value===!0?" q-item--dark":"")+(u.value===!0&&e.active===null?c.value:e.active===!0?` q-item--active${e.activeClass!==void 0?` ${e.activeClass}`:""}`:"")+(e.disable===!0?" disabled":"")+(i.value===!0?" q-item--clickable q-link cursor-pointer "+(e.manualFocus===!0?"q-manual-focusable":"q-focusable q-hoverable")+(e.focused===!0?" q-manual-focusable--focused":""):"")),w=g(()=>{if(e.insetLevel===void 0)return null;const f=l.lang.rtl===!0?"Right":"Left";return{["padding"+f]:16+e.insetLevel*56+"px"}});function C(f){i.value===!0&&(p.value!==null&&(f.qKeyEvent!==!0&&document.activeElement===s.value?p.value.focus():document.activeElement===p.value&&s.value.focus()),v(f))}function T(f){if(i.value===!0&&te(f,13)===!0){Y(f),f.qKeyEvent=!0;const S=new MouseEvent("click",f);S.qKeyEvent=!0,s.value.dispatchEvent(S)}t("keyup",f)}function h(){const f=je(n.default,[]);return i.value===!0&&f.unshift(y("div",{class:"q-focus-helper",tabindex:-1,ref:p})),f}return()=>{const f={ref:s,class:r.value,style:w.value,role:"listitem",onClick:C,onKeyup:T};return i.value===!0?(f.tabindex=e.tabindex||"0",Object.assign(f,o.value)):x.value===!0&&(f["aria-disabled"]="true"),y(d.value,f,h())}}}),Xt=z({name:"QItemSection",props:{avatar:Boolean,thumbnail:Boolean,side:Boolean,top:Boolean,noWrap:Boolean},setup(e,{slots:n}){const t=g(()=>`q-item__section column q-item__section--${e.avatar===!0||e.side===!0||e.thumbnail===!0?"side":"main"}`+(e.top===!0?" q-item__section--top justify-start":" justify-center")+(e.avatar===!0?" q-item__section--avatar":"")+(e.thumbnail===!0?" q-item__section--thumbnail":"")+(e.noWrap===!0?" q-item__section--nowrap":""));return()=>y("div",{class:t.value},ne(n.default))}}),Yt=z({name:"QList",props:{...K,bordered:Boolean,dense:Boolean,separator:Boolean,padding:Boolean,tag:{type:String,default:"div"}},setup(e,{slots:n}){const t=P(),l=j(e,t.proxy.$q),a=g(()=>"q-list"+(e.bordered===!0?" q-list--bordered":"")+(e.dense===!0?" q-list--dense":"")+(e.separator===!0?" q-list--separator":"")+(l.value===!0?" q-list--dark":"")+(e.padding===!0?" q-list--padding":""));return()=>y(e.tag,{class:a.value},ne(n.default))}});const dt={true:"inset",item:"item-inset","item-thumbnail":"item-thumbnail-inset"},ie={xs:2,sm:4,md:8,lg:16,xl:24};var Zt=z({name:"QSeparator",props:{...K,spaced:[Boolean,String],inset:[Boolean,String],vertical:Boolean,color:String,size:String},setup(e){const n=P(),t=j(e,n.proxy.$q),l=g(()=>e.vertical===!0?"vertical":"horizontal"),a=g(()=>` q-separator--${l.value}`),u=g(()=>e.inset!==!1?`${a.value}-${dt[e.inset]}`:""),o=g(()=>`q-separator${a.value}${u.value}`+(e.color!==void 0?` bg-${e.color}`:"")+(t.value===!0?" q-separator--dark":"")),c=g(()=>{const d={};if(e.size!==void 0&&(d[e.vertical===!0?"width":"height"]=e.size),e.spaced!==!1){const v=e.spaced===!0?`${ie.md}px`:e.spaced in ie?`${ie[e.spaced]}px`:e.spaced,s=e.vertical===!0?["Left","Right"]:["Top","Bottom"];d[`margin${s[0]}`]=d[`margin${s[1]}`]=v}return d});return()=>y("hr",{class:o.value,style:c.value,"aria-orientation":l.value})}});const ft={modelValue:{type:Boolean,default:null},"onUpdate:modelValue":[Function,Array]},vt=["beforeShow","show","beforeHide","hide"];function mt({showing:e,canShow:n,hideOnRouteChange:t,handleShow:l,handleHide:a,processOnMount:u}){const o=P(),{props:c,emit:d,proxy:v}=o;let s;function p(h){e.value===!0?r(h):x(h)}function x(h){if(c.disable===!0||h!==void 0&&h.qAnchorHandled===!0||n!==void 0&&n(h)!==!0)return;const f=c["onUpdate:modelValue"]!==void 0;f===!0&&(d("update:modelValue",!0),s=h,Z(()=>{s===h&&(s=void 0)})),(c.modelValue===null||f===!1)&&i(h)}function i(h){e.value!==!0&&(e.value=!0,d("beforeShow",h),l!==void 0?l(h):d("show",h))}function r(h){if(c.disable===!0)return;const f=c["onUpdate:modelValue"]!==void 0;f===!0&&(d("update:modelValue",!1),s=h,Z(()=>{s===h&&(s=void 0)})),(c.modelValue===null||f===!1)&&w(h)}function w(h){e.value!==!1&&(e.value=!1,d("beforeHide",h),a!==void 0?a(h):d("hide",h))}function C(h){c.disable===!0&&h===!0?c["onUpdate:modelValue"]!==void 0&&d("update:modelValue",!1):h===!0!==e.value&&(h===!0?i:w)(s)}H(()=>c.modelValue,C),t!==void 0&&Ne(o)===!0&&H(()=>v.$route.fullPath,()=>{t.value===!0&&e.value===!0&&r()}),u===!0&&Ee(()=>{C(c.modelValue)});const T={show:x,hide:r,toggle:p};return Object.assign(v,T),T}function ht(){let e=null;const n=P();function t(){e!==null&&(clearTimeout(e),e=null)}return Te(t),N(t),{removeTimeout:t,registerTimeout(l,a){t(),$e(n)===!1&&(e=setTimeout(l,a))}}}function gt(e,n){const t=E(null),l=g(()=>e.disable===!0?null:y("span",{ref:t,class:"no-outline",tabindex:-1}));function a(u){const o=n.value;u!==void 0&&u.type.indexOf("key")===0?o!==null&&document.activeElement!==o&&o.contains(document.activeElement)===!0&&o.focus():t.value!==null&&(u===void 0||o!==null&&o.contains(u.target)===!0)&&t.value.focus()}return{refocusTargetEl:l,refocusTarget:a}}const bt={name:String};function xt(e={}){return(n,t,l)=>{n[t](y("input",{class:"hidden"+(l||""),...e.value}))}}function Jt(e){return g(()=>e.name||e.for)}var pt={xs:30,sm:35,md:40,lg:50,xl:60};const kt={...K,...Xe,...bt,modelValue:{required:!0,default:null},val:{},trueValue:{default:!0},falseValue:{default:!1},indeterminateValue:{default:null},checkedIcon:String,uncheckedIcon:String,indeterminateIcon:String,toggleOrder:{type:String,validator:e=>e==="tf"||e==="ft"},toggleIndeterminate:Boolean,label:String,leftLabel:Boolean,color:String,keepColor:Boolean,dense:Boolean,disable:Boolean,tabindex:[String,Number]},yt=["update:modelValue"];function qt(e,n){const{props:t,slots:l,emit:a,proxy:u}=P(),{$q:o}=u,c=j(t,o),d=E(null),{refocusTargetEl:v,refocusTarget:s}=gt(t,d),p=Ue(t,pt),x=g(()=>t.val!==void 0&&Array.isArray(t.modelValue)),i=g(()=>{const b=I(t.val);return x.value===!0?t.modelValue.findIndex(_=>I(_)===b):-1}),r=g(()=>x.value===!0?i.value>-1:I(t.modelValue)===I(t.trueValue)),w=g(()=>x.value===!0?i.value===-1:I(t.modelValue)===I(t.falseValue)),C=g(()=>r.value===!1&&w.value===!1),T=g(()=>t.disable===!0?-1:t.tabindex||0),h=g(()=>`q-${e} cursor-pointer no-outline row inline no-wrap items-center`+(t.disable===!0?" disabled":"")+(c.value===!0?` q-${e}--dark`:"")+(t.dense===!0?` q-${e}--dense`:"")+(t.leftLabel===!0?" reverse":"")),f=g(()=>{const b=r.value===!0?"truthy":w.value===!0?"falsy":"indet",_=t.color!==void 0&&(t.keepColor===!0||(e==="toggle"?r.value===!0:w.value!==!0))?` text-${t.color}`:"";return`q-${e}__inner relative-position non-selectable q-${e}__inner--${b}${_}`}),S=g(()=>{const b={type:"checkbox"};return t.name!==void 0&&Object.assign(b,{".checked":r.value,"^checked":r.value===!0?"checked":void 0,name:t.name,value:x.value===!0?t.val:t.trueValue}),b}),k=xt(S),L=g(()=>{const b={tabindex:T.value,role:e==="toggle"?"switch":"checkbox","aria-label":t.label,"aria-checked":C.value===!0?"mixed":r.value===!0?"true":"false"};return t.disable===!0&&(b["aria-disabled"]="true"),b});function q(b){b!==void 0&&(Y(b),s(b)),t.disable!==!0&&a("update:modelValue",$(),b)}function $(){if(x.value===!0){if(r.value===!0){const b=t.modelValue.slice();return b.splice(i.value,1),b}return t.modelValue.concat([t.val])}if(r.value===!0){if(t.toggleOrder!=="ft"||t.toggleIndeterminate===!1)return t.falseValue}else if(w.value===!0){if(t.toggleOrder==="ft"||t.toggleIndeterminate===!1)return t.trueValue}else return t.toggleOrder!=="ft"?t.trueValue:t.falseValue;return t.indeterminateValue}function B(b){(b.keyCode===13||b.keyCode===32)&&Y(b)}function U(b){(b.keyCode===13||b.keyCode===32)&&q(b)}const G=n(r,C);return Object.assign(u,{toggle:q}),()=>{const b=G();t.disable!==!0&&k(b,"unshift",` q-${e}__native absolute q-ma-none q-pa-none`);const _=[y("div",{class:f.value,style:p.value,"aria-hidden":"true"},b)];v.value!==null&&_.push(v.value);const Q=t.label!==void 0?Ge(l.default,[t.label]):ne(l.default);return Q!==void 0&&_.push(y("div",{class:`q-${e}__label q-anchor--skip`},Q)),y("div",{ref:d,class:h.value,...L.value,onClick:q,onKeydown:B,onKeyup:U},_)}}const wt=y("div",{key:"svg",class:"q-checkbox__bg absolute"},[y("svg",{class:"q-checkbox__svg fit absolute-full",viewBox:"0 0 24 24"},[y("path",{class:"q-checkbox__truthy",fill:"none",d:"M1.73,12.91 8.1,19.28 22.79,4.59"}),y("path",{class:"q-checkbox__indet",d:"M4,14H20V10H4"})])]);var en=z({name:"QCheckbox",props:kt,emits:yt,setup(e){function n(t,l){const a=g(()=>(t.value===!0?e.checkedIcon:l.value===!0?e.indeterminateIcon:e.uncheckedIcon)||null);return()=>a.value!==null?[y("div",{key:"icon",class:"q-checkbox__icon-container absolute-full flex flex-center no-wrap"},[y(Ye,{class:"q-checkbox__icon",name:a.value})])]:[wt]}return qt("checkbox",n)}});let V=[],O=[];function _e(e){O=O.filter(n=>n!==e)}function Ct(e){_e(e),O.push(e)}function be(e){_e(e),O.length===0&&V.length!==0&&(V[V.length-1](),V=[])}function St(e){O.length===0?e():V.push(e)}function tn(e){V=V.filter(n=>n!==e)}const M=[];function Be(e){M[M.length-1](e)}function Et(e){ce.is.desktop===!0&&(M.push(e),M.length===1&&document.body.addEventListener("focusin",Be))}function Tt(e){const n=M.indexOf(e);n>-1&&(M.splice(n,1),M.length===0&&document.body.removeEventListener("focusin",Be))}const $t={target:{default:!0},noParentEvent:Boolean,contextMenu:Boolean};function _t({showing:e,avoidEmit:n,configureAnchorEl:t}){const{props:l,proxy:a,emit:u}=P(),o=E(null);let c=null;function d(i){return o.value===null?!1:i===void 0||i.touches===void 0||i.touches.length<=1}const v={};t===void 0&&(Object.assign(v,{hide(i){a.hide(i)},toggle(i){a.toggle(i),i.qAnchorHandled=!0},toggleKey(i){te(i,13)===!0&&v.toggle(i)},contextClick(i){a.hide(i),he(i),Z(()=>{a.show(i),i.qAnchorHandled=!0})},prevent:he,mobileTouch(i){if(v.mobileCleanup(i),d(i)!==!0)return;a.hide(i),o.value.classList.add("non-selectable");const r=i.target;ge(v,"anchor",[[r,"touchmove","mobileCleanup","passive"],[r,"touchend","mobileCleanup","passive"],[r,"touchcancel","mobileCleanup","passive"],[o.value,"contextmenu","prevent","notPassive"]]),c=setTimeout(()=>{c=null,a.show(i),i.qAnchorHandled=!0},300)},mobileCleanup(i){o.value.classList.remove("non-selectable"),c!==null&&(clearTimeout(c),c=null),e.value===!0&&i!==void 0&&Re()}}),t=function(i=l.contextMenu){if(l.noParentEvent===!0||o.value===null)return;let r;i===!0?a.$q.platform.is.mobile===!0?r=[[o.value,"touchstart","mobileTouch","passive"]]:r=[[o.value,"mousedown","hide","passive"],[o.value,"contextmenu","contextClick","notPassive"]]:r=[[o.value,"click","toggle","passive"],[o.value,"keyup","toggleKey","passive"]],ge(v,"anchor",r)});function s(){Ze(v,"anchor")}function p(i){for(o.value=i;o.value.classList.contains("q-anchor--skip");)o.value=o.value.parentNode;t()}function x(){if(l.target===!1||l.target===""||a.$el.parentNode===null)o.value=null;else if(l.target===!0)p(a.$el.parentNode);else{let i=l.target;if(typeof l.target=="string")try{i=document.querySelector(l.target)}catch{i=void 0}i!=null?(o.value=i.$el||i,t()):(o.value=null,console.error(`Anchor: target "${l.target}" not found`))}}return H(()=>l.contextMenu,i=>{o.value!==null&&(s(),t(i))}),H(()=>l.target,()=>{o.value!==null&&s(),x()}),H(()=>l.noParentEvent,i=>{o.value!==null&&(i===!0?s():t())}),Ee(()=>{x(),n!==!0&&l.modelValue===!0&&o.value===null&&u("update:modelValue",!1)}),N(()=>{c!==null&&clearTimeout(c),s()}),{anchorEl:o,canShow:d,anchorEvents:v}}function Bt(e,n){const t=E(null);let l;function a(c,d){const v=`${d!==void 0?"add":"remove"}EventListener`,s=d!==void 0?d:l;c!==window&&c[v]("scroll",s,se.passive),window[v]("scroll",s,se.passive),l=d}function u(){t.value!==null&&(a(t.value),t.value=null)}const o=H(()=>e.noParentEvent,()=>{t.value!==null&&(u(),n())});return N(o),{localScrollTarget:t,unconfigureScrollTarget:u,changeScrollEvent:a}}const A=[];function Pt(e){return A.find(n=>n.contentEl!==null&&n.contentEl.contains(e))}function Pe(e,n){do{if(e.$options.name==="QMenu"){if(e.hide(n),e.$props.separateClosePopup===!0)return X(e)}else if(e.__qPortal===!0){const t=X(e);return t!==void 0&&t.$options.name==="QPopupProxy"?(e.hide(n),t):e}e=X(e)}while(e!=null)}function Lt(e,n,t){for(;t!==0&&e!==void 0&&e!==null;){if(e.__qPortal===!0){if(t--,e.$options.name==="QMenu"){e=Pe(e,n);continue}e.hide(n)}e=X(e)}}function Ht(e){for(e=e.parent;e!=null;){if(e.type.name==="QGlobalDialog")return!0;if(e.type.name==="QDialog"||e.type.name==="QMenu")return!1;e=e.parent}return!1}function Vt(e,n,t,l){const a=E(!1),u=E(!1);let o=null;const c={},d=l==="dialog"&&Ht(e);function v(p){if(p===!0){be(c),u.value=!0;return}u.value=!1,a.value===!1&&(d===!1&&o===null&&(o=nt(!1,l)),a.value=!0,A.push(e.proxy),Ct(c))}function s(p){if(u.value=!1,p!==!0)return;be(c),a.value=!1;const x=A.indexOf(e.proxy);x!==-1&&A.splice(x,1),o!==null&&(lt(o),o=null)}return Je(()=>{s(!0)}),e.proxy.__qPortal=!0,et(e.proxy,"contentEl",()=>n.value),{showPortal:v,hidePortal:s,portalIsActive:a,portalIsAccessible:u,renderPortal:()=>d===!0?t():a.value===!0?[y(tt,{to:o},t())]:void 0}}const Mt={transitionShow:{type:String,default:"fade"},transitionHide:{type:String,default:"fade"},transitionDuration:{type:[String,Number],default:300}};function Ft(e,n=()=>{},t=()=>{}){return{transitionProps:g(()=>{const l=`q-transition--${e.transitionShow||n()}`,a=`q-transition--${e.transitionHide||t()}`;return{appear:!0,enterFromClass:`${l}-enter-from`,enterActiveClass:`${l}-enter-active`,enterToClass:`${l}-enter-to`,leaveFromClass:`${a}-leave-from`,leaveActiveClass:`${a}-leave-active`,leaveToClass:`${a}-leave-to`}}),transitionStyle:g(()=>`--q-transition-duration: ${e.transitionDuration}ms`)}}function Wt(){let e;const n=P();function t(){e=void 0}return Te(t),N(t),{removeTick:t,registerTick(l){e=l,Z(()=>{e===l&&($e(n)===!1&&e(),e=void 0)})}}}const F=[];let D;function It(e){D=e.keyCode===27}function At(){D===!0&&(D=!1)}function Dt(e){D===!0&&(D=!1,te(e,27)===!0&&F[F.length-1](e))}function Le(e){window[e]("keydown",It),window[e]("blur",At),window[e]("keyup",Dt),D=!1}function zt(e){ce.is.desktop===!0&&(F.push(e),F.length===1&&Le("addEventListener"))}function xe(e){const n=F.indexOf(e);n>-1&&(F.splice(n,1),F.length===0&&Le("removeEventListener"))}const{notPassiveCapture:J}=se,W=[];function ee(e){const n=e.target;if(n===void 0||n.nodeType===8||n.classList.contains("no-pointer-events")===!0)return;let t=A.length-1;for(;t>=0;){const l=A[t].$;if(l.type.name==="QTooltip"){t--;continue}if(l.type.name!=="QDialog")break;if(l.props.seamless!==!0)return;t--}for(let l=W.length-1;l>=0;l--){const a=W[l];if((a.anchorEl.value===null||a.anchorEl.value.contains(n)===!1)&&(n===document.body||a.innerRef.value!==null&&a.innerRef.value.contains(n)===!1))e.qClickOutside=!0,a.onClickOutside(e);else return}}function Qt(e){W.push(e),W.length===1&&(document.addEventListener("mousedown",ee,J),document.addEventListener("touchstart",ee,J))}function pe(e){const n=W.findIndex(t=>t===e);n>-1&&(W.splice(n,1),W.length===0&&(document.removeEventListener("mousedown",ee,J),document.removeEventListener("touchstart",ee,J)))}let ke,ye;function qe(e){const n=e.split(" ");return n.length!==2?!1:["top","center","bottom"].includes(n[0])!==!0?(console.error("Anchor/Self position must start with one of top/center/bottom"),!1):["left","middle","right","start","end"].includes(n[1])!==!0?(console.error("Anchor/Self position must end with one of left/middle/right/start/end"),!1):!0}function Rt(e){return e?!(e.length!==2||typeof e[0]!="number"||typeof e[1]!="number"):!0}const re={"start#ltr":"left","start#rtl":"right","end#ltr":"right","end#rtl":"left"};["left","middle","right"].forEach(e=>{re[`${e}#ltr`]=e,re[`${e}#rtl`]=e});function we(e,n){const t=e.split(" ");return{vertical:t[0],horizontal:re[`${t[1]}#${n===!0?"rtl":"ltr"}`]}}function Ot(e,n){let{top:t,left:l,right:a,bottom:u,width:o,height:c}=e.getBoundingClientRect();return n!==void 0&&(t-=n[1],l-=n[0],u+=n[1],a+=n[0],o+=n[0],c+=n[1]),{top:t,bottom:u,height:c,left:l,right:a,width:o,middle:l+(a-l)/2,center:t+(u-t)/2}}function Kt(e,n,t){let{top:l,left:a}=e.getBoundingClientRect();return l+=n.top,a+=n.left,t!==void 0&&(l+=t[1],a+=t[0]),{top:l,bottom:l+1,height:1,left:a,right:a+1,width:1,middle:a,center:l}}function jt(e,n){return{top:0,center:n/2,bottom:n,left:0,middle:e/2,right:e}}function Ce(e,n,t,l){return{top:e[t.vertical]-n[l.vertical],left:e[t.horizontal]-n[l.horizontal]}}function He(e,n=0){if(e.targetEl===null||e.anchorEl===null||n>5)return;if(e.targetEl.offsetHeight===0||e.targetEl.offsetWidth===0){setTimeout(()=>{He(e,n+1)},10);return}const{targetEl:t,offset:l,anchorEl:a,anchorOrigin:u,selfOrigin:o,absoluteOffset:c,fit:d,cover:v,maxHeight:s,maxWidth:p}=e;if(ce.is.ios===!0&&window.visualViewport!==void 0){const L=document.body.style,{offsetLeft:q,offsetTop:$}=window.visualViewport;q!==ke&&(L.setProperty("--q-pe-left",q+"px"),ke=q),$!==ye&&(L.setProperty("--q-pe-top",$+"px"),ye=$)}const{scrollLeft:x,scrollTop:i}=t,r=c===void 0?Ot(a,v===!0?[0,0]:l):Kt(a,c,l);Object.assign(t.style,{top:0,left:0,minWidth:null,minHeight:null,maxWidth:p||"100vw",maxHeight:s||"100vh",visibility:"visible"});const{offsetWidth:w,offsetHeight:C}=t,{elWidth:T,elHeight:h}=d===!0||v===!0?{elWidth:Math.max(r.width,w),elHeight:v===!0?Math.max(r.height,C):C}:{elWidth:w,elHeight:C};let f={maxWidth:p,maxHeight:s};(d===!0||v===!0)&&(f.minWidth=r.width+"px",v===!0&&(f.minHeight=r.height+"px")),Object.assign(t.style,f);const S=jt(T,h);let k=Ce(r,S,u,o);if(c===void 0||l===void 0)ue(k,r,S,u,o);else{const{top:L,left:q}=k;ue(k,r,S,u,o);let $=!1;if(k.top!==L){$=!0;const B=2*l[1];r.center=r.top-=B,r.bottom-=B+2}if(k.left!==q){$=!0;const B=2*l[0];r.middle=r.left-=B,r.right-=B+2}$===!0&&(k=Ce(r,S,u,o),ue(k,r,S,u,o))}f={top:k.top+"px",left:k.left+"px"},k.maxHeight!==void 0&&(f.maxHeight=k.maxHeight+"px",r.height>k.maxHeight&&(f.minHeight=f.maxHeight)),k.maxWidth!==void 0&&(f.maxWidth=k.maxWidth+"px",r.width>k.maxWidth&&(f.minWidth=f.maxWidth)),Object.assign(t.style,f),t.scrollTop!==i&&(t.scrollTop=i),t.scrollLeft!==x&&(t.scrollLeft=x)}function ue(e,n,t,l,a){const u=t.bottom,o=t.right,c=at(),d=window.innerHeight-c,v=document.body.clientWidth;if(e.top<0||e.top+u>d)if(a.vertical==="center")e.top=n[l.vertical]>d/2?Math.max(0,d-u):0,e.maxHeight=Math.min(u,d);else if(n[l.vertical]>d/2){const s=Math.min(d,l.vertical==="center"?n.center:l.vertical===a.vertical?n.bottom:n.top);e.maxHeight=Math.min(u,s),e.top=Math.max(0,s-u)}else e.top=Math.max(0,l.vertical==="center"?n.center:l.vertical===a.vertical?n.top:n.bottom),e.maxHeight=Math.min(u,d-e.top);if(e.left<0||e.left+o>v)if(e.maxWidth=Math.min(o,v),a.horizontal==="middle")e.left=n[l.horizontal]>v/2?Math.max(0,v-o):0;else if(n[l.horizontal]>v/2){const s=Math.min(v,l.horizontal==="middle"?n.middle:l.horizontal===a.horizontal?n.right:n.left);e.maxWidth=Math.min(o,s),e.left=Math.max(0,s-e.maxWidth)}else e.left=Math.max(0,l.horizontal==="middle"?n.middle:l.horizontal===a.horizontal?n.left:n.right),e.maxWidth=Math.min(o,v-e.left)}var nn=z({name:"QMenu",inheritAttrs:!1,props:{...$t,...ft,...K,...Mt,persistent:Boolean,autoClose:Boolean,separateClosePopup:Boolean,noRouteDismiss:Boolean,noRefocus:Boolean,noFocus:Boolean,fit:Boolean,cover:Boolean,square:Boolean,anchor:{type:String,validator:qe},self:{type:String,validator:qe},offset:{type:Array,validator:Rt},scrollTarget:{default:void 0},touchPosition:Boolean,maxHeight:{type:String,default:null},maxWidth:{type:String,default:null}},emits:[...vt,"click","escapeKey"],setup(e,{slots:n,emit:t,attrs:l}){let a=null,u,o,c;const d=P(),{proxy:v}=d,{$q:s}=v,p=E(null),x=E(!1),i=g(()=>e.persistent!==!0&&e.noRouteDismiss!==!0),r=j(e,s),{registerTick:w,removeTick:C}=Wt(),{registerTimeout:T}=ht(),{transitionProps:h,transitionStyle:f}=Ft(e),{localScrollTarget:S,changeScrollEvent:k,unconfigureScrollTarget:L}=Bt(e,ve),{anchorEl:q,canShow:$}=_t({showing:x}),{hide:B}=mt({showing:x,canShow:$,handleShow:We,handleHide:Ie,hideOnRouteChange:i,processOnMount:!0}),{showPortal:U,hidePortal:G,renderPortal:b}=Vt(d,p,De,"menu"),_={anchorEl:q,innerRef:p,onClickOutside(m){if(e.persistent!==!0&&x.value===!0)return B(m),(m.type==="touchstart"||m.target.classList.contains("q-dialog__backdrop"))&&Y(m),!0}},Q=g(()=>we(e.anchor||(e.cover===!0?"center middle":"bottom start"),s.lang.rtl)),Ve=g(()=>e.cover===!0?Q.value:we(e.self||"top start",s.lang.rtl)),Me=g(()=>(e.square===!0?" q-menu--square":"")+(r.value===!0?" q-menu--dark q-dark":"")),Fe=g(()=>e.autoClose===!0?{onClick:Ae}:{}),de=g(()=>x.value===!0&&e.persistent!==!0);H(de,m=>{m===!0?(zt(ae),Qt(_)):(xe(ae),pe(_))});function le(){St(()=>{let m=p.value;m&&m.contains(document.activeElement)!==!0&&(m=m.querySelector("[autofocus][tabindex], [data-autofocus][tabindex]")||m.querySelector("[autofocus] [tabindex], [data-autofocus] [tabindex]")||m.querySelector("[autofocus], [data-autofocus]")||m,m.focus({preventScroll:!0}))})}function We(m){if(a=e.noRefocus===!1?document.activeElement:null,Et(me),U(),ve(),u=void 0,m!==void 0&&(e.touchPosition||e.contextMenu)){const oe=ot(m);if(oe.left!==void 0){const{top:ze,left:Qe}=q.value.getBoundingClientRect();u={left:oe.left-Qe,top:oe.top-ze}}}o===void 0&&(o=H(()=>s.screen.width+"|"+s.screen.height+"|"+e.self+"|"+e.anchor+"|"+s.lang.rtl,R)),e.noFocus!==!0&&document.activeElement.blur(),w(()=>{R(),e.noFocus!==!0&&le()}),T(()=>{s.platform.is.ios===!0&&(c=e.autoClose,p.value.click()),R(),U(!0),t("show",m)},e.transitionDuration)}function Ie(m){C(),G(),fe(!0),a!==null&&(m===void 0||m.qClickOutside!==!0)&&(((m&&m.type.indexOf("key")===0?a.closest('[tabindex]:not([tabindex^="-"])'):void 0)||a).focus(),a=null),T(()=>{G(!0),t("hide",m)},e.transitionDuration)}function fe(m){u=void 0,o!==void 0&&(o(),o=void 0),(m===!0||x.value===!0)&&(Tt(me),L(),pe(_),xe(ae)),m!==!0&&(a=null)}function ve(){(q.value!==null||e.scrollTarget!==void 0)&&(S.value=it(q.value,e.scrollTarget),k(S.value,R))}function Ae(m){c!==!0?(Pe(v,m),t("click",m)):c=!1}function me(m){de.value===!0&&e.noFocus!==!0&&st(p.value,m.target)!==!0&&le()}function ae(m){t("escapeKey"),B(m)}function R(){He({targetEl:p.value,offset:e.offset,anchorEl:q.value,anchorOrigin:Q.value,selfOrigin:Ve.value,absoluteOffset:u,fit:e.fit,cover:e.cover,maxHeight:e.maxHeight,maxWidth:e.maxWidth})}function De(){return y(ut,h.value,()=>x.value===!0?y("div",{role:"menu",...l,ref:p,tabindex:-1,class:["q-menu q-position-engine scroll"+Me.value,l.class],style:[l.style,f.value],...Fe.value},ne(n.default)):null)}return N(fe),Object.assign(v,{focus:le,updatePosition:R}),b}});const ln=rt("view",()=>{const e=E(!1),n=E(0),t=E("float"),l=g(()=>n.value>0);return{tile:e,loadingCount:n,hasGlobalLoading:l,toggleTile:()=>e.value=!e.value,addLoading:()=>n.value+=1,removeLoading:()=>n.value-=1,completionPosition:t}},{persist:!0});function Se(e){if(e===!1)return 0;if(e===!0||e===void 0)return 1;const n=parseInt(e,10);return isNaN(n)?0:n}var an=ct({name:"close-popup",beforeMount(e,{value:n}){const t={depth:Se(n),handler(l){t.depth!==0&&setTimeout(()=>{const a=Pt(e);a!==void 0&&Lt(a,l,t.depth)})},handlerKey(l){te(l,13)===!0&&t.handler(l)}};e.__qclosepopup=t,e.addEventListener("click",t.handler),e.addEventListener("keyup",t.handlerKey)},updated(e,{value:n,oldValue:t}){n!==t&&(e.__qclosepopup.depth=Se(n))},beforeUnmount(e){const n=e.__qclosepopup;e.removeEventListener("click",n.handler),e.removeEventListener("keyup",n.handlerKey),delete e.__qclosepopup}});export{qe as A,Rt as B,an as C,we as D,Bt as E,_t as F,pe as G,He as H,Qt as I,en as Q,vt as a,ht as b,mt as c,Gt as d,Xt as e,Yt as f,St as g,Mt as h,Wt as i,Ft as j,Vt as k,Et as l,zt as m,Tt as n,xe as o,bt as p,Jt as q,tn as r,nn as s,kt as t,ft as u,yt as v,qt as w,Zt as x,ln as y,$t as z};