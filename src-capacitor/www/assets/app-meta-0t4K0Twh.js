import{d as u,w as r,bJ as n,aR as d,aQ as l,aA as v,bK as o,aj as f,bL as p,bM as m}from"./index-DftpuOf4.js";function s(t){{const e={active:!0};if(typeof t=="function"){const a=u(t);e.val=a.value,r(a,c=>{e.val=c,e.active===!0&&n()})}else e.val=t;o.push(e),n(),d(()=>{e.active=!0,n()}),l(()=>{e.active=!1,n()}),v(()=>{o.splice(o.indexOf(e),1),n()})}}function b(t){const e=i=>{s(i)},a={title:p,meta:{description:{name:"description",content:m},keywords:{name:"keywords",content:void 0},ogTitle:{property:"og:title",content:void 0}}},c=()=>s(a);return e(t!=null?t:a),f(()=>{c()}),{setMeta:e,useDefaultMeta:c}}export{b as u};