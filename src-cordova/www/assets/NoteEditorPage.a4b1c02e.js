import{Q as m}from"./QRouteTab.a4038c8a.js";import{k as S,aH as C,aU as P,al as x,aV as T,w as b,e as k,aW as D,ap as V,o as h,f as E,a5 as N,af as Q,a4 as s,h as i,ab as p,a6 as U}from"./index.a68bc811.js";import{Q as $}from"./QPage.8b50794f.js";import{_ as B}from"./ModeLine.5ee4f96a.js";import"./QFooter.da2957db.js";import"./use-tick.65c3baf2.js";import"./use-timeout.ef68d622.js";import"./rtl.4b414a6d.js";let d;const L=new Uint8Array(16);function f(){if(!d&&(d=typeof crypto!="undefined"&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto),!d))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return d(L)}const o=[];for(let e=0;e<256;++e)o.push((e+256).toString(16).slice(1));function q(e,t=0){return(o[e[t+0]]+o[e[t+1]]+o[e[t+2]]+o[e[t+3]]+"-"+o[e[t+4]]+o[e[t+5]]+"-"+o[e[t+6]]+o[e[t+7]]+"-"+o[e[t+8]]+o[e[t+9]]+"-"+o[e[t+10]]+o[e[t+11]]+o[e[t+12]]+o[e[t+13]]+o[e[t+14]]+o[e[t+15]]).toLowerCase()}const F=typeof crypto!="undefined"&&crypto.randomUUID&&crypto.randomUUID.bind(crypto);var I={randomUUID:F};function H(e,t,n){if(I.randomUUID&&!t&&!e)return I.randomUUID();e=e||{};const a=e.random||(e.rng||f)();if(a[6]=a[6]&15|64,a[8]=a[8]&63|128,t){n=n||0;for(let r=0;r<16;++r)t[n+r]=a[r];return t}return q(a)}function W(){return`:PROPERTIES:
:ID: ${H()}
:END:


#+TITLE: `}const Y=S({__name:"NoteEditorPage",setup(e){const n=C().params.id,a=P(),{specialSymbolsHidden:r}=x(a),v=T(),{selectedNote:l}=x(v),y=()=>{!l.value||(a.setNoteContent(l.value.content),a.setFilePath(l.value.filePath))};n?(y(),b(()=>l.value,()=>y())):a.setNoteText(W()),n&&v.selectNoteById(n);const c=k(()=>{var u;return!n||((u=l.value)==null?void 0:u.id)===n}),g=D(),w=()=>{(c.value?g.loading.hide:g.loading.show)()};return w(),b(()=>c.value,()=>w()),(u,_)=>{const R=V("router-view");return h(),E($,{class:"q-pa-md height-auto with-modeline"},{default:N(()=>[c.value?(h(),E(R,{key:0})):Q("",!0),s(B,null,{default:N(()=>[s(m,{to:{name:i(p).RawEditor,params:{id:i(n)}},exact:!0,icon:"draw",label:"raw"},null,8,["to"]),s(m,{to:{name:i(p).WysiwygEditor,params:{id:i(n)}},exact:!0,icon:"wysiwyg",label:"wysiwyg"},null,8,["to"]),s(m,{to:{name:i(p).PreviewEditor,params:{id:i(n)}},exact:!0,icon:"preview",label:u.$t("preview")},null,8,["to","label"]),s(U,{onClick:i(a).save,icon:"save",flat:""},null,8,["onClick"]),s(U,{icon:i(r)?"visibility_off":"visibility",flat:"",onClick:_[0]||(_[0]=j=>r.value=!i(r))},null,8,["icon"])]),_:1})]),_:1})}}});export{Y as default};