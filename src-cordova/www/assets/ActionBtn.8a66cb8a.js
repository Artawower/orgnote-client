import{k as b,t as l,r as p,o as v,f as u,h as a,a7 as f,ag as m}from"./index.e984fdbd.js";function _(n){const o=document.createElement("textarea");o.value=n,o.contentEditable="true",o.style.position="fixed",document.body.appendChild(o),o.focus(),o.select();const t=document.execCommand("copy");return o.remove(),t}function k(n){return navigator.clipboard!==void 0?navigator.clipboard.writeText(n):new Promise((o,t)=>{const e=_(n);e?o(!0):t(e)})}const h=b({__name:"ActionBtn",props:{icon:{},activeIcon:{}},emits:["click"],setup(n,{emit:o}){const t=n,{icon:e,activeIcon:c}=l(t);let r=p(!1);const i=()=>{r.value=!0,setTimeout(()=>{r.value=!1},1e3)},s=()=>{i(),o("click")};return(d,g)=>(v(),u(m,{onClick:s,name:a(r)?a(c):a(e),size:"1rem",class:f(["action-btn",{fired:a(r),dark:d.$q.dark.isActive}])},null,8,["name","class"]))}});export{h as _,k as c};
