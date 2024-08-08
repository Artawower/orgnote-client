import{h as q,k as A,l as S,m as U,d as k,n as v,p as M,q as P,s as $,r as x,v as R,x as B,y as N,R as C,z as E,o as l,A as c,B as o,C as I,D as a,E as y}from"./index-CzwKTze0.js";const z="orgnote://";function O(s=""){return`${z}${s}`}const V=q({__name:"AuthPage",setup(s,{expose:u}){u();const t=A(),e=S(),r=U(),i=k(()=>v(t.query.state)),d=R(async()=>{const n=t.params.initialProvider;if(n){e.auth({provider:n,environment:i.value.environment});return}await _()});M(async()=>{await d()});const p=P(),{config:m}=$(),b=x(),_=async()=>{const n=t.query.state!=="desktop";if(m.developer.developerMode&&await B(1e4),!r.platform.is.nativeMobile&&r.platform.is.mobile&&n&&!window.navigator.standalone&&!r.platform.is.ios){const w=O(`auth/login${window.location.search}`);window.location.assign(w);return}const h=v(t.query.state),g=N(t.query);if(await e.authUser(g,t.query.token),h.redirectUrl){window.location.assign(h.redirectUrl);return}p.push({name:C.Home})},f={route:t,authStore:e,$q:r,state:i,initProvider:d,router:p,config:m,mobileUrl:b,setupUser:_};return Object.defineProperty(f,"__isScriptSetup",{enumerable:!1,value:!0}),f}}),D={class:"absolute-center"},H={class:"text-h2 text-center capitalize"},Q=o("br",null,null,-1),T={key:0,class:"color-secondary q-pt-lg q-pl-lg"},j={class:"capitalize"},G=["href"];function F(s,u,t,e,r,i){return l(),c("div",D,[o("h2",H,[I(a(s.$t("wait a second, we are trying to identify you")),1),Q]),e.config.developer.developerMode?(l(),c("div",T,[o("div",j,a(s.$t("this message appears because developer mode is enabled")),1),o("div",null,"Route state: "+a(e.route.query.state),1),o("div",null,"Is native app: "+a(!!e.$q.platform.is.nativeMobile),1),o("div",null,"Is mobile: "+a(!!e.$q.platform.is.mobile),1)])):y("",!0),o("h3",null,[e.mobileUrl?(l(),c("a",{key:0,href:e.mobileUrl},a(s.$t("return to mobile app")),9,G)):y("",!0)])])}const K=E(V,[["render",F],["__file","AuthPage.vue"]]);export{K as default};
