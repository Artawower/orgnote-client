import{c as u,I as b,g as C}from"./index.e5e5ad80.js";function V(e){if(Object(e.$parent)===e.$parent)return e.$parent;for(e=e.$.parent;Object(e)===e;){if(Object(e.proxy)===e.proxy)return e.proxy;e=e.parent}}function S(e){return e.appContext.config.globalProperties.$router!==void 0}function A(e){return e?e.aliasOf?e.aliasOf.path:e.path:""}function $(e,r){return(e.aliasOf||e)===(r.aliasOf||r)}function I(e,r){for(const t in r){const n=r[t],i=e[t];if(typeof n=="string"){if(n!==i)return!1}else if(Array.isArray(i)===!1||i.length!==n.length||n.some((l,h)=>l!==i[h]))return!1}return!0}function R(e,r){return Array.isArray(r)===!0?e.length===r.length&&e.every((t,n)=>t===r[n]):e.length===1&&e[0]===r}function j(e,r){return Array.isArray(e)===!0?R(e,r):Array.isArray(r)===!0?R(r,e):e===r}function q(e,r){if(Object.keys(e).length!==Object.keys(r).length)return!1;for(const t in e)if(j(e[t],r[t])===!1)return!1;return!0}const B={to:[String,Object],replace:Boolean,exact:Boolean,activeClass:{type:String,default:"q-router-link--active"},exactActiveClass:{type:String,default:"q-router-link--exact-active"},href:String,target:String,disable:Boolean};function _(e){const r=C(),{props:t,proxy:n}=r,i=S(r),l=u(()=>t.disable!==!0&&t.href!==void 0),h=u(()=>i===!0&&t.disable!==!0&&l.value!==!0&&t.to!==void 0&&t.to!==null&&t.to!==""),o=u(()=>{if(h.value===!0)try{return n.$router.resolve(t.to)}catch{}return null}),s=u(()=>o.value!==null),d=u(()=>l.value===!0||s.value===!0),O=u(()=>t.type==="a"||d.value===!0?"a":t.tag||e||"div"),P=u(()=>l.value===!0?{href:t.href,target:t.target}:s.value===!0?{href:o.value.href,target:t.target}:{}),y=u(()=>{if(s.value===!1)return null;const{matched:a}=o.value,{length:c}=a,g=a[c-1];if(g===void 0)return-1;const f=n.$route.matched;if(f.length===0)return-1;const v=f.findIndex($.bind(null,g));if(v>-1)return v;const x=A(a[c-2]);return c>1&&A(g)===x&&f[f.length-1].path!==x?f.findIndex($.bind(null,a[c-2])):v}),p=u(()=>s.value===!0&&y.value>-1&&I(n.$route.params,o.value.params)),k=u(()=>p.value===!0&&y.value===n.$route.matched.length-1&&q(n.$route.params,o.value.params)),m=u(()=>s.value===!0?k.value===!0?` ${t.exactActiveClass} ${t.activeClass}`:t.exact===!0?"":p.value===!0?` ${t.activeClass}`:"":"");function L(a){return t.disable===!0||a.metaKey||a.altKey||a.ctrlKey||a.shiftKey||a.__qNavigate!==!0&&a.defaultPrevented===!0||a.button!==void 0&&a.button!==0||t.target==="_blank"?!1:(b(a),n.$router[t.replace===!0?"replace":"push"](t.to).catch(c=>c))}return{hasRouterLink:s,hasHrefLink:l,hasLink:d,linkTag:O,linkRoute:o,linkIsActive:p,linkIsExactActive:k,linkClass:m,linkProps:P,navigateToRouterLink:L}}export{_ as a,V as g,B as u,S as v};