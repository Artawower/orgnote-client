var D=Object.defineProperty,I=Object.defineProperties;var P=Object.getOwnPropertyDescriptors;var S=Object.getOwnPropertySymbols;var R=Object.prototype.hasOwnProperty,T=Object.prototype.propertyIsEnumerable;var Q=(t,a,e)=>a in t?D(t,a,{enumerable:!0,configurable:!0,writable:!0,value:e}):t[a]=e,v=(t,a)=>{for(var e in a||(a={}))R.call(a,e)&&Q(t,e,a[e]);if(S)for(var e of S(a))T.call(a,e)&&Q(t,e,a[e]);return t},h=(t,a)=>I(t,P(a));import{_ as j,b as B,Q as E,a as F}from"./AuthorInfo.9b609284.js";import{c as w,a as y}from"./QSpinner.34ccac42.js";import{c as p,h as C,g as M,_ as U,t as N,a7 as G,a4 as H,ao as J,j as n,k as g,a1 as l,u as s,a0 as k,f as o,aa as K,a2 as x,af as m,a3 as L,ab as O,a5 as W}from"./index.1402a66b.js";import{Q as X}from"./QSeparator.29018688.js";import{h as Y,i as Z,u as ee,b as te,Q as $}from"./QBtn.fd72d8fa.js";import{u as ae}from"./view.b4a7f32b.js";var q=w({name:"QCardSection",props:{tag:{type:String,default:"div"},horizontal:Boolean},setup(t,{slots:a}){const e=p(()=>`q-card__section q-card__section--${t.horizontal===!0?"horiz row no-wrap":"vert"}`);return()=>C(t.tag,{class:e.value},y(a.default))}}),se=w({name:"QCardActions",props:h(v({},Y),{vertical:Boolean}),setup(t,{slots:a}){const e=Z(t),c=p(()=>`q-card__actions ${e.value} q-card__actions--${t.vertical===!0?"vert column":"horiz row"}`);return()=>C("div",{class:c.value},y(a.default))}}),oe=w({name:"QCard",props:h(v({},ee),{tag:{type:String,default:"div"},square:Boolean,flat:Boolean,bordered:Boolean}),setup(t,{slots:a}){const e=M(),c=te(t,e.proxy.$q),_=p(()=>"q-card"+(c.value===!0?" q-card--dark q-dark":"")+(t.bordered===!0?" q-card--bordered":"")+(t.square===!0?" q-card--square no-border-radius":"")+(t.flat===!0?" q-card--flat no-shadow":""));return()=>C(t.tag,{class:_.value},y(a.default))}});const re={key:0,class:"q-px-md"},ne=["src"],le={key:1,class:"mock-picture pointer rounded-borders"},ce={class:"text-overline"},ie={class:"text-caption text-grey rft"},ge=U({__name:"PublicNoteView",props:{note:null,showAuthor:{type:Boolean}},setup(t){const a=t,{note:e}=N(a),c=G(),_=H(),b=u=>{c.selectNote(u),_.push({name:W.NoteDetail,params:{id:u.id}})},V=ae(),f=p(()=>V.tile),z=J(),{showUserProfiles:A}=N(z);return(u,d)=>(n(),g(oe,{flat:""},{default:l(()=>[s(A)&&t.showAuthor?(n(),k("div",re,[o(j,{author:s(e).author},null,8,["author"])])):K("",!0),o(q,{horizontal:"",class:L({"note-card-content":s(f),column:s(f)})},{default:l(()=>{var i;return[s(f)&&((i=s(e))==null?void 0:i.meta.previewImg)?(n(),k("img",{key:0,src:s(B)(s(e).meta.previewImg)},null,8,ne)):(n(),g(q,{key:1,class:"flex col-3 flex-start"},{default:l(()=>{var r;return[(r=s(e))!=null&&r.meta.previewImg?(n(),g(E,{key:0,class:"pointer rounded-borders",src:s(B)(s(e).meta.previewImg)},null,8,["src"])):(n(),k("div",le))]}),_:1})),o(q,null,{default:l(()=>[x("div",ce,m(s(e).meta.category),1),x("div",{class:"text-h5 q-mt-sm q-mb-xs pointer",onClick:d[0]||(d[0]=r=>b(s(e)))},m(s(e).meta.title),1),x("div",ie,m(s(e).meta.description),1)]),_:1})]}),_:1},8,["class"]),o(X),o(se,null,{default:l(()=>{var i,r;return[o($,{flat:"",round:"",icon:"share"}),o($,{onClick:d[1]||(d[1]=ue=>b(s(e))),flat:"",color:"primary"},{default:l(()=>[O(m(u.$t("read")),1)]),_:1}),o(F,{tags:(r=(i=s(e))==null?void 0:i.meta)==null?void 0:r.tags},null,8,["tags"])]}),_:1})]),_:1}))}});export{ge as _};
