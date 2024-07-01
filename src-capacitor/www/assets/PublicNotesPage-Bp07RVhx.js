import{Q as h}from"./QPage-CqFWzCbK.js";import{cw as v,r as n,cz as m,h as g,d,k as b,z as P,o as T,A as x,F as _,a2 as y,B as I}from"./index-CHdFPrnc.js";import{r as S}from"./min-page-height-BrWh_Wdp.js";import{N as B}from"./NoteList-DNyoFXba.js";import"./AsyncItemContainer-BmYTKLhw.js";import"./view-B98kT0Eb.js";import"./PublicNotePreview-Cn8m9Wnl.js";import"./AuthorInfo-Cs9peq4h.js";const N=100,p=0,L=v("publicNotes",()=>{const l=n([]),t=n({limit:N,offset:p}),a=n(0),o=n(),c=s=>{var u;const e={...t.value,...s};e.searchText=(u=e.searchText)==null?void 0:u.trim(),e.limit||(e.limit=N),e.offset||(e.offset=p),t.value=e};return{notes:l,selectedNote:o,total:a,filters:t,loadNotes:async()=>{try{const s=await m.notes.notesGet(t.value.limit,t.value.offset,t.value.userId,t.value.searchText);l.value=s.data.data,a.value=s.data.meta.total,c({limit:s.data.meta.limit,offset:s.data.meta.offset})}catch(s){console.log("🦄: [line 24][notes.ts] \x1B[35me: ",s)}},fetchNotes:async s=>{if(t.value.offset!==s){c({offset:s});try{const e=await m.notes.notesGet(t.value.limit,t.value.offset,t.value.userId,t.value.searchText);l.value=[...l.value,...e.data.data],a.value=e.data.meta.total}catch{}}},selectNote:s=>{o.value=s},setFilters:c}}),F=g({__name:"PublicNotesPage",setup(l,{expose:t}){t();const a=L(),o=d(()=>a.filters.limit),c=d(()=>a.filters.offset),r=b(),i=()=>{a.setFilters({searchText:r.query.search,userId:r.params.userId,limit:+r.query.limit,offset:+r.query.offset})},f=()=>{i(),a.loadNotes()},s=n(null);f();const e={publicNotesStore:a,limit:o,offset:c,route:r,setFiltersFromQuery:i,reloadNotes:f,scrollTarget:s,get resetPageMinHeight(){return S},NoteList:B};return Object.defineProperty(e,"__isScriptSetup",{enumerable:!1,value:!0}),e}}),k={ref:"scrollTarget",class:"scroll-container"},w={class:"container page-container"};function C(l,t,a,o,c,r){return T(),x("div",k,[_(h,{"style-fn":o.resetPageMinHeight,class:"center-container"},{default:y(()=>[I("div",w,[_(o.NoteList,{selectable:!1,notes:o.publicNotesStore.notes,limit:o.limit,offset:o.offset,total:o.publicNotesStore.total,"fetch-notes":o.publicNotesStore.fetchNotes,"scroll-target":o.scrollTarget,height:254,ref:"publicNotesRef"},null,8,["notes","limit","offset","total","fetch-notes","scroll-target"])])]),_:1},8,["style-fn"])],512)}const D=P(F,[["render",C],["__scopeId","data-v-d5ae3bce"],["__file","PublicNotesPage.vue"]]);export{D as default};
