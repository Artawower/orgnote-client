import{Q as d}from"./QIcon.b994d6a9.js";import{S as b,t as u,r as f,m,n as p,p as a,Y as v}from"./index.e5e5ad80.js";function _(e){const o=document.createElement("textarea");o.value=e,o.contentEditable="true",o.style.position="fixed",document.body.appendChild(o),o.focus(),o.select();const n=document.execCommand("copy");return o.remove(),n}function w(e){return navigator.clipboard!==void 0?navigator.clipboard.writeText(e):new Promise((o,n)=>{const r=_(e);r?o(!0):n(r)})}const x=b({__name:"ActionBtn",props:{icon:null,activeIcon:null},emits:["click"],setup(e,{emit:o}){const n=e,{icon:r,activeIcon:c}=u(n);let t=f(!1);const i=()=>{t.value=!0,setTimeout(()=>{t.value=!1},1e3)},s=()=>{i(),o("click")};return(l,k)=>(m(),p(d,{onClick:s,name:a(t)?a(r):a(c),size:"1rem",class:v(["action-btn",{fired:a(t),dark:l.$q.dark.isActive}])},null,8,["name","class"]))}});export{x as _,w as c};
