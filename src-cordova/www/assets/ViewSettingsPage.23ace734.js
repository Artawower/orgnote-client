var N=Object.defineProperty,U=Object.defineProperties;var K=Object.getOwnPropertyDescriptors;var q=Object.getOwnPropertySymbols;var W=Object.prototype.hasOwnProperty,X=Object.prototype.propertyIsEnumerable;var $=(t,a,e)=>a in t?N(t,a,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[a]=e,f=(t,a)=>{for(var e in a||(a={}))W.call(a,e)&&$(t,e,a[e]);if(q)for(var e of q(a))X.call(a,e)&&$(t,e,a[e]);return t},k=(t,a)=>U(t,K(a));import{a as G,u as H,Q as J}from"./QIcon.b994d6a9.js";import{a as Y,u as Z}from"./use-dark.0793a78f.js";import{r as M,c as r,h as d,au as m,g as ee,M as w,S as te,u as oe,a8 as ae,m as h,V,X as le,a1 as ne,f as D,p as v,W as re}from"./index.e5e5ad80.js";import{f as se,i as ue,Q as ie}from"./QSelect.f91c297e.js";import{a as ce,h as de,c as fe}from"./render.4975c230.js";import"./QField.3e6b5ffc.js";import"./QSpinner.6600b362.js";import"./QBtn.4b568f31.js";import"./Ripple.d018c11c.js";import"./use-router-link.ae62ab1e.js";import"./QItemLabel.2ee668c1.js";import"./use-tick.1b23e170.js";import"./use-virtual-scroll.b23a5633.js";import"./rtl.4b414a6d.js";function me(t,a){const e=M(null),s=r(()=>t.disable===!0?null:d("span",{ref:e,class:"no-outline",tabindex:-1}));function u(l){const n=a.value;l!==void 0&&l.type.indexOf("key")===0?n!==null&&document.activeElement!==n&&n.contains(document.activeElement)===!0&&n.focus():e.value!==null&&(l===void 0||n!==null&&n.contains(l.target)===!0)&&e.value.focus()}return{refocusTargetEl:s,refocusTarget:u}}var ve={xs:30,sm:35,md:40,lg:50,xl:60};const ge=k(f(f(f({},Z),H),se),{modelValue:{required:!0,default:null},val:{},trueValue:{default:!0},falseValue:{default:!1},indeterminateValue:{default:null},checkedIcon:String,uncheckedIcon:String,indeterminateIcon:String,toggleOrder:{type:String,validator:t=>t==="tf"||t==="ft"},toggleIndeterminate:Boolean,label:String,leftLabel:Boolean,color:String,keepColor:Boolean,dense:Boolean,disable:Boolean,tabindex:[String,Number]}),pe=["update:modelValue"];function be(t,a){const{props:e,slots:s,emit:u,proxy:l}=ee(),{$q:n}=l,g=Y(e,n),x=M(null),{refocusTargetEl:C,refocusTarget:B}=me(e,x),O=G(e,ve),p=r(()=>e.val!==void 0&&Array.isArray(e.modelValue)),S=r(()=>{const o=m(e.val);return p.value===!0?e.modelValue.findIndex(c=>m(c)===o):-1}),i=r(()=>p.value===!0?S.value>-1:m(e.modelValue)===m(e.trueValue)),b=r(()=>p.value===!0?S.value===-1:m(e.modelValue)===m(e.falseValue)),I=r(()=>i.value===!1&&b.value===!1),P=r(()=>e.disable===!0?-1:e.tabindex||0),T=r(()=>`q-${t} cursor-pointer no-outline row inline no-wrap items-center`+(e.disable===!0?" disabled":"")+(g.value===!0?` q-${t}--dark`:"")+(e.dense===!0?` q-${t}--dense`:"")+(e.leftLabel===!0?" reverse":"")),E=r(()=>{const o=i.value===!0?"truthy":b.value===!0?"falsy":"indet",c=e.color!==void 0&&(e.keepColor===!0||(t==="toggle"?i.value===!0:b.value!==!0))?` text-${e.color}`:"";return`q-${t}__inner relative-position non-selectable q-${t}__inner--${o}${c}`}),Q=r(()=>{const o={type:"checkbox"};return e.name!==void 0&&Object.assign(o,{"^checked":i.value===!0?"checked":void 0,name:e.name,value:p.value===!0?e.val:e.trueValue}),o}),A=ue(Q),R=r(()=>{const o={tabindex:P.value,role:"checkbox","aria-label":e.label,"aria-checked":I.value===!0?"mixed":i.value===!0?"true":"false"};return e.disable===!0&&(o["aria-disabled"]="true"),o});function _(o){o!==void 0&&(w(o),B(o)),e.disable!==!0&&u("update:modelValue",j(),o)}function j(){if(p.value===!0){if(i.value===!0){const o=e.modelValue.slice();return o.splice(S.value,1),o}return e.modelValue.concat([e.val])}if(i.value===!0){if(e.toggleOrder!=="ft"||e.toggleIndeterminate===!1)return e.falseValue}else if(b.value===!0){if(e.toggleOrder==="ft"||e.toggleIndeterminate===!1)return e.trueValue}else return e.toggleOrder!=="ft"?e.trueValue:e.falseValue;return e.indeterminateValue}function z(o){(o.keyCode===13||o.keyCode===32)&&w(o)}function F(o){(o.keyCode===13||o.keyCode===32)&&_(o)}const L=a(i,I);return Object.assign(l,{toggle:_}),()=>{const o=L();e.disable!==!0&&A(o,"unshift",` q-${t}__native absolute q-ma-none q-pa-none`);const c=[d("div",{class:E.value,style:O.value},o)];C.value!==null&&c.push(C.value);const y=e.label!==void 0?ce(s.default,[e.label]):de(s.default);return y!==void 0&&c.push(d("div",{class:`q-${t}__label q-anchor--skip`},y)),d("div",k(f({ref:x,class:T.value},R.value),{onClick:_,onKeydown:z,onKeyup:F}),c)}}var ke=fe({name:"QToggle",props:k(f({},ge),{icon:String,iconColor:String}),emits:pe,setup(t){function a(e,s){const u=r(()=>(e.value===!0?t.checkedIcon:s.value===!0?t.indeterminateIcon:t.uncheckedIcon)||t.icon),l=r(()=>e.value===!0?t.iconColor:null);return()=>[d("div",{class:"q-toggle__track"}),d("div",{class:"q-toggle__thumb absolute flex flex-center no-wrap"},u.value!==void 0?[d(J,{name:u.value,color:l.value})]:void 0)]}return be("toggle",a)}});const he={class:"col-12"},Ve={class:"text-h4"},Se={key:0},_e={key:1},xe={key:2},Re=te({__name:"ViewSettingsPage",setup(t){const a=oe(),e=ae(a),s=[{label:"Light",value:!1},{label:"Dark",value:!0},{label:"System",value:"auto"}],u=l=>{a.setDarkMode(l)};return(l,n)=>(h(),V("div",he,[le("h4",Ve,ne(l.$t("View settings")),1),D(ke,{modelValue:v(a).showUserProfiles,"onUpdate:modelValue":n[0]||(n[0]=g=>v(a).showUserProfiles=g),label:l.$t("Show author profile info")},null,8,["modelValue","label"]),D(ie,{standout:"","onUpdate:modelValue":[u,n[1]||(n[1]=g=>v(e).darkMode=g)],modelValue:v(e).darkMode,options:s,label:"Dark mode","emit-value":"","map-options":""},{selected:re(()=>[v(e).darkMode==="auto"?(h(),V("span",Se,"System")):v(e).darkMode?(h(),V("span",_e,"Dark mode")):(h(),V("span",xe,"Light mode"))]),_:1},8,["modelValue"])]))}});export{Re as default};
