import{S as o,ar as s,U as u,Z as n,$ as c,m as i,V as l,a1 as m}from"./index.e5e5ad80.js";const p={class:"text-h2 absolute-center text-center"},d=o({__name:"AuthPage",setup(y){const e=s(),t=u(),r={avatarUrl:e.query.avatarUrl,email:e.query.email,nickName:e.query.username,profileUrl:e.query.profileUrl,id:e.query.id};return t.authUser(r,e.query.token),n().push({name:c.Home}),(a,_)=>(i(),l("h2",p,m(a.$t("Wait a second, we are trying to identify you")),1))}});export{d as default};
