import{h as u,b6 as p,z as d,o as a,A as r,B as s,F as f,a2 as h,b3 as m,D as i,E as l,C as x}from"./index-D7E76tEZ.js";const v=u({__name:"AuthorInfo",props:{author:{}},setup(n,{expose:c}){c();const o=n,e=p(o,"author"),t={props:o,author:e,openProfile:()=>window.open(e.value.profileUrl,"_blank")};return Object.defineProperty(t,"__isScriptSetup",{enumerable:!1,value:!0}),t}}),k={class:"q-mr-md"},A=["src"],N={class:"col"},b={key:0},C={key:1,class:"text-italic"};function w(n,c,o,e,_,t){return a(),r("div",{onClick:e.openProfile,class:"row cursor-pointer flex-center"},[s("div",k,[f(m,{size:"24px",class:"q-mx-auto"},{default:h(()=>[s("img",{src:e.author.avatarUrl,alt:"avatr url"},null,8,A)]),_:1})]),s("div",N,[e.author.nickName?(a(),r("span",b,i(e.author.nickName),1)):l("",!0),x("  "),e.author.email?(a(),r("span",C,i(e.author.email),1)):l("",!0)])])}const B=d(v,[["render",w],["__file","AuthorInfo.vue"]]);export{B as A};
