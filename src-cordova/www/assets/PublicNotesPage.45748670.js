import{g as n,bw as f,a as r,b5 as u,r as _,o as m,X as p,a0 as d,Y as N,e as s}from"./index.446b2176.js";import{N as g}from"./NoteList.6d44b4e3.js";import{_ as v}from"./plugin-vue_export-helper.21dcd24c.js";import"./PublicNotePreview.3f55e05d.js";import"./ClosePopup.6775e2be.js";import"./selection.f044c102.js";import"./AsyncItemContainer.c33b9601.js";const b={class:"container page-container"},h=n({__name:"PublicNotesPage",setup(y){const e=f(),a=r(()=>e.filters.limit),l=r(()=>e.filters.offset),t=u(),c=()=>{e.setFilters({searchText:t.query.search,userId:t.params.userId,limit:+t.query.limit,offset:+t.query.offset})},i=()=>{c(),e.loadNotes()},o=_(null);return i(),(P,x)=>(m(),p("div",{ref_key:"scrollTarget",ref:o,class:"scroll-container"},[d("div",b,[N(g,{selectable:!1,notes:s(e).notes,limit:a.value,offset:l.value,total:s(e).total,"fetch-notes":s(e).fetchNotes,"scroll-target":o.value,height:254,ref:"publicNotesRef"},null,8,["notes","limit","offset","total","fetch-notes","scroll-target"])])],512))}});var S=v(h,[["__scopeId","data-v-f95f1e2e"]]);export{S as default};
