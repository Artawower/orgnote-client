var D=Object.defineProperty,L=Object.defineProperties;var K=Object.getOwnPropertyDescriptors;var I=Object.getOwnPropertySymbols;var N=Object.prototype.hasOwnProperty,M=Object.prototype.propertyIsEnumerable;var S=(a,l,e)=>l in a?D(a,l,{enumerable:!0,configurable:!0,writable:!0,value:e}):a[l]=e,d=(a,l)=>{for(var e in l||(l={}))N.call(l,e)&&S(a,e,l[e]);if(I)for(var e of I(l))M.call(l,e)&&S(a,e,l[e]);return a},k=(a,l)=>L(a,K(l));import{a as G,u as H}from"./use-dark.c0d4b15f.js";import{r as y,e as n,l as m,aB as J,aT as i,L as Q,x as U,aA as W,y as X,V as q}from"./index.816ed836.js";import{d as Y,f as Z}from"./use-form.c4f07f8e.js";function ee(a,l){const e=y(null),f=n(()=>a.disable===!0?null:m("span",{ref:e,class:"no-outline",tabindex:-1}));function g(o){const r=l.value;o!==void 0&&o.type.indexOf("key")===0?r!==null&&document.activeElement!==r&&r.contains(document.activeElement)===!0&&r.focus():e.value!==null&&(o===void 0||r!==null&&r.contains(o.target)===!0)&&e.value.focus()}return{refocusTargetEl:f,refocusTarget:g}}var te={xs:30,sm:35,md:40,lg:50,xl:60};const ue=k(d(d(d({},H),W),Y),{modelValue:{required:!0,default:null},val:{},trueValue:{default:!0},falseValue:{default:!1},indeterminateValue:{default:null},checkedIcon:String,uncheckedIcon:String,indeterminateIcon:String,toggleOrder:{type:String,validator:a=>a==="tf"||a==="ft"},toggleIndeterminate:Boolean,label:String,leftLabel:Boolean,color:String,keepColor:Boolean,dense:Boolean,disable:Boolean,tabindex:[String,Number]}),oe=["update:modelValue"];function se(a,l){const{props:e,slots:f,emit:g,proxy:o}=X(),{$q:r}=o,$=G(e,r),V=y(null),{refocusTargetEl:x,refocusTarget:_}=ee(e,V),O=J(e,te),c=n(()=>e.val!==void 0&&Array.isArray(e.modelValue)),b=n(()=>{const t=i(e.val);return c.value===!0?e.modelValue.findIndex(s=>i(s)===t):-1}),u=n(()=>c.value===!0?b.value>-1:i(e.modelValue)===i(e.trueValue)),v=n(()=>c.value===!0?b.value===-1:i(e.modelValue)===i(e.falseValue)),h=n(()=>u.value===!1&&v.value===!1),T=n(()=>e.disable===!0?-1:e.tabindex||0),A=n(()=>`q-${a} cursor-pointer no-outline row inline no-wrap items-center`+(e.disable===!0?" disabled":"")+($.value===!0?` q-${a}--dark`:"")+(e.dense===!0?` q-${a}--dense`:"")+(e.leftLabel===!0?" reverse":"")),B=n(()=>{const t=u.value===!0?"truthy":v.value===!0?"falsy":"indet",s=e.color!==void 0&&(e.keepColor===!0||(a==="toggle"?u.value===!0:v.value!==!0))?` text-${e.color}`:"";return`q-${a}__inner relative-position non-selectable q-${a}__inner--${t}${s}`}),E=n(()=>{const t={type:"checkbox"};return e.name!==void 0&&Object.assign(t,{"^checked":u.value===!0?"checked":void 0,name:e.name,value:c.value===!0?e.val:e.trueValue}),t}),P=Z(E),j=n(()=>{const t={tabindex:T.value,role:"checkbox","aria-label":e.label,"aria-checked":h.value===!0?"mixed":u.value===!0?"true":"false"};return e.disable===!0&&(t["aria-disabled"]="true"),t});function p(t){t!==void 0&&(q(t),_(t)),e.disable!==!0&&g("update:modelValue",w(),t)}function w(){if(c.value===!0){if(u.value===!0){const t=e.modelValue.slice();return t.splice(b.value,1),t}return e.modelValue.concat([e.val])}if(u.value===!0){if(e.toggleOrder!=="ft"||e.toggleIndeterminate===!1)return e.falseValue}else if(v.value===!0){if(e.toggleOrder==="ft"||e.toggleIndeterminate===!1)return e.trueValue}else return e.toggleOrder!=="ft"?e.trueValue:e.falseValue;return e.indeterminateValue}function z(t){(t.keyCode===13||t.keyCode===32)&&q(t)}function F(t){(t.keyCode===13||t.keyCode===32)&&p(t)}const R=l(u,h);return Object.assign(o,{toggle:p}),()=>{const t=R();e.disable!==!0&&P(t,"unshift",` q-${a}__native absolute q-ma-none q-pa-none`);const s=[m("div",{class:B.value,style:O.value},t)];x.value!==null&&s.push(x.value);const C=e.label!==void 0?Q(f.default,[e.label]):U(f.default);return C!==void 0&&s.push(m("div",{class:`q-${a}__label q-anchor--skip`},C)),m("div",k(d({ref:V,class:A.value},j.value),{onClick:p,onKeydown:z,onKeyup:F}),s)}}export{oe as a,se as b,ue as u};
