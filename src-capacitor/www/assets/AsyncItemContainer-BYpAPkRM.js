import{ak as q,aL as x,aM as B,d as i,j as c,ap as A,aq as C,cA as z,ar as L,r as Q,cB as M,w as _,as as E,au as g,p as F,ai as w,aR as I,aQ as R,aj as D,b2 as P,aB as $,h as j,b6 as O,z as N,o as H,A as U,b1 as G,E as J,bq as K}from"./index-D7E76tEZ.js";const W=["horizontal","vertical","cell","none"],X=q({name:"QMarkupTable",props:{...x,dense:Boolean,flat:Boolean,bordered:Boolean,square:Boolean,wrapCells:Boolean,separator:{type:String,default:"horizontal",validator:e=>W.includes(e)}},setup(e,{slots:a}){const l=C(),t=B(e,l.proxy.$q),r=i(()=>`q-markup-table q-table__container q-table__card q-table--${e.separator}-separator`+(t.value===!0?" q-table--dark q-table__card--dark q-dark":"")+(e.dense===!0?" q-table--dense":"")+(e.flat===!0?" q-table--flat":"")+(e.bordered===!0?" q-table--bordered":"")+(e.square===!0?" q-table--square":"")+(e.wrapCells===!1?" q-table--no-wrap":""));return()=>c("div",{class:r.value},[c("table",{class:"q-table"},A(a.default))])}});function Y(e,a){return c("div",e,[c("table",{class:"q-table"},a)])}const Z={list:P,table:X},ee=["list","table","__qtable"],re=q({name:"QVirtualScroll",props:{...z,type:{type:String,default:"list",validator:e=>ee.includes(e)},items:{type:Array,default:()=>[]},itemsFn:Function,itemsSize:Number,scrollTarget:L},setup(e,{slots:a,attrs:l}){let t;const r=Q(null),o=i(()=>e.itemsSize>=0&&e.itemsFn!==void 0?parseInt(e.itemsSize,10):Array.isArray(e.items)?e.items.length:0),{virtualScrollSliceRange:n,localResetVirtualScroll:u,padVirtualScroll:y,onVirtualScrollEvt:v}=M({virtualScrollLength:o,getVirtualScrollTarget:T,getVirtualScrollEl:b}),h=i(()=>{if(o.value===0)return[];const s=(k,V)=>({index:n.value.from+V,item:k});return e.itemsFn===void 0?e.items.slice(n.value.from,n.value.to).map(s):e.itemsFn(n.value.from,n.value.to-n.value.from).map(s)}),f=i(()=>"q-virtual-scroll q-virtual-scroll"+(e.virtualScrollHorizontal===!0?"--horizontal":"--vertical")+(e.scrollTarget!==void 0?"":" scroll")),p=i(()=>e.scrollTarget!==void 0?{}:{tabindex:0});_(o,()=>{u()}),_(()=>e.scrollTarget,()=>{m(),d()});function b(){return r.value.$el||r.value}function T(){return t}function d(){t=E(b(),e.scrollTarget),t.addEventListener("scroll",v,g.passive)}function m(){t!==void 0&&(t.removeEventListener("scroll",v,g.passive),t=void 0)}function S(){let s=y(e.type==="list"?"div":"tbody",h.value.map(a.default));return a.before!==void 0&&(s=a.before().concat(s)),$(a.after,s)}return F(()=>{u()}),w(()=>{d()}),I(()=>{d()}),R(()=>{m()}),D(()=>{m()}),()=>{if(a.default===void 0){console.error("QVirtualScroll: default scoped slot is required for rendering");return}return e.type==="__qtable"?Y({ref:r,class:"q-table__middle "+f.value},S()):c(Z[e.type],{...l,ref:r,class:[l.class,f.value],...p.value},S)}}}),te=j({__name:"AsyncItemContainer",props:{index:{},itemsList:{},height:{}},setup(e,{expose:a}){a();const l=e,t=O(l,"itemsList"),r=i(()=>{const{index:n}=l;return t.value[n]}),o={props:l,itemsList:t,item:r};return Object.defineProperty(o,"__isScriptSetup",{enumerable:!1,value:!0}),o}});function ae(e,a,l,t,r,o){return H(),U("div",{style:K({height:l.height+"px"})},[t.item?G(e.$slots,"default",{key:0,item:t.item,index:l.index}):J("",!0)],4)}const ne=N(te,[["render",ae],["__file","AsyncItemContainer.vue"]]);export{ne as A,re as Q};
