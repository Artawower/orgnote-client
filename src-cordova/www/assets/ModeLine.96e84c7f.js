import{q as St,r as h,e as d,D as nt,w as L,a0 as $,v as At,C as Bt,X as Mt,Y as xt,l as R,x as kt,ae as rt,y as It,aO as qt,k as $t,a9 as pt,o as U,f as at,a5 as lt,an as p,a3 as Pt}from"./index.816ed836.js";import{Q as Et,a as Ft}from"./QFooter.7f8dce78.js";import{u as Vt}from"./use-tick.1d64bfca.js";import{u as it}from"./use-timeout.e7de6380.js";import{r as Wt}from"./rtl.4b414a6d.js";function zt(e,S,_){const u=_===!0?["left","right"]:["top","bottom"];return`absolute-${S===!0?u[0]:u[1]}${e?` text-${e}`:""}`}const Ht=["left","center","right","justify"],st=()=>{};var Qt=St({name:"QTabs",props:{modelValue:[Number,String],align:{type:String,default:"center",validator:e=>Ht.includes(e)},breakpoint:{type:[String,Number],default:600},vertical:Boolean,shrink:Boolean,stretch:Boolean,activeClass:String,activeColor:String,activeBgColor:String,indicatorColor:String,leftIcon:String,rightIcon:String,outsideArrows:Boolean,mobileArrows:Boolean,switchIndicator:Boolean,narrowIndicator:Boolean,inlineLabel:Boolean,noCaps:Boolean,dense:Boolean,contentClass:String,"onUpdate:modelValue":[Function,Array]},setup(e,{slots:S,emit:_}){const u=It(),{proxy:{$q:b}}=u,{registerTick:ut}=Vt(),{registerTimeout:ct,removeTimeout:ft}=it(),{registerTimeout:dt}=it(),T=h(null),c=h(null),C=h(e.modelValue),y=h(!1),P=h(!0),E=h(!1),F=h(!1),A=d(()=>b.platform.is.desktop===!0||e.mobileArrows===!0),w=[],B=h(!1);let D=!1,V,X,g,m=A.value===!0?K:nt;const vt=d(()=>({activeClass:e.activeClass,activeColor:e.activeColor,activeBgColor:e.activeBgColor,indicatorClass:zt(e.indicatorColor,e.switchIndicator,e.vertical),narrowIndicator:e.narrowIndicator,inlineLabel:e.inlineLabel,noCaps:e.noCaps})),ht=d(()=>`q-tabs__content--align-${y.value===!0?"left":F.value===!0?"justify":e.align}`),gt=d(()=>`q-tabs row no-wrap items-center q-tabs--${y.value===!0?"":"not-"}scrollable q-tabs--${e.vertical===!0?"vertical":"horizontal"} q-tabs__arrows--${A.value===!0&&e.outsideArrows===!0?"outside":"inside"}`+(e.dense===!0?" q-tabs--dense":"")+(e.shrink===!0?" col-shrink":"")+(e.stretch===!0?" self-stretch":"")),mt=d(()=>"q-tabs__content row no-wrap items-center self-stretch hide-scrollbar relative-position "+ht.value+(e.contentClass!==void 0?` ${e.contentClass}`:"")+(b.platform.is.mobile===!0?" scroll":"")),M=d(()=>e.vertical===!0?{container:"height",content:"offsetHeight",scroll:"scrollHeight"}:{container:"width",content:"offsetWidth",scroll:"scrollWidth"}),x=d(()=>e.vertical!==!0&&b.lang.rtl===!0),W=d(()=>Wt===!1&&x.value===!0);L(x,m),L(()=>e.modelValue,t=>{z({name:t,setCurrent:!0,skipEmit:!0})}),L(()=>e.outsideArrows,()=>{$(k())}),L(A,t=>{m=t===!0?K:nt,$(k())});function z({name:t,setCurrent:o,skipEmit:n,fromRoute:l}){C.value!==t&&(n!==!0&&_("update:modelValue",t),(o===!0||e["onUpdate:modelValue"]===void 0)&&(bt(C.value,t),C.value=t)),l!==void 0&&(D=l)}function k(){ut(()=>{u.isDeactivated!==!0&&u.isUnmounted!==!0&&G({width:T.value.offsetWidth,height:T.value.offsetHeight})})}function G(t){if(M.value===void 0||c.value===null)return;const o=t[M.value.container],n=Math.min(c.value[M.value.scroll],Array.prototype.reduce.call(c.value.children,(r,i)=>r+(i[M.value.content]||0),0)),l=o>0&&n>o;y.value!==l&&(y.value=l),l===!0&&$(m);const s=o<parseInt(e.breakpoint,10);F.value!==s&&(F.value=s)}function bt(t,o){const n=t!=null&&t!==""?w.find(s=>s.name.value===t):null,l=o!=null&&o!==""?w.find(s=>s.name.value===o):null;if(n&&l){const s=n.tabIndicatorRef.value,r=l.tabIndicatorRef.value;clearTimeout(V),s.style.transition="none",s.style.transform="none",r.style.transition="none",r.style.transform="none";const i=s.getBoundingClientRect(),a=r.getBoundingClientRect();r.style.transform=e.vertical===!0?`translate3d(0,${i.top-a.top}px,0) scale3d(1,${a.height?i.height/a.height:1},1)`:`translate3d(${i.left-a.left}px,0,0) scale3d(${a.width?i.width/a.width:1},1,1)`,$(()=>{V=setTimeout(()=>{r.style.transition="transform .25s cubic-bezier(.4, 0, .2, 1)",r.style.transform="none"},70)})}l&&y.value===!0&&I(l.rootRef.value)}function I(t){const{left:o,width:n,top:l,height:s}=c.value.getBoundingClientRect(),r=t.getBoundingClientRect();let i=e.vertical===!0?r.top-l:r.left-o;if(i<0){c.value[e.vertical===!0?"scrollTop":"scrollLeft"]+=Math.floor(i),m();return}i+=e.vertical===!0?r.height-s:r.width-n,i>0&&(c.value[e.vertical===!0?"scrollTop":"scrollLeft"]+=Math.ceil(i),m())}function K(){const t=c.value;if(t!==null){const o=t.getBoundingClientRect(),n=e.vertical===!0?t.scrollTop:Math.abs(t.scrollLeft);x.value===!0?(P.value=Math.ceil(n+o.width)<t.scrollWidth-1,E.value=n>0):(P.value=n>0,E.value=e.vertical===!0?Math.ceil(n+o.height)<t.scrollHeight:Math.ceil(n+o.width)<t.scrollWidth)}}function N(t){v(),Z(t),X=setInterval(()=>{Z(t)===!0&&v()},5)}function J(){N(W.value===!0?Number.MAX_SAFE_INTEGER:0)}function Y(){N(W.value===!0?0:Number.MAX_SAFE_INTEGER)}function v(){clearInterval(X)}function wt(t,o){const n=Array.prototype.filter.call(c.value.children,a=>a===o||a.matches&&a.matches(".q-tab.q-focusable")===!0),l=n.length;if(l===0)return;if(t===36)return I(n[0]),!0;if(t===35)return I(n[l-1]),!0;const s=t===(e.vertical===!0?38:37),r=t===(e.vertical===!0?40:39),i=s===!0?-1:r===!0?1:void 0;if(i!==void 0){const a=x.value===!0?-1:1,f=n.indexOf(o)+i*a;return f>=0&&f<l&&(I(n[f]),n[f].focus({preventScroll:!0})),!0}}const _t=d(()=>W.value===!0?{get:t=>Math.abs(t.scrollLeft),set:(t,o)=>{t.scrollLeft=-o}}:e.vertical===!0?{get:t=>t.scrollTop,set:(t,o)=>{t.scrollTop=o}}:{get:t=>t.scrollLeft,set:(t,o)=>{t.scrollLeft=o}});function Z(t){const o=c.value,{get:n,set:l}=_t.value;let s=!1,r=n(o);const i=t<r?-1:1;return r+=i*5,r<0?(s=!0,r=0):(i===-1&&r<=t||i===1&&r>=t)&&(s=!0,r=t),l(o,r),m(),s}function H(){return w.filter(t=>t.routerProps!==void 0&&t.routerProps.hasRouterLink.value===!0)}function Tt(){let t=null,o=D;const n={matchedLen:0,hrefLen:0,exact:!1,found:!1},{hash:l}=u.proxy.$route,s=C.value;let r=o===!0?st:a=>{s===a.name.value&&(o=!0,r=st)};const i=H();for(const a of i){const f=a.routerProps.exact.value===!0;if(a.routerProps[f===!0?"linkIsExactActive":"linkIsActive"].value!==!0||n.exact===!0&&f!==!0){r(a);continue}const Q=a.routerProps.linkRoute.value,j=Q.hash;if(f===!0){if(l===j){t=a.name.value;break}else if(l!==""&&j!==""){r(a);continue}}const O=Q.matched.length,ot=Q.href.length-j.length;if(O===n.matchedLen?ot>n.hrefLen:O>n.matchedLen){t=a.name.value,Object.assign(n,{matchedLen:O,hrefLen:ot,exact:f});continue}r(a)}(o===!0||t!==null)&&z({name:t,setCurrent:!0,fromRoute:!0})}function Ct(t){if(ft(),B.value!==!0&&T.value!==null&&t.target&&typeof t.target.closest=="function"){const o=t.target.closest(".q-tab");o&&T.value.contains(o)===!0&&(B.value=!0)}}function yt(){ct(()=>{B.value=!1},30)}function q(){tt.avoidRouteWatcher!==!0&&dt(Tt)}function Lt(t){w.push(t),H().length>0&&(g===void 0&&(g=L(()=>u.proxy.$route,q)),q())}function Rt(t){w.splice(w.indexOf(t),1),g!==void 0&&(H().length===0&&(g(),g=void 0),q())}const tt={currentModel:C,tabProps:vt,hasFocus:B,registerTab:Lt,unregisterTab:Rt,verifyRouteModel:q,updateModel:z,recalculateScroll:k,onKbdNavigate:wt,avoidRouteWatcher:!1};At(qt,tt),Bt(()=>{clearTimeout(V),g!==void 0&&g()});let et=!1;return Mt(()=>{et=!0}),xt(()=>{et===!0&&k()}),()=>{const t=[R(Et,{onResize:G}),R("div",{ref:c,class:mt.value,onScroll:m},kt(S.default))];return A.value===!0&&t.push(R(rt,{class:"q-tabs__arrow q-tabs__arrow--left absolute q-tab__icon"+(P.value===!0?"":" q-tabs__arrow--faded"),name:e.leftIcon||b.iconSet.tabs[e.vertical===!0?"up":"left"],onMousedown:J,onTouchstartPassive:J,onMouseup:v,onMouseleave:v,onTouchend:v}),R(rt,{class:"q-tabs__arrow q-tabs__arrow--right absolute q-tab__icon"+(E.value===!0?"":" q-tabs__arrow--faded"),name:e.rightIcon||b.iconSet.tabs[e.vertical===!0?"down":"right"],onMousedown:Y,onTouchstartPassive:Y,onMouseup:v,onMouseleave:v,onTouchend:v})),R("div",{ref:T,class:gt.value,role:"tablist",onFocusin:Ct,onFocusout:yt},t)}}});const jt={key:1,class:"footer-content q-px-lg"},Kt=$t({__name:"ModeLine",props:{tabMode:{type:Boolean,default:!0}},setup(e){const _=pt(e,"tabMode");return(u,b)=>(U(),at(Ft,{class:"no-shadow modeline"},{default:lt(()=>[_.value?(U(),at(Qt,{key:0,"inline-label":"","indicator-color":"red"},{default:lt(()=>[p(u.$slots,"default")]),_:3})):(U(),Pt("div",jt,[p(u.$slots,"left"),p(u.$slots,"middle"),p(u.$slots,"right")]))]),_:3}))}});export{Kt as _};