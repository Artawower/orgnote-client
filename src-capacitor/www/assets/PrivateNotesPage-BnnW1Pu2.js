import{ak as Ae,cr as Y,aW as ve,r as m,d,cs as De,w as D,an as xe,ct as $e,aj as Fe,aQ as Qe,aR as Ve,j as A,ap as pe,ab as he,aq as Ee,h as me,b6 as He,z as ge,o as C,e as E,a2 as H,b1 as p,A as te,bw as je,k as We,bn as ze,F as Z,cu as Oe,D as Ue,E as ee,H as Ge}from"./index-D7E76tEZ.js";import{Q as Ke}from"./QPage-YHCRAyud.js";import{r as Xe}from"./min-page-height-C8LjVHEA.js";import{u as Je}from"./PublicNotePreview-En5dN7gu.js";import{N as Ye}from"./NoteList-C2M7Kp_r.js";import{Q as Ze,a as et}from"./QFooter-C4bPpXcZ.js";import"./view-CdSOi7sY.js";import"./AuthorInfo-B3JFv3xO.js";import"./AsyncItemContainer-BYpAPkRM.js";import"./use-hydration-DlVtJJeb.js";function tt(t,g,c){const r=c===!0?["left","right"]:["top","bottom"];return`absolute-${g===!0?r[0]:r[1]}${t?` text-${t}`:""}`}const ot=["left","center","right","justify"],nt=Ae({name:"QTabs",props:{modelValue:[Number,String],align:{type:String,default:"center",validator:t=>ot.includes(t)},breakpoint:{type:[String,Number],default:600},vertical:Boolean,shrink:Boolean,stretch:Boolean,activeClass:String,activeColor:String,activeBgColor:String,indicatorColor:String,leftIcon:String,rightIcon:String,outsideArrows:Boolean,mobileArrows:Boolean,switchIndicator:Boolean,narrowIndicator:Boolean,inlineLabel:Boolean,noCaps:Boolean,dense:Boolean,contentClass:String,"onUpdate:modelValue":[Function,Array]},setup(t,{slots:g,emit:c}){const{proxy:r}=Ee(),{$q:v}=r,{registerTick:k}=Y(),{registerTick:j}=Y(),{registerTick:W}=Y(),{registerTimeout:P,removeTimeout:R}=ve(),{registerTimeout:B,removeTimeout:oe}=ve(),_=m(null),f=m(null),y=m(t.modelValue),q=m(!1),z=m(!0),O=m(!1),ne=m(!1),h=[],U=m(0),x=m(!1);let L=null,I=null,S;const be=d(()=>({activeClass:t.activeClass,activeColor:t.activeColor,activeBgColor:t.activeBgColor,indicatorClass:tt(t.indicatorColor,t.switchIndicator,t.vertical),narrowIndicator:t.narrowIndicator,inlineLabel:t.inlineLabel,noCaps:t.noCaps})),_e=d(()=>{const e=U.value,o=y.value;for(let n=0;n<e;n++)if(h[n].name.value===o)return!0;return!1}),Se=d(()=>`q-tabs__content--align-${q.value===!0?"left":ne.value===!0?"justify":t.align}`),Te=d(()=>`q-tabs row no-wrap items-center q-tabs--${q.value===!0?"":"not-"}scrollable q-tabs--${t.vertical===!0?"vertical":"horizontal"} q-tabs__arrows--${t.outsideArrows===!0?"outside":"inside"} q-tabs--mobile-with${t.mobileArrows===!0?"":"out"}-arrows`+(t.dense===!0?" q-tabs--dense":"")+(t.shrink===!0?" col-shrink":"")+(t.stretch===!0?" self-stretch":"")),we=d(()=>"q-tabs__content scroll--mobile row no-wrap items-center self-stretch hide-scrollbar relative-position "+Se.value+(t.contentClass!==void 0?` ${t.contentClass}`:"")),$=d(()=>t.vertical===!0?{container:"height",content:"offsetHeight",scroll:"scrollHeight"}:{container:"width",content:"offsetWidth",scroll:"scrollWidth"}),F=d(()=>t.vertical!==!0&&v.lang.rtl===!0),G=d(()=>De===!1&&F.value===!0);D(F,N),D(()=>t.modelValue,e=>{K({name:e,setCurrent:!0,skipEmit:!0})}),D(()=>t.outsideArrows,Q);function K({name:e,setCurrent:o,skipEmit:n}){y.value!==e&&(n!==!0&&t["onUpdate:modelValue"]!==void 0&&c("update:modelValue",e),(o===!0||t["onUpdate:modelValue"]===void 0)&&(ye(y.value,e),y.value=e))}function Q(){k(()=>{re({width:_.value.offsetWidth,height:_.value.offsetHeight})})}function re(e){if($.value===void 0||f.value===null)return;const o=e[$.value.container],n=Math.min(f.value[$.value.scroll],Array.prototype.reduce.call(f.value.children,(i,a)=>i+(a[$.value.content]||0),0)),s=o>0&&n>o;q.value=s,s===!0&&j(N),ne.value=o<parseInt(t.breakpoint,10)}function ye(e,o){const n=e!=null&&e!==""?h.find(i=>i.name.value===e):null,s=o!=null&&o!==""?h.find(i=>i.name.value===o):null;if(n&&s){const i=n.tabIndicatorRef.value,a=s.tabIndicatorRef.value;L!==null&&(clearTimeout(L),L=null),i.style.transition="none",i.style.transform="none",a.style.transition="none",a.style.transform="none";const l=i.getBoundingClientRect(),u=a.getBoundingClientRect();a.style.transform=t.vertical===!0?`translate3d(0,${l.top-u.top}px,0) scale3d(1,${u.height?l.height/u.height:1},1)`:`translate3d(${l.left-u.left}px,0,0) scale3d(${u.width?l.width/u.width:1},1,1)`,W(()=>{L=setTimeout(()=>{L=null,a.style.transition="transform .25s cubic-bezier(.4, 0, .2, 1)",a.style.transform="none"},70)})}s&&q.value===!0&&M(s.rootRef.value)}function M(e){const{left:o,width:n,top:s,height:i}=f.value.getBoundingClientRect(),a=e.getBoundingClientRect();let l=t.vertical===!0?a.top-s:a.left-o;if(l<0){f.value[t.vertical===!0?"scrollTop":"scrollLeft"]+=Math.floor(l),N();return}l+=t.vertical===!0?a.height-i:a.width-n,l>0&&(f.value[t.vertical===!0?"scrollTop":"scrollLeft"]+=Math.ceil(l),N())}function N(){const e=f.value;if(e===null)return;const o=e.getBoundingClientRect(),n=t.vertical===!0?e.scrollTop:Math.abs(e.scrollLeft);F.value===!0?(z.value=Math.ceil(n+o.width)<e.scrollWidth-1,O.value=n>0):(z.value=n>0,O.value=t.vertical===!0?Math.ceil(n+o.height)<e.scrollHeight:Math.ceil(n+o.width)<e.scrollWidth)}function le(e){I!==null&&clearInterval(I),I=setInterval(()=>{ke(e)===!0&&T()},5)}function ae(){le(G.value===!0?Number.MAX_SAFE_INTEGER:0)}function se(){le(G.value===!0?0:Number.MAX_SAFE_INTEGER)}function T(){I!==null&&(clearInterval(I),I=null)}function Le(e,o){const n=Array.prototype.filter.call(f.value.children,u=>u===o||u.matches&&u.matches(".q-tab.q-focusable")===!0),s=n.length;if(s===0)return;if(e===36)return M(n[0]),n[0].focus(),!0;if(e===35)return M(n[s-1]),n[s-1].focus(),!0;const i=e===(t.vertical===!0?38:37),a=e===(t.vertical===!0?40:39),l=i===!0?-1:a===!0?1:void 0;if(l!==void 0){const u=F.value===!0?-1:1,b=n.indexOf(o)+l*u;return b>=0&&b<s&&(M(n[b]),n[b].focus({preventScroll:!0})),!0}}const Ce=d(()=>G.value===!0?{get:e=>Math.abs(e.scrollLeft),set:(e,o)=>{e.scrollLeft=-o}}:t.vertical===!0?{get:e=>e.scrollTop,set:(e,o)=>{e.scrollTop=o}}:{get:e=>e.scrollLeft,set:(e,o)=>{e.scrollLeft=o}});function ke(e){const o=f.value,{get:n,set:s}=Ce.value;let i=!1,a=n(o);const l=e<a?-1:1;return a+=l*5,a<0?(i=!0,a=0):(l===-1&&a<=e||l===1&&a>=e)&&(i=!0,a=e),s(o,a),N(),i}function ie(e,o){for(const n in e)if(e[n]!==o[n])return!1;return!0}function qe(){let e=null,o={matchedLen:0,queryDiff:9999,hrefLen:0};const n=h.filter(l=>l.routeData!==void 0&&l.routeData.hasRouterLink.value===!0),{hash:s,query:i}=r.$route,a=Object.keys(i).length;for(const l of n){const u=l.routeData.exact.value===!0;if(l.routeData[u===!0?"linkIsExactActive":"linkIsActive"].value!==!0)continue;const{hash:b,query:X,matched:Re,href:Be}=l.routeData.resolvedLink.value,J=Object.keys(X).length;if(u===!0){if(b!==s||J!==a||ie(i,X)===!1)continue;e=l.name.value;break}if(b!==""&&b!==s||J!==0&&ie(X,i)===!1)continue;const w={matchedLen:Re.length,queryDiff:a-J,hrefLen:Be.length-b.length};if(w.matchedLen>o.matchedLen){e=l.name.value,o=w;continue}else if(w.matchedLen!==o.matchedLen)continue;if(w.queryDiff<o.queryDiff)e=l.name.value,o=w;else if(w.queryDiff!==o.queryDiff)continue;w.hrefLen>o.hrefLen&&(e=l.name.value,o=w)}e===null&&h.some(l=>l.routeData===void 0&&l.name.value===y.value)===!0||K({name:e,setCurrent:!0})}function Ie(e){if(R(),x.value!==!0&&_.value!==null&&e.target&&typeof e.target.closest=="function"){const o=e.target.closest(".q-tab");o&&_.value.contains(o)===!0&&(x.value=!0,q.value===!0&&M(o))}}function Me(){P(()=>{x.value=!1},30)}function V(){ue.avoidRouteWatcher===!1?B(qe):oe()}function ce(){if(S===void 0){const e=D(()=>r.$route.fullPath,V);S=()=>{e(),S=void 0}}}function Ne(e){h.push(e),U.value++,Q(),e.routeData===void 0||r.$route===void 0?B(()=>{if(q.value===!0){const o=y.value,n=o!=null&&o!==""?h.find(s=>s.name.value===o):null;n&&M(n.rootRef.value)}}):(ce(),e.routeData.hasRouterLink.value===!0&&V())}function Pe(e){h.splice(h.indexOf(e),1),U.value--,Q(),S!==void 0&&e.routeData!==void 0&&(h.every(o=>o.routeData===void 0)===!0&&S(),V())}const ue={currentModel:y,tabProps:be,hasFocus:x,hasActiveTab:_e,registerTab:Ne,unregisterTab:Pe,verifyRouteModel:V,updateModel:K,onKbdNavigate:Le,avoidRouteWatcher:!1};xe($e,ue);function fe(){L!==null&&clearTimeout(L),T(),S!==void 0&&S()}let de;return Fe(fe),Qe(()=>{de=S!==void 0,fe()}),Ve(()=>{de===!0&&ce(),Q()}),()=>A("div",{ref:_,class:Te.value,role:"tablist",onFocusin:Ie,onFocusout:Me},[A(Ze,{onResize:re}),A("div",{ref:f,class:we.value,onScroll:N},pe(g.default)),A(he,{class:"q-tabs__arrow q-tabs__arrow--left absolute q-tab__icon"+(z.value===!0?"":" q-tabs__arrow--faded"),name:t.leftIcon||v.iconSet.tabs[t.vertical===!0?"up":"left"],onMousedownPassive:ae,onTouchstartPassive:ae,onMouseupPassive:T,onMouseleavePassive:T,onTouchendPassive:T}),A(he,{class:"q-tabs__arrow q-tabs__arrow--right absolute q-tab__icon"+(O.value===!0?"":" q-tabs__arrow--faded"),name:t.rightIcon||v.iconSet.tabs[t.vertical===!0?"down":"right"],onMousedownPassive:se,onTouchstartPassive:se,onMouseupPassive:T,onMouseleavePassive:T,onTouchendPassive:T})])}}),rt=me({__name:"ModeLine",props:{tabMode:{type:Boolean,default:!0}},setup(t,{expose:g}){g();const c=t,r=He(c,"tabMode"),v={props:c,tabMode:r};return Object.defineProperty(v,"__isScriptSetup",{enumerable:!1,value:!0}),v}}),lt={key:1,class:"footer-content q-px-lg"};function at(t,g,c,r,v,k){return C(),E(et,{class:"no-shadow modeline center-container"},{default:H(()=>[r.tabMode?(C(),E(nt,{key:0,"inline-label":"","indicator-color":"red"},{default:H(()=>[p(t.$slots,"default")]),_:3})):(C(),te("div",lt,[p(t.$slots,"left"),p(t.$slots,"middle"),p(t.$slots,"right")]))]),_:3})}const st=ge(rt,[["render",at],["__file","ModeLine.vue"]]),it=!1,ct=me({__name:"PrivateNotesPage",setup(t,{expose:g}){g();const c=je(),r=We(),v=m(null),k=()=>{c.setFilters({searchText:r.query.search,userId:r.params.userId})},j=d(()=>c.filters.limit),W=d(()=>c.filters.offset),P=()=>{k(),c.loadNotes()};P(),D(()=>r.params.userId,()=>{var f;((f=c.filters)==null?void 0:f.userId)!=r.params.userId&&P()});const R=Je(),B=ze(),_={notesStore:c,route:r,scrollTarget:v,setFiltersFromQuery:k,limit:j,offset:W,reloadNotes:P,selectedNotesStore:R,syncStore:B,deleteSelectedNotes:async()=>{await c.deleteNotes(R.selectedNotesIds),B.markToSync(),R.clearSelectedNotes()},isModeLineVisible:it,get resetPageMinHeight(){return Xe},NoteList:Ye,ModeLine:st};return Object.defineProperty(_,"__isScriptSetup",{enumerable:!1,value:!0}),_}}),ut={ref:"scrollTarget",class:"scroll-container"},ft={key:0};function dt(t,g,c,r,v,k){return C(),te("div",ut,[Z(Ke,{"style-fn":r.resetPageMinHeight,class:"center-container"},{default:H(()=>[Z(r.NoteList,{selectable:!0,limit:r.limit,offset:r.offset,total:r.notesStore.total,"fetch-notes":r.notesStore.fetchNotes,notes:r.notesStore.notes,"scroll-target":r.scrollTarget},null,8,["limit","offset","total","fetch-notes","notes","scroll-target"]),r.isModeLineVisible?(C(),E(r.ModeLine,{key:0,"tab-mode":!1},{left:H(()=>[Z(Oe,{style:{"margin-left":"-3px"},"model-value":r.selectedNotesStore.isAllNotesSelected,size:"sm","onUpdate:modelValue":r.selectedNotesStore.toggleBulkNotesSelection},null,8,["model-value","onUpdate:modelValue"]),r.selectedNotesStore.selectedNotesIds.length?(C(),te("div",ft,Ue(r.selectedNotesStore.selectedNotesIds.length),1)):ee("",!0),r.selectedNotesStore.isSomeNotesSelected?(C(),E(Ge,{key:1,square:"",class:"themed-button",icon:"delete",flat:"",onClick:r.deleteSelectedNotes})):ee("",!0)]),_:1})):ee("",!0)]),_:1},8,["style-fn"])],512)}const Lt=ge(ct,[["render",dt],["__scopeId","data-v-3de9d1c8"],["__file","PrivateNotesPage.vue"]]);export{Lt as default};
