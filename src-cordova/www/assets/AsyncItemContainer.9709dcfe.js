var z=Object.defineProperty,Q=Object.defineProperties;var A=Object.getOwnPropertyDescriptors;var h=Object.getOwnPropertySymbols;var E=Object.prototype.hasOwnProperty,F=Object.prototype.propertyIsEnumerable;var y=(e,t,a)=>t in e?z(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a,u=(e,t)=>{for(var a in t||(t={}))E.call(t,a)&&y(e,a,t[a]);if(h)for(var a of h(t))F.call(t,a)&&y(e,a,t[a]);return e},d=(e,t)=>Q(e,A(t));import{Q as M}from"./QList.ddb6ee58.js";import{u as w,a as D}from"./use-dark.c0d4b15f.js";import{q as p,e as s,l as c,x as R,y as $,r as I,w as _,A as N,E as k,aj as O,B as P,Y as j,X as H,C as U,L as X,k as Y,a9 as G,o as J,a3 as K,an as W,ac as Z,aL as ee}from"./index.816ed836.js";import{u as te,a as ae}from"./use-virtual-scroll.da17981c.js";const le=["horizontal","vertical","cell","none"];var re=p({name:"QMarkupTable",props:d(u({},w),{dense:Boolean,flat:Boolean,bordered:Boolean,square:Boolean,wrapCells:Boolean,separator:{type:String,default:"horizontal",validator:e=>le.includes(e)}}),setup(e,{slots:t}){const a=$(),r=D(e,a.proxy.$q),l=s(()=>`q-markup-table q-table__container q-table__card q-table--${e.separator}-separator`+(r.value===!0?" q-table--dark q-table__card--dark q-dark":"")+(e.dense===!0?" q-table--dense":"")+(e.flat===!0?" q-table--flat":"")+(e.bordered===!0?" q-table--bordered":"")+(e.square===!0?" q-table--square":"")+(e.wrapCells===!1?" q-table--no-wrap":""));return()=>c("div",{class:l.value},[c("table",{class:"q-table"},R(t.default))])}});function oe(e,t){return c("div",e,[c("table",{class:"q-table"},t)])}const ne={list:M,table:re},se=["list","table","__qtable"];var ve=p({name:"QVirtualScroll",props:d(u({},te),{type:{type:String,default:"list",validator:e=>se.includes(e)},items:{type:Array,default:()=>[]},itemsFn:Function,itemsSize:Number,scrollTarget:{default:void 0}}),setup(e,{slots:t,attrs:a}){let r;const l=I(null),i=s(()=>e.itemsSize>=0&&e.itemsFn!==void 0?parseInt(e.itemsSize,10):Array.isArray(e.items)?e.items.length:0),{virtualScrollSliceRange:o,localResetVirtualScroll:f,padVirtualScroll:T,onVirtualScrollEvt:b}=ae({virtualScrollLength:i,getVirtualScrollTarget:C,getVirtualScrollEl:g}),V=s(()=>{if(i.value===0)return[];const n=(L,x)=>({index:o.value.from+x,item:L});return e.itemsFn===void 0?e.items.slice(o.value.from,o.value.to).map(n):e.itemsFn(o.value.from,o.value.to-o.value.from).map(n)}),S=s(()=>"q-virtual-scroll q-virtual-scroll"+(e.virtualScrollHorizontal===!0?"--horizontal":"--vertical")+(e.scrollTarget!==void 0?"":" scroll")),B=s(()=>e.scrollTarget!==void 0?{}:{tabindex:0});_(i,()=>{f()}),_(()=>e.scrollTarget,()=>{v(),m()});function g(){return l.value.$el||l.value}function C(){return r}function m(){r=N(g(),e.scrollTarget),r.addEventListener("scroll",b,k.passive)}function v(){r!==void 0&&(r.removeEventListener("scroll",b,k.passive),r=void 0)}function q(){let n=T(e.type==="list"?"div":"tbody",V.value.map(t.default));return t.before!==void 0&&(n=t.before().concat(n)),X(t.after,n)}return O(()=>{f()}),P(()=>{m()}),j(()=>{m()}),H(()=>{v()}),U(()=>{v()}),()=>{if(t.default===void 0){console.error("QVirtualScroll: default scoped slot is required for rendering");return}return e.type==="__qtable"?oe({ref:l,class:"q-table__middle "+S.value},q()):c(ne[e.type],u(d(u({},a),{ref:l,class:[a.class,S.value]}),B.value),q)}}});const fe=Y({__name:"AsyncItemContainer",props:{index:{},itemsList:{},height:{}},setup(e){const t=e,a=G(t,"itemsList"),r=s(()=>{const{index:l}=t;return a.value[l]});return(l,i)=>(J(),K("div",{style:ee({height:l.height+"px"})},[r.value?W(l.$slots,"default",{key:0,item:r.value,index:l.index}):Z("",!0)],4))}});export{ve as Q,fe as _};
