import{y as t,R as r}from"./index.e5e5ad80.js";function m(){let e;return t(()=>{clearTimeout(e)}),{registerTimeout(i,o){clearTimeout(e),e=setTimeout(i,o)},removeTimeout(){clearTimeout(e)}}}function T(){let e;return t(()=>{e=void 0}),{registerTick(i){e=i,r(()=>{e===i&&(e(),e=void 0)})},removeTick(){e=void 0}}}export{T as a,m as u};
