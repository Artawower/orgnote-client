import{Q as C,A as R}from"./AsyncItemContainer-FgOSI8Qz.js";import{u as T}from"./view-bF3BCiVJ.js";import{h as I,b6 as n,d as Q,q,r as _,k as F,bd as L,w as x,ai as j,z as E,o as P,A as O,e as D,a2 as z,F as k,B as M,a7 as p,E as W}from"./index-DftpuOf4.js";import{P as G}from"./PublicNotePreview-CJFslqNi.js";const H=I({__name:"NoteList",props:{selectable:{type:Boolean},limit:{},offset:{},total:{},notes:{},fetchNotes:{},scrollTarget:{},height:{default:230}},setup(w,{expose:g}){g();const t=w,e=n(t,"selectable"),N=n(t,"limit"),s=n(t,"total"),u=n(t,"notes"),o=T(),f=Q(()=>o.tile),b=q(),a=_(null),S=F(),V=L(t.fetchNotes,300),d=_(0);x(()=>d.value,l=>b.replace({query:{from:l}}));const m=+S.query.from||0,A=(l,c)=>{const v=Object.freeze(new Array(c).fill(null));return V(l,c),v};let i=!1;const h=()=>{i||!m||!s.value||!a.value||(setTimeout(()=>{a.value.scrollTo(m,"start")}),i=!0)},B=l=>{d.value=l.index};x([s,a],()=>h()),j(()=>{h()});const r=_([]),y={props:t,selectable:e,limit:N,total:s,notes:u,viewStore:o,tileView:f,router:b,virtualScrollRef:a,route:S,fetchNotesWithDebounce:V,lastFrom:d,initialFrom:m,getPagedNotes:A,get alreadyScrolled(){return i},set alreadyScrolled(l){i=l},scrollAfterInit:h,onVirtualScroll:B,selectedNotes:r,selectNote:(l,c)=>{if(e.value){if(c){r.value=[...r.value,l];return}r.value=r.value.filter(v=>v.id!==l.id)}},get QVirtualScroll(){return C},AsyncItemContainer:R,PublicNotePreview:G};return Object.defineProperty(y,"__isScriptSetup",{enumerable:!1,value:!0}),y}});function J(w,g,t,e,N,s){return P(),O("div",{class:p(["items-start public-notes",{row:e.tileView,column:!e.tileView}])},[t.scrollTarget?(P(),D(e.QVirtualScroll,{key:0,ref:"virtualScrollRef",onVirtualScroll:e.onVirtualScroll,"items-size":e.total,"virtual-scroll-slice-size":e.limit||10,"virtual-scroll-item-size":230,"items-fn":e.getPagedNotes,"scroll-target":t.scrollTarget,class:"full-width",style:{"max-height":"cacl(100svh - 66px)"}},{default:z(({index:u})=>[k(e.AsyncItemContainer,{"items-list":e.notes,index:u,height:t.height},{default:z(({item:o})=>[M("div",{class:p({fit:!e.tileView,"col-4":e.tileView})},[k(e.PublicNotePreview,{"note-preview":o,"show-author":!e.selectable,selectable:e.selectable,height:t.height,onSelected:f=>e.selectNote(o,f)},null,8,["note-preview","show-author","selectable","height","onSelected"])],2)]),_:2},1032,["items-list","index","height"])]),_:1},8,["items-size","virtual-scroll-slice-size","scroll-target"])):W("",!0)],2)}const $=E(H,[["render",J],["__scopeId","data-v-f94acf45"],["__file","NoteList.vue"]]);export{$ as N};