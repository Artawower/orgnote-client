import{k as d,t as b,r as u,o as v,f as p,h as a,a7 as f,ae as m}from"./index.816ed836.js";function _(e){const o=document.createElement("textarea");o.value=e,o.contentEditable="true",o.style.position="fixed",document.body.appendChild(o),o.focus(),o.select();const t=document.execCommand("copy");return o.remove(),t}function g(e){return navigator.clipboard!==void 0?navigator.clipboard.writeText(e):new Promise((o,t)=>{const n=_(e);n?o(!0):t(n)})}const w=d({__name:"ActionBtn",props:{icon:{},activeIcon:{}},emits:["click"],setup(e,{emit:o}){const t=e,{icon:n,activeIcon:c}=b(t);let r=u(!1);const i=()=>{r.value=!0,setTimeout(()=>{r.value=!1},1e3)},s=()=>{i(),o("click")};return(l,k)=>(v(),p(m,{onClick:s,name:a(r)?a(c):a(n),size:"1rem",class:f(["action-btn",{fired:a(r),dark:l.$q.dark.isActive}])},null,8,["name","class"]))}});export{w as _,g as c};
