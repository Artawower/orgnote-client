import{h as d,b7 as p,d as u,bN as l,J as m,z as _,o as c,A as i,F as y,ab as f,B as E,D as S,b1 as k,G as b,E as g}from"./index-DftpuOf4.js";const C=d({__name:"EncryptionRequred",props:{note:{}},setup(t,{expose:o}){o();const{executeCommand:n}=p(),e=t,s=()=>{n({command:m.SETTINGS})},r=u(()=>l(e.note.content)),a={executeCommand:n,props:e,openSettings:s,isCurrentNoteEncrypted:r};return Object.defineProperty(a,"__isScriptSetup",{enumerable:!1,value:!0}),a}}),N={class:"link"};function h(t,o,n,e,s,r){return n.note?(c(),i(b,{key:0},[e.isCurrentNoteEncrypted?(c(),i("div",{key:0,onClick:e.openSettings,class:"full-width full-height column-center pointer"},[y(f,{class:"color-main",name:"sym_o_encrypted",size:"12rem"}),E("span",N,S(t.$t("correct decryption key is required")),1)])):k(t.$slots,"default",{key:1})],64)):g("",!0)}const B=_(C,[["render",h],["__file","EncryptionRequred.vue"]]);export{B as E};