import{ak as R,aL as L,aM as j,r as h,d as g,w as y,aZ as F,j as V,ap as k,a_ as O,aB as $,aq as H,h as B,K as M,bv as Q,z as I,o as x,A,k as U,I as K,a0 as Z,m as G,q as J,bw as W,R as X,aj as Y,bo as ee,e as D,a2 as C,F as E,E as te,b3 as re,B as w,D as ae,a7 as oe}from"./index-D7E76tEZ.js";import{T as se,u as ne}from"./TouchPan-Bo7bL-s6.js";import{Q as ie}from"./QPage-YHCRAyud.js";import{r as le}from"./min-page-height-C8LjVHEA.js";import{u as ue}from"./note-detail-commands-Cccih9r4.js";import{E as de}from"./EncryptionRequred-C8GiPJo7.js";const ce=R({name:"QSplitter",props:{...L,modelValue:{type:Number,required:!0},reverse:Boolean,unit:{type:String,default:"%",validator:e=>["%","px"].includes(e)},limits:{type:Array,validator:e=>e.length!==2||typeof e[0]!="number"||typeof e[1]!="number"?!1:e[0]>=0&&e[0]<=e[1]},emitImmediately:Boolean,horizontal:Boolean,disable:Boolean,beforeClass:[Array,String,Object],afterClass:[Array,String,Object],separatorClass:[Array,String,Object],separatorStyle:[Array,String,Object]},emits:["update:modelValue"],setup(e,{slots:c,emit:r}){const{proxy:{$q:t}}=H(),l=j(e,t),n=h(null),a={before:h(null),after:h(null)},f=g(()=>`q-splitter no-wrap ${e.horizontal===!0?"q-splitter--horizontal column":"q-splitter--vertical row"} q-splitter--${e.disable===!0?"disabled":"workable"}`+(l.value===!0?" q-splitter--dark":"")),_=g(()=>e.horizontal===!0?"height":"width"),m=g(()=>e.reverse!==!0?"before":"after"),o=g(()=>e.limits!==void 0?e.limits:e.unit==="%"?[10,90]:[50,1/0]);function u(s){return(e.unit==="%"?s:Math.round(s))+e.unit}const d=g(()=>({[m.value]:{[_.value]:u(e.modelValue)}}));let v,b,S,N,i;function q(s){if(s.isFirst===!0){const T=n.value.getBoundingClientRect()[_.value];v=e.horizontal===!0?"up":"left",b=e.unit==="%"?100:T,S=Math.min(b,o.value[1],Math.max(o.value[0],e.modelValue)),N=(e.reverse!==!0?1:-1)*(e.horizontal===!0?1:t.lang.rtl===!0?-1:1)*(e.unit==="%"?T===0?0:100/T:1),n.value.classList.add("q-splitter--active");return}if(s.isFinal===!0){i!==e.modelValue&&r("update:modelValue",i),n.value.classList.remove("q-splitter--active");return}const p=S+N*(s.direction===v?-1:1)*s.distance[e.horizontal===!0?"y":"x"];i=Math.min(b,o.value[1],Math.max(o.value[0],p)),a[m.value].value.style[_.value]=u(i),e.emitImmediately===!0&&e.modelValue!==i&&r("update:modelValue",i)}const z=g(()=>[[se,q,void 0,{[e.horizontal===!0?"vertical":"horizontal"]:!0,prevent:!0,stop:!0,mouse:!0,mouseAllDir:!0}]]);function P(s,p){s<p[0]?r("update:modelValue",p[0]):s>p[1]&&r("update:modelValue",p[1])}return y(()=>e.modelValue,s=>{P(s,o.value)}),y(()=>e.limits,()=>{F(()=>{P(e.modelValue,o.value)})}),()=>{const s=[V("div",{ref:a.before,class:["q-splitter__panel q-splitter__before"+(e.reverse===!0?" col":""),e.beforeClass],style:d.value.before},k(c.before)),V("div",{class:["q-splitter__separator",e.separatorClass],style:e.separatorStyle,"aria-disabled":e.disable===!0?"true":void 0},[O("div",{class:"q-splitter__separator-area absolute-full"},k(c.separator),"sep",e.disable!==!0,()=>z.value)]),V("div",{ref:a.after,class:["q-splitter__panel q-splitter__after"+(e.reverse===!0?"":" col"),e.afterClass],style:d.value.after},k(c.after))];return V("div",{class:f.value,ref:n},$(c.default,s))}}}),me=B({__name:"NoteDebugger",props:{cursorPosition:{}},setup(e,{expose:c}){c();const r=e,t=M(),l=h(null),n=h(),a=m=>{let o;const u=r.cursorPosition;return Q(m,d=>(d.start<=u&&d.end>=u&&(o=d),!1)),o},f=()=>{var u,d,v;l.value=a(t.orgTree);const[m,o]=[(u=l.value)==null?void 0:u.start,(d=l.value)==null?void 0:d.end];n.value=(v=t.orgTree)==null?void 0:v.toString().replace(`[${m}-${o}]`,`<span style="background-color: var(--yellow); color: var(--base2)">[${m}-${o}]</span>`)};f(),y(()=>[t.orgTree,r.cursorPosition],()=>{f()});const _={props:r,noteEditorStore:t,selectedNode:l,parsedNoteTextTree:n,findSelectedNode:a,initDebugTree:f};return Object.defineProperty(_,"__isScriptSetup",{enumerable:!1,value:!0}),_}}),fe=["innerHTML"];function _e(e,c,r,t,l,n){return x(),A("div",{class:"org-debug",innerHTML:t.parsedNoteTextTree},null,8,fe)}const ve=I(me,[["render",_e],["__scopeId","data-v-5fcace4b"],["__file","NoteDebugger.vue"]]),ge=B({__name:"NoteEditorPage",setup(e,{expose:c}){c();const r=U(),t=r.params.id,l=M(),n=K();n.resetNote(),n.selectNoteById(t);const{currentNote:a,currentOrgTree:f}=Z(n),_=h(50),m=()=>{a.value&&(l.setFilePath(a.value.filePath),l.setNoteTree(f.value),l.setCreatedTime(a.value.createdAt))};m(),y(()=>a.value,()=>m()),y(()=>r.params.id,i=>i&&n.selectNoteById(i));const o=g(()=>{var i;return!r.params.id||((i=a.value)==null?void 0:i.id)===r.params.id}),u=G(),d=()=>{(o.value?u.loading.hide:u.loading.show)()};d(),y(()=>o.value,()=>d()),ne(),ue();const v=J(),b=W(),S=b.$onAction(({name:i,args:q})=>{const z=q==null?void 0:q[0];i!=="deleteNotes"||!z||!z.find(s=>s===l.note.id)||v.push({name:X.Home})});Y(()=>{u.loading.hide(),S()});const N={route:r,noteId:t,noteEditorStore:l,currentNoteStore:n,currentNote:a,currentOrgTree:f,splitterSize:_,setupEditorStore:m,noteLoaded:o,$q:u,initLoaderStatus:d,router:v,notesStore:b,unsubscribeFileManager:S,get resetPageMinHeight(){return le},NoteDebugger:ve,EncryptionRequired:de};return Object.defineProperty(N,"__isScriptSetup",{enumerable:!1,value:!0}),N}}),be={key:0,class:"q-pa-md"},pe={class:"debug q-pa-md"},he={class:"common-info q-px-md"},ye={class:"debug-tree q-py-sm q-px-md"};function Se(e,c,r,t,l,n){const a=ee("router-view");return x(),D(ie,{class:oe({flex:t.noteEditorStore.debug,"debug-page":t.noteEditorStore.debug}),"style-fn":t.resetPageMinHeight},{default:C(()=>[E(t.EncryptionRequired,{note:t.currentNote},{default:C(()=>[t.noteEditorStore.debug?(x(),D(ce,{key:0,modelValue:t.splitterSize,"onUpdate:modelValue":c[0]||(c[0]=f=>t.splitterSize=f),horizontal:t.$q.screen.lt.sm,class:"debug-splitter"},{before:C(()=>[t.noteLoaded?(x(),A("div",be,[E(a)])):te("",!0)]),separator:C(()=>[E(re,{color:"primary","text-color":"white",size:"40px",icon:"drag_indicator"})]),after:C(()=>[w("div",pe,[w("div",he," Cursor: "+ae(t.noteEditorStore.cursorPosition),1),w("div",ye,[E(t.NoteDebugger,{"cursor-position":t.noteEditorStore.cursorPosition},null,8,["cursor-position"])])])]),_:1},8,["modelValue","horizontal"])):(x(),D(a,{key:1}))]),_:1},8,["note"])]),_:1},8,["class","style-fn"])}const Ee=I(ge,[["render",Se],["__scopeId","data-v-7e30b7e9"],["__file","NoteEditorPage.vue"]]);export{Ee as default};
