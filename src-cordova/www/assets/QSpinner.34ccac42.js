var Q=Object.defineProperty,C=Object.defineProperties;var D=Object.getOwnPropertyDescriptors;var y=Object.getOwnPropertySymbols;var F=Object.prototype.hasOwnProperty,I=Object.prototype.propertyIsEnumerable;var b=(e,t,i)=>t in e?Q(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,d=(e,t)=>{for(var i in t||(t={}))F.call(t,i)&&b(e,i,t[i]);if(y)for(var i of y(t))I.call(t,i)&&b(e,i,t[i]);return e},g=(e,t)=>C(e,D(t));import{c,ai as $,_ as O,K as N,h as a,g as P}from"./index.1402a66b.js";const S={xs:18,sm:24,md:32,lg:38,xl:46},U={size:String};function K(e,t=S){return c(()=>e.size!==void 0?{fontSize:e.size in t?`${t[e.size]}px`:e.size}:null)}const k=e=>$(O(e)),te=e=>$(e);function V(e,t){return e!==void 0&&e()||t}function ne(e,t){if(e!==void 0){const i=e();if(i!=null)return i.slice()}return t}function l(e,t){return e!==void 0?t.concat(e()):t}function ie(e,t){return e===void 0?t:t!==void 0?t.concat(e()):e()}function se(e,t,i,f,u,r){t.key=f+u;const s=a(e,t,i);return u===!0?N(s,r()):s}const p="0 0 24 24",z=e=>e,h=e=>`ionicons ${e}`,R={"mdi-":e=>`mdi ${e}`,"icon-":z,"bt-":e=>`bt ${e}`,"eva-":e=>`eva ${e}`,"ion-md":h,"ion-ios":h,"ion-logo":h,"iconfont ":z,"ti-":e=>`themify-icon ${e}`,"bi-":e=>`bootstrap-icons ${e}`},E={o_:"-outlined",r_:"-round",s_:"-sharp"},B={sym_o_:"-outlined",sym_r_:"-rounded",sym_s_:"-sharp"},A=new RegExp("^("+Object.keys(R).join("|")+")"),G=new RegExp("^("+Object.keys(E).join("|")+")"),w=new RegExp("^("+Object.keys(B).join("|")+")"),H=/^[Mm]\s?[-+]?\.?\d/,J=/^img:/,L=/^svguse:/,T=/^ion-/,W=/^(fa-(solid|regular|light|brands|duotone|thin)|[lf]a[srlbdk]?) /;var oe=k({name:"QIcon",props:g(d({},U),{tag:{type:String,default:"i"},name:String,color:String,left:Boolean,right:Boolean}),setup(e,{slots:t}){const{proxy:{$q:i}}=P(),f=K(e),u=c(()=>"q-icon"+(e.left===!0?" on-left":"")+(e.right===!0?" on-right":"")+(e.color!==void 0?` text-${e.color}`:"")),r=c(()=>{let s,n=e.name;if(n==="none"||!n)return{none:!0};if(i.iconMapFn!==null){const o=i.iconMapFn(n);if(o!==void 0)if(o.icon!==void 0){if(n=o.icon,n==="none"||!n)return{none:!0}}else return{cls:o.cls,content:o.content!==void 0?o.content:" "}}if(H.test(n)===!0){const[o,m=p]=n.split("|");return{svg:!0,viewBox:m,nodes:o.split("&&").map(_=>{const[M,j,q]=_.split("@@");return a("path",{style:j,d:M,transform:q})})}}if(J.test(n)===!0)return{img:!0,src:n.substring(4)};if(L.test(n)===!0){const[o,m=p]=n.split("|");return{svguse:!0,src:o.substring(7),viewBox:m}}let v=" ";const x=n.match(A);if(x!==null)s=R[x[1]](n);else if(W.test(n)===!0)s=n;else if(T.test(n)===!0)s=`ionicons ion-${i.platform.is.ios===!0?"ios":"md"}${n.substring(3)}`;else if(w.test(n)===!0){s="notranslate material-symbols";const o=n.match(w);o!==null&&(n=n.substring(6),s+=B[o[1]]),v=n}else{s="notranslate material-icons";const o=n.match(G);o!==null&&(n=n.substring(2),s+=E[o[1]]),v=n}return{cls:s,content:v}});return()=>{const s={class:u.value,style:f.value,"aria-hidden":"true",role:"presentation"};return r.value.none===!0?a(e.tag,s,V(t.default)):r.value.img===!0?a("span",s,l(t.default,[a("img",{src:r.value.src})])):r.value.svg===!0?a("span",s,l(t.default,[a("svg",{viewBox:r.value.viewBox||"0 0 24 24"},r.value.nodes)])):r.value.svguse===!0?a("span",s,l(t.default,[a("svg",{viewBox:r.value.viewBox},[a("use",{"xlink:href":r.value.src})])])):(r.value.cls!==void 0&&(s.class+=" "+r.value.cls),a(e.tag,s,l(t.default,[r.value.content])))}}});const X={size:{type:[Number,String],default:"1em"},color:String};function Y(e){return{cSize:c(()=>e.size in S?`${S[e.size]}px`:e.size),classes:c(()=>"q-spinner"+(e.color?` text-${e.color}`:""))}}var re=k({name:"QSpinner",props:g(d({},X),{thickness:{type:Number,default:5}}),setup(e){const{cSize:t,classes:i}=Y(e);return()=>a("svg",{class:i.value+" q-spinner-mat",width:t.value,height:t.value,viewBox:"25 25 50 50"},[a("circle",{class:"path",cx:"50",cy:"50",r:"20",fill:"none",stroke:"currentColor","stroke-width":e.thickness,"stroke-miterlimit":"10"})])}});export{oe as Q,V as a,te as b,k as c,l as d,se as e,K as f,ie as g,ne as h,re as i,U as u};