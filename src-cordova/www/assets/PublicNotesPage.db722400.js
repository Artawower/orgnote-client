import{N as n}from"./NoteList.8d0c9898.js";import{k as m,bo as f,e as r,aM as p,r as u,o as _,a3 as d,a8 as v,a4 as h,h as o}from"./index.816ed836.js";import{_ as N}from"./plugin-vue_export-helper.21dcd24c.js";import"./PublicNotePreview.a26a84e6.js";import"./view.9ba803d1.js";import"./use-dark.c0d4b15f.js";import"./use-checkbox.29c9f21a.js";import"./use-form.c4f07f8e.js";import"./QMenu.2c92c01d.js";import"./focus-manager.387b0375.js";import"./use-tick.1d64bfca.js";import"./use-timeout.e7de6380.js";import"./QItemSection.778821b6.js";import"./QList.ddb6ee58.js";import"./AsyncItemContainer.9709dcfe.js";import"./use-virtual-scroll.da17981c.js";import"./rtl.4b414a6d.js";import"./debounce.124e7565.js";const b={class:"container content"},g=m({__name:"PublicNotesPage",setup(y){const t=f(),a=r(()=>t.filters.limit),i=r(()=>t.filters.offset),e=p(),l=()=>{t.setFilters({searchText:e.query.search,userId:e.params.userId,limit:+e.query.limit,offset:+e.query.offset})},c=()=>{l(),t.loadNotes()},s=u(null);return c(),(P,x)=>(_(),d("div",{ref_key:"scrollTarget",ref:s,class:"scroll-container"},[v("div",b,[h(n,{selectable:!1,notes:o(t).notes,limit:a.value,offset:i.value,total:o(t).total,"fetch-notes":o(t).fetchNotes,"scroll-target":s.value,height:254,ref:"publicNotesRef"},null,8,["notes","limit","offset","total","fetch-notes","scroll-target"])])],512))}});var D=N(g,[["__scopeId","data-v-052172b4"]]);export{D as default};
