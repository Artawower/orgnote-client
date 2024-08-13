import{h as k,Y as S,Z as y,$ as b,z as E,o as i,A as u,B as c,e as m,a0 as v,D as s,E as r,F as f,C as _,N as x,a1 as P,a2 as B,a3 as C,a4 as A,S as M,G as N}from"./index-BLR50dHh.js";import{N as V}from"./NavigationPage-LIxkm1Lv.js";function U(t){if(!t)return"";const a=t.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)/gim);return a?a[0].replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?/gim,""):""}const D=k({__name:"ExtensionPreview",props:{extension:{}},setup(t,{expose:a}){a();const e=t,n=S(),d=async()=>{if(e.extension.active)return await n.disableExtension(e.extension.manifest.name);await n.enableExtension(e.extension.manifest.name)},l=y(),o={props:e,extensionsStore:n,toggleExtensionStatus:d,packageManager:l,ActionBtn:b,get extractDomain(){return U}};return Object.defineProperty(o,"__isScriptSetup",{enumerable:!1,value:!0}),o}}),I={class:"header"},T={class:"icon"},z=["alt","src"],F={class:"title"},j={class:"text-h4"},Q={class:"source-info"},p={key:0,class:"author"},L={key:1,class:"builtin"},O=["href"],G={class:"body"},R={class:"description"},Y={class:"actions"};function Z(t,a,e,n,d,l){return i(),u("div",{key:e.extension.manifest.name,class:"extension"},[c("div",I,[c("div",T,[e.extension.manifest.icon?(i(),u("img",{key:0,alt:"extension.manifest.name icon",src:e.extension.manifest.icon},null,8,z)):(i(),m(v,{key:1,name:"extension",size:"2.5rem"}))]),c("div",F,[c("h4",j,s(e.extension.manifest.name)+" "+s(e.extension.manifest.version),1),c("div",Q,[e.extension.manifest.author?(i(),u("span",p,s(e.extension.manifest.author)+"  ",1)):r("",!0),e.extension.manifest.sourceType==="builtin"?(i(),u("span",L,[f(v,{name:"verified",class:"builtin"}),_(" "+s(t.$t("built-in")),1)])):r("",!0),e.extension.manifest.sourceUrl?(i(),u("a",{key:2,class:"author link",href:e.extension.manifest.sourceUrl,target:"_blank"},s(n.extractDomain(e.extension.manifest.sourceUrl)),9,O)):r("",!0)])])]),c("div",G,[c("div",R,s(e.extension.manifest.description),1),c("div",Y,[!e.extension.uploaded&&e.extension.manifest.sourceType!=="builtin"?(i(),m(n.ActionBtn,{key:0,icon:"delete",theme:"magenta",loading:n.packageManager.loading,disabled:n.packageManager.loading,onClick:a[0]||(a[0]=o=>n.packageManager.addSource(e.extension.manifest.sourceUrl))},{default:x(()=>[_(s(t.$t("download")),1)]),_:1},8,["loading","disabled"])):r("",!0),e.extension.uploaded&&e.extension.manifest.sourceType!=="builtin"?(i(),m(n.ActionBtn,{key:1,icon:"delete",theme:"red",onClick:a[1]||(a[1]=o=>n.extensionsStore.deleteExtension(e.extension))},{default:x(()=>[_(s(t.$t("delete")),1)]),_:1})):r("",!0),e.extension.uploaded||e.extension.manifest.sourceType==="builtin"?(i(),m(n.ActionBtn,{key:2,icon:e.extension.active?"cancel":"download_for_offline",theme:e.extension.active?"red":"magenta",onClick:n.toggleExtensionStatus},{default:x(()=>[_(s(e.extension.active?t.$t("disable"):t.$t("enable")),1)]),_:1},8,["icon","theme"])):r("",!0)])])])}const q=E(D,[["render",Z],["__scopeId","data-v-02abb0ba"],["__file","ExtensionPreview.vue"]]),H=k({__name:"ExtensionsSettingsPage",setup(t,{expose:a}){a();const e=S(),n=async()=>{const g=await C({accept:".js"}),w=await A(g);e.uploadExtension(w)},d=P(),l=y(),h={extensionsStore:e,uploadExtension:n,completionStore:d,packageManager:l,addSource:async()=>{const g=await d.readCompletion("git URL");l.addSource(g)},NavigationPage:V,ExtensionPreview:q,ActionBtn:b,SearchInput:B};return Object.defineProperty(h,"__isScriptSetup",{enumerable:!1,value:!0}),h}}),J={class:"search-header"},K={class:"actions"},W={class:"extensions"};function X(t,a,e,n,d,l){return i(),m(n.NavigationPage,null,{default:x(()=>[c("div",J,[f(n.SearchInput,{modelValue:n.extensionsStore.searchQuery,"onUpdate:modelValue":a[0]||(a[0]=o=>n.extensionsStore.searchQuery=o),autofocus:!0,theme:"heavy"},null,8,["modelValue"])]),c("div",K,[f(n.ActionBtn,{onClick:n.addSource,icon:"fab fa-git-alt",size:"lg",loading:n.packageManager.loading},{default:x(()=>[_(s(t.$t("add from git")),1)]),_:1},8,["loading"]),f(n.ActionBtn,{onClick:n.uploadExtension,icon:"upload",size:"lg",loading:n.packageManager.loading},{default:x(()=>[_(s(t.$t("upload")),1)]),_:1},8,["loading"])]),c("div",W,[(i(!0),u(N,null,M(n.extensionsStore.filteredExtensions,o=>(i(),m(n.ExtensionPreview,{extension:o,key:o.manifest.name+o.uploaded},null,8,["extension"]))),128))])]),_:1})}const ne=E(H,[["render",X],["__scopeId","data-v-122ada0c"],["__file","ExtensionsSettingsPage.vue"]]);export{ne as default};
