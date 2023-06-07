var Ie=Object.defineProperty;var ie=Object.getOwnPropertySymbols;var Me=Object.prototype.hasOwnProperty,Be=Object.prototype.propertyIsEnumerable;var se=(e,v,d)=>v in e?Ie(e,v,{enumerable:!0,configurable:!0,writable:!0,value:d}):e[v]=d,Q=(e,v)=>{for(var d in v||(v={}))Me.call(v,d)&&se(e,d,v[d]);if(ie)for(var d of ie(v))Be.call(v,d)&&se(e,d,v[d]);return e};import{u as Ae,a as $e}from"./use-router-link.ae62ab1e.js";import{Q as D}from"./QIcon.b994d6a9.js";import{R as Pe}from"./Ripple.d018c11c.js";import{a as Fe,c as ve,h as Qe}from"./render.4975c230.js";import{a as Ee,as as be,r as T,c as b,y as he,o as We,Q as Ke,h as _,ag as Ne,a5 as Ve,M as je,g as ge,w as B,z as ue,v as ze,O as Oe,P as De,R as O,_ as He,m as Ue,n as Ge,W as ce,f as Xe,at as Je}from"./index.e5e5ad80.js";import{Q as Ye,a as Ze}from"./QFooter.e297c729.js";import{a as pe,u as de}from"./use-tick.1b23e170.js";import{r as et}from"./rtl.4b414a6d.js";let tt=0;const at=["click","keydown"],ot={icon:String,label:[Number,String],alert:[Boolean,String],alertIcon:String,name:{type:[Number,String],default:()=>`t_${tt++}`},noCaps:Boolean,tabindex:[String,Number],disable:Boolean,contentClass:String,ripple:{type:[Boolean,Object],default:!0}};function nt(e,v,d,u){const o=Ee(be,()=>{console.error("QTab/QRouteTab component needs to be child of QTabs")}),{proxy:A}=ge(),$=T(null),E=T(null),W=T(null),q=b(()=>e.disable===!0||e.ripple===!1?!1:Object.assign({keyCodes:[13,32],early:!0},e.ripple===!0?{}:e.ripple)),h=b(()=>o.currentModel.value===e.name),x=b(()=>"q-tab relative-position self-stretch flex flex-center text-center"+(h.value===!0?" q-tab--active"+(o.tabProps.value.activeClass?" "+o.tabProps.value.activeClass:"")+(o.tabProps.value.activeColor?` text-${o.tabProps.value.activeColor}`:"")+(o.tabProps.value.activeBgColor?` bg-${o.tabProps.value.activeBgColor}`:""):" q-tab--inactive")+(e.icon&&e.label&&o.tabProps.value.inlineLabel===!1?" q-tab--full":"")+(e.noCaps===!0||o.tabProps.value.noCaps===!0?" q-tab--no-caps":"")+(e.disable===!0?" disabled":" q-focusable q-hoverable cursor-pointer")+(u!==void 0&&u.linkClass.value!==""?` ${u.linkClass.value}`:"")),S=b(()=>"q-tab__content self-stretch flex-center relative-position q-anchor--skip non-selectable "+(o.tabProps.value.inlineLabel===!0?"row no-wrap q-tab__content--inline":"column")+(e.contentClass!==void 0?` ${e.contentClass}`:"")),P=b(()=>e.disable===!0||o.hasFocus.value===!0?-1:e.tabindex||0);function L(r,g){if(g!==!0&&$.value!==null&&$.value.focus(),e.disable!==!0){let w;if(u!==void 0)if(u.hasRouterLink.value===!0)w=()=>{r.__qNavigate=!0,o.avoidRouteWatcher=!0;const m=u.navigateToRouterLink(r);m===!1?o.avoidRouteWatcher=!1:m.then(R=>{o.avoidRouteWatcher=!1,R===void 0&&o.updateModel({name:e.name,fromRoute:!0})})};else{d("click",r);return}else w=()=>{o.updateModel({name:e.name,fromRoute:!1})};d("click",r,w),r.defaultPrevented!==!0&&w()}}function F(r){Ne(r,[13,32])?L(r,!0):Ve(r)!==!0&&r.keyCode>=35&&r.keyCode<=40&&r.altKey!==!0&&r.metaKey!==!0&&o.onKbdNavigate(r.keyCode,A.$el)===!0&&je(r),d("keydown",r)}function I(){const r=o.tabProps.value.narrowIndicator,g=[],w=_("div",{ref:W,class:["q-tab__indicator",o.tabProps.value.indicatorClass]});e.icon!==void 0&&g.push(_(D,{class:"q-tab__icon",name:e.icon})),e.label!==void 0&&g.push(_("div",{class:"q-tab__label"},e.label)),e.alert!==!1&&g.push(e.alertIcon!==void 0?_(D,{class:"q-tab__alert-icon",color:e.alert!==!0?e.alert:void 0,name:e.alertIcon}):_("div",{class:"q-tab__alert"+(e.alert!==!0?` text-${e.alert}`:"")})),r===!0&&g.push(w);const m=[_("div",{class:"q-focus-helper",tabindex:-1,ref:$}),_("div",{class:S.value},Fe(v.default,g))];return r===!1&&m.push(w),m}const C={name:b(()=>e.name),rootRef:E,tabIndicatorRef:W,routerProps:u};he(()=>{o.unregisterTab(C),o.recalculateScroll()}),We(()=>{o.registerTab(C),o.recalculateScroll()});function M(r,g){const w=Q({ref:E,class:x.value,tabindex:P.value,role:"tab","aria-selected":h.value===!0?"true":"false","aria-disabled":e.disable===!0?"true":void 0,onClick:L,onKeydown:F},g);return Ke(_(r,w,I()),[[Pe,q.value]])}return{renderTab:M,$tabs:o}}var wt=ve({name:"QRouteTab",props:Q(Q({},Ae),ot),emits:at,setup(e,{slots:v,emit:d}){const u=$e(),{renderTab:o,$tabs:A}=nt(e,v,d,Q({exact:b(()=>e.exact)},u));return B(()=>e.name+e.exact+(u.linkRoute.value||{}).href,()=>{A.verifyRouteModel()}),()=>o(u.linkTag.value,u.linkProps.value)}});function lt(e,v,d){const u=d===!0?["left","right"]:["top","bottom"];return`absolute-${v===!0?u[0]:u[1]}${e?` text-${e}`:""}`}const rt=["left","center","right","justify"],fe=()=>{};var it=ve({name:"QTabs",props:{modelValue:[Number,String],align:{type:String,default:"center",validator:e=>rt.includes(e)},breakpoint:{type:[String,Number],default:600},vertical:Boolean,shrink:Boolean,stretch:Boolean,activeClass:String,activeColor:String,activeBgColor:String,indicatorColor:String,leftIcon:String,rightIcon:String,outsideArrows:Boolean,mobileArrows:Boolean,switchIndicator:Boolean,narrowIndicator:Boolean,inlineLabel:Boolean,noCaps:Boolean,dense:Boolean,contentClass:String,"onUpdate:modelValue":[Function,Array]},setup(e,{slots:v,emit:d}){const u=ge(),{proxy:{$q:o}}=u,{registerTick:A}=pe(),{registerTimeout:$,removeTimeout:E}=de(),{registerTimeout:W}=de(),q=T(null),h=T(null),x=T(e.modelValue),S=T(!1),P=T(!0),L=T(!1),F=T(!1),I=b(()=>o.platform.is.desktop===!0||e.mobileArrows===!0),C=[],M=T(!1);let r=!1,g,w,m,R=I.value===!0?p:ue;const me=b(()=>({activeClass:e.activeClass,activeColor:e.activeColor,activeBgColor:e.activeBgColor,indicatorClass:lt(e.indicatorColor,e.switchIndicator,e.vertical),narrowIndicator:e.narrowIndicator,inlineLabel:e.inlineLabel,noCaps:e.noCaps})),_e=b(()=>`q-tabs__content--align-${S.value===!0?"left":F.value===!0?"justify":e.align}`),we=b(()=>`q-tabs row no-wrap items-center q-tabs--${S.value===!0?"":"not-"}scrollable q-tabs--${e.vertical===!0?"vertical":"horizontal"} q-tabs__arrows--${I.value===!0&&e.outsideArrows===!0?"outside":"inside"}`+(e.dense===!0?" q-tabs--dense":"")+(e.shrink===!0?" col-shrink":"")+(e.stretch===!0?" self-stretch":"")),Te=b(()=>"q-tabs__content row no-wrap items-center self-stretch hide-scrollbar relative-position "+_e.value+(e.contentClass!==void 0?` ${e.contentClass}`:"")+(o.platform.is.mobile===!0?" scroll":"")),K=b(()=>e.vertical===!0?{container:"height",content:"offsetHeight",scroll:"scrollHeight"}:{container:"width",content:"offsetWidth",scroll:"scrollWidth"}),N=b(()=>e.vertical!==!0&&o.lang.rtl===!0),H=b(()=>et===!1&&N.value===!0);B(N,R),B(()=>e.modelValue,t=>{U({name:t,setCurrent:!0,skipEmit:!0})}),B(()=>e.outsideArrows,()=>{O(V())}),B(I,t=>{R=t===!0?p:ue,O(V())});function U({name:t,setCurrent:a,skipEmit:n,fromRoute:s}){x.value!==t&&(n!==!0&&d("update:modelValue",t),(a===!0||e["onUpdate:modelValue"]===void 0)&&(Ce(x.value,t),x.value=t)),s!==void 0&&(r=s)}function V(){A(()=>{u.isDeactivated!==!0&&u.isUnmounted!==!0&&Z({width:q.value.offsetWidth,height:q.value.offsetHeight})})}function Z(t){if(K.value===void 0||h.value===null)return;const a=t[K.value.container],n=Math.min(h.value[K.value.scroll],Array.prototype.reduce.call(h.value.children,(l,c)=>l+(c[K.value.content]||0),0)),s=a>0&&n>a;S.value!==s&&(S.value=s),s===!0&&O(R);const f=a<parseInt(e.breakpoint,10);F.value!==f&&(F.value=f)}function Ce(t,a){const n=t!=null&&t!==""?C.find(f=>f.name.value===t):null,s=a!=null&&a!==""?C.find(f=>f.name.value===a):null;if(n&&s){const f=n.tabIndicatorRef.value,l=s.tabIndicatorRef.value;clearTimeout(g),f.style.transition="none",f.style.transform="none",l.style.transition="none",l.style.transform="none";const c=f.getBoundingClientRect(),i=l.getBoundingClientRect();l.style.transform=e.vertical===!0?`translate3d(0,${c.top-i.top}px,0) scale3d(1,${i.height?c.height/i.height:1},1)`:`translate3d(${c.left-i.left}px,0,0) scale3d(${i.width?c.width/i.width:1},1,1)`,O(()=>{g=setTimeout(()=>{l.style.transition="transform .25s cubic-bezier(.4, 0, .2, 1)",l.style.transform="none"},70)})}s&&S.value===!0&&j(s.rootRef.value)}function j(t){const{left:a,width:n,top:s,height:f}=h.value.getBoundingClientRect(),l=t.getBoundingClientRect();let c=e.vertical===!0?l.top-s:l.left-a;if(c<0){h.value[e.vertical===!0?"scrollTop":"scrollLeft"]+=Math.floor(c),R();return}c+=e.vertical===!0?l.height-f:l.width-n,c>0&&(h.value[e.vertical===!0?"scrollTop":"scrollLeft"]+=Math.ceil(c),R())}function p(){const t=h.value;if(t!==null){const a=t.getBoundingClientRect(),n=e.vertical===!0?t.scrollTop:Math.abs(t.scrollLeft);N.value===!0?(P.value=Math.ceil(n+a.width)<t.scrollWidth-1,L.value=n>0):(P.value=n>0,L.value=e.vertical===!0?Math.ceil(n+a.height)<t.scrollHeight:Math.ceil(n+a.width)<t.scrollWidth)}}function ee(t){k(),oe(t),w=setInterval(()=>{oe(t)===!0&&k()},5)}function te(){ee(H.value===!0?Number.MAX_SAFE_INTEGER:0)}function ae(){ee(H.value===!0?0:Number.MAX_SAFE_INTEGER)}function k(){clearInterval(w)}function Re(t,a){const n=Array.prototype.filter.call(h.value.children,i=>i===a||i.matches&&i.matches(".q-tab.q-focusable")===!0),s=n.length;if(s===0)return;if(t===36)return j(n[0]),!0;if(t===35)return j(n[s-1]),!0;const f=t===(e.vertical===!0?38:37),l=t===(e.vertical===!0?40:39),c=f===!0?-1:l===!0?1:void 0;if(c!==void 0){const i=N.value===!0?-1:1,y=n.indexOf(a)+c*i;return y>=0&&y<s&&(j(n[y]),n[y].focus({preventScroll:!0})),!0}}const ye=b(()=>H.value===!0?{get:t=>Math.abs(t.scrollLeft),set:(t,a)=>{t.scrollLeft=-a}}:e.vertical===!0?{get:t=>t.scrollTop,set:(t,a)=>{t.scrollTop=a}}:{get:t=>t.scrollLeft,set:(t,a)=>{t.scrollLeft=a}});function oe(t){const a=h.value,{get:n,set:s}=ye.value;let f=!1,l=n(a);const c=t<l?-1:1;return l+=c*5,l<0?(f=!0,l=0):(c===-1&&l<=t||c===1&&l>=t)&&(f=!0,l=t),s(a,l),R(),f}function G(){return C.filter(t=>t.routerProps!==void 0&&t.routerProps.hasRouterLink.value===!0)}function ke(){let t=null,a=r;const n={matchedLen:0,hrefLen:0,exact:!1,found:!1},{hash:s}=u.proxy.$route,f=x.value;let l=a===!0?fe:i=>{f===i.name.value&&(a=!0,l=fe)};const c=G();for(const i of c){const y=i.routerProps.exact.value===!0;if(i.routerProps[y===!0?"linkIsExactActive":"linkIsActive"].value!==!0||n.exact===!0&&y!==!0){l(i);continue}const X=i.routerProps.linkRoute.value,J=X.hash;if(y===!0){if(s===J){t=i.name.value;break}else if(s!==""&&J!==""){l(i);continue}}const Y=X.matched.length,re=X.href.length-J.length;if(Y===n.matchedLen?re>n.hrefLen:Y>n.matchedLen){t=i.name.value,Object.assign(n,{matchedLen:Y,hrefLen:re,exact:y});continue}l(i)}(a===!0||t!==null)&&U({name:t,setCurrent:!0,fromRoute:!0})}function qe(t){if(E(),M.value!==!0&&q.value!==null&&t.target&&typeof t.target.closest=="function"){const a=t.target.closest(".q-tab");a&&q.value.contains(a)===!0&&(M.value=!0)}}function xe(){$(()=>{M.value=!1},30)}function z(){ne.avoidRouteWatcher!==!0&&W(ke)}function Se(t){C.push(t),G().length>0&&(m===void 0&&(m=B(()=>u.proxy.$route,z)),z())}function Le(t){C.splice(C.indexOf(t),1),m!==void 0&&(G().length===0&&(m(),m=void 0),z())}const ne={currentModel:x,tabProps:me,hasFocus:M,registerTab:Se,unregisterTab:Le,verifyRouteModel:z,updateModel:U,recalculateScroll:V,onKbdNavigate:Re,avoidRouteWatcher:!1};ze(be,ne),he(()=>{clearTimeout(g),m!==void 0&&m()});let le=!1;return Oe(()=>{le=!0}),De(()=>{le===!0&&V()}),()=>{const t=[_(Ye,{onResize:Z}),_("div",{ref:h,class:Te.value,onScroll:R},Qe(v.default))];return I.value===!0&&t.push(_(D,{class:"q-tabs__arrow q-tabs__arrow--left absolute q-tab__icon"+(P.value===!0?"":" q-tabs__arrow--faded"),name:e.leftIcon||o.iconSet.tabs[e.vertical===!0?"up":"left"],onMousedown:te,onTouchstartPassive:te,onMouseup:k,onMouseleave:k,onTouchend:k}),_(D,{class:"q-tabs__arrow q-tabs__arrow--right absolute q-tab__icon"+(L.value===!0?"":" q-tabs__arrow--faded"),name:e.rightIcon||o.iconSet.tabs[e.vertical===!0?"down":"right"],onMousedown:ae,onTouchstartPassive:ae,onMouseup:k,onMouseleave:k,onTouchend:k})),_("div",{ref:q,class:we.value,role:"tablist",onFocusin:qe,onFocusout:xe},t)}}});const st={};function ut(e,v){return Ue(),Ge(Ze,{class:"no-shadow modeline"},{default:ce(()=>[Xe(it,{"inline-label":"","indicator-color":"red"},{default:ce(()=>[Je(e.$slots,"default")]),_:3})]),_:3})}var Tt=He(st,[["render",ut]]);export{Tt as M,wt as Q};
