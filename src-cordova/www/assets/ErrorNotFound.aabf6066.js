var m=Object.defineProperty,_=Object.defineProperties;var u=Object.getOwnPropertyDescriptors;var l=Object.getOwnPropertySymbols;var x=Object.prototype.hasOwnProperty,g=Object.prototype.propertyIsEnumerable;var c=(o,t,e)=>t in o?m(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e,p=(o,t)=>{for(var e in t||(t={}))x.call(t,e)&&c(o,e,t[e]);if(l)for(var e of l(t))g.call(t,e)&&c(o,e,t[e]);return o},d=(o,t)=>_(o,u(t));import{S as k,Z as v,m as y,V as b,X as a,a1 as n,p as h,$ as w}from"./index.e5e5ad80.js";const E={class:"not-found-wrapper text-center q-pa-md flex flex-center"},B={id:"main"},N={class:"fof"},R={class:"text-h1 main-font-color"},$={href:"mailto:artawower33@gmail.com",target:"_blank",class:"text-h6 main-font-color reset"},C={name:"ErrorNotFound"},V=k(d(p({},C),{setup(o){const t=v(),i=t.options.history.state.back?()=>t.go(-1):()=>t.push({name:w.Home});return(s,r)=>(y(),b("div",E,[a("div",B,[a("div",N,[a("h1",R,n(s.$t("Error"))+" 404",1),a("h5",{class:"text-h5 cursor-pointer main-font-color",role:"link",onClick:r[0]||(r[0]=(...f)=>h(i)&&h(i)(...f))},n(s.$t("Go back")),1),a("a",$,n(s.$t("If you think this is a mistake, please contact us")),1)])])]))}}));export{V as default};