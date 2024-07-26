var B=Object.defineProperty;var H=(e,t,r)=>t in e?B(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var v=(e,t,r)=>(H(e,typeof t!="symbol"?t+"":t,r),r);import{b as V}from"./index-DftpuOf4.js";var j=(e=>(e.KeepAlive="keep alive",e))(j||{});class z{constructor(t){v(this,"type","keep alive");this.id=t}}var E=function(e,t){return E=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(r,n){r.__proto__=n}||function(r,n){for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(r[o]=n[o])},E(e,t)};function d(e,t){if(typeof t!="function"&&t!==null)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");E(e,t);function r(){this.constructor=e}e.prototype=t===null?Object.create(t):(r.prototype=t.prototype,new r)}function A(e){var t=typeof Symbol=="function"&&Symbol.iterator,r=t&&e[t],n=0;if(r)return r.call(e);if(e&&typeof e.length=="number")return{next:function(){return e&&n>=e.length&&(e=void 0),{value:e&&e[n++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}function x(e,t){var r=typeof Symbol=="function"&&e[Symbol.iterator];if(!r)return e;var n=r.call(e),o,i=[],s;try{for(;(t===void 0||t-- >0)&&!(o=n.next()).done;)i.push(o.value)}catch(u){s={error:u}}finally{try{o&&!o.done&&(r=n.return)&&r.call(n)}finally{if(s)throw s.error}}return i}function O(e,t,r){if(r||arguments.length===2)for(var n=0,o=t.length,i;n<o;n++)(i||!(n in t))&&(i||(i=Array.prototype.slice.call(t,0,n)),i[n]=t[n]);return e.concat(i||Array.prototype.slice.call(t))}function l(e){return typeof e=="function"}function F(e){var t=function(n){Error.call(n),n.stack=new Error().stack},r=e(t);return r.prototype=Object.create(Error.prototype),r.prototype.constructor=r,r}var g=F(function(e){return function(r){e(this),this.message=r?r.length+` errors occurred during unsubscription:
`+r.map(function(n,o){return o+1+") "+n.toString()}).join(`
  `):"",this.name="UnsubscriptionError",this.errors=r}});function k(e,t){if(e){var r=e.indexOf(t);0<=r&&e.splice(r,1)}}var S=function(){function e(t){this.initialTeardown=t,this.closed=!1,this._parentage=null,this._finalizers=null}return e.prototype.unsubscribe=function(){var t,r,n,o,i;if(!this.closed){this.closed=!0;var s=this._parentage;if(s)if(this._parentage=null,Array.isArray(s))try{for(var u=A(s),c=u.next();!c.done;c=u.next()){var f=c.value;f.remove(this)}}catch(a){t={error:a}}finally{try{c&&!c.done&&(r=u.return)&&r.call(u)}finally{if(t)throw t.error}}else s.remove(this);var p=this.initialTeardown;if(l(p))try{p()}catch(a){i=a instanceof g?a.errors:[a]}var U=this._finalizers;if(U){this._finalizers=null;try{for(var b=A(U),h=b.next();!h.done;h=b.next()){var Y=h.value;try{C(Y)}catch(a){i=i!=null?i:[],a instanceof g?i=O(O([],x(i)),x(a.errors)):i.push(a)}}}catch(a){n={error:a}}finally{try{h&&!h.done&&(o=b.return)&&o.call(b)}finally{if(n)throw n.error}}}if(i)throw new g(i)}},e.prototype.add=function(t){var r;if(t&&t!==this)if(this.closed)C(t);else{if(t instanceof e){if(t.closed||t._hasParent(this))return;t._addParent(this)}(this._finalizers=(r=this._finalizers)!==null&&r!==void 0?r:[]).push(t)}},e.prototype._hasParent=function(t){var r=this._parentage;return r===t||Array.isArray(r)&&r.includes(t)},e.prototype._addParent=function(t){var r=this._parentage;this._parentage=Array.isArray(r)?(r.push(t),r):r?[r,t]:t},e.prototype._removeParent=function(t){var r=this._parentage;r===t?this._parentage=null:Array.isArray(r)&&k(r,t)},e.prototype.remove=function(t){var r=this._finalizers;r&&k(r,t),t instanceof e&&t._removeParent(this)},e.EMPTY=function(){var t=new e;return t.closed=!0,t}(),e}(),R=S.EMPTY;function W(e){return e instanceof S||e&&"closed"in e&&l(e.remove)&&l(e.add)&&l(e.unsubscribe)}function C(e){l(e)?e():e.unsubscribe()}var D={onUnhandledError:null,onStoppedNotification:null,Promise:void 0,useDeprecatedSynchronousErrorHandling:!1,useDeprecatedNextContext:!1},L={setTimeout:function(e,t){for(var r=[],n=2;n<arguments.length;n++)r[n-2]=arguments[n];return setTimeout.apply(void 0,O([e,t],x(r)))},clearTimeout:function(e){var t=L.delegate;return((t==null?void 0:t.clearTimeout)||clearTimeout)(e)},delegate:void 0};function q(e){L.setTimeout(function(){throw e})}function I(){}function m(e){e()}var T=function(e){d(t,e);function t(r){var n=e.call(this)||this;return n.isStopped=!1,r?(n.destination=r,W(r)&&r.add(n)):n.destination=X,n}return t.create=function(r,n,o){return new P(r,n,o)},t.prototype.next=function(r){this.isStopped||this._next(r)},t.prototype.error=function(r){this.isStopped||(this.isStopped=!0,this._error(r))},t.prototype.complete=function(){this.isStopped||(this.isStopped=!0,this._complete())},t.prototype.unsubscribe=function(){this.closed||(this.isStopped=!0,e.prototype.unsubscribe.call(this),this.destination=null)},t.prototype._next=function(r){this.destination.next(r)},t.prototype._error=function(r){try{this.destination.error(r)}finally{this.unsubscribe()}},t.prototype._complete=function(){try{this.destination.complete()}finally{this.unsubscribe()}},t}(S),G=Function.prototype.bind;function _(e,t){return G.call(e,t)}var J=function(){function e(t){this.partialObserver=t}return e.prototype.next=function(t){var r=this.partialObserver;if(r.next)try{r.next(t)}catch(n){y(n)}},e.prototype.error=function(t){var r=this.partialObserver;if(r.error)try{r.error(t)}catch(n){y(n)}else y(t)},e.prototype.complete=function(){var t=this.partialObserver;if(t.complete)try{t.complete()}catch(r){y(r)}},e}(),P=function(e){d(t,e);function t(r,n,o){var i=e.call(this)||this,s;if(l(r)||!r)s={next:r!=null?r:void 0,error:n!=null?n:void 0,complete:o!=null?o:void 0};else{var u;i&&D.useDeprecatedNextContext?(u=Object.create(r),u.unsubscribe=function(){return i.unsubscribe()},s={next:r.next&&_(r.next,u),error:r.error&&_(r.error,u),complete:r.complete&&_(r.complete,u)}):s=r}return i.destination=new J(s),i}return t}(T);function y(e){q(e)}function Q(e){throw e}var X={closed:!0,next:I,error:Q,complete:I},Z=function(){return typeof Symbol=="function"&&Symbol.observable||"@@observable"}();function N(e){return e}function rr(e){return e.length===0?N:e.length===1?e[0]:function(r){return e.reduce(function(n,o){return o(n)},r)}}var M=function(){function e(t){t&&(this._subscribe=t)}return e.prototype.lift=function(t){var r=new e;return r.source=this,r.operator=t,r},e.prototype.subscribe=function(t,r,n){var o=this,i=er(t)?t:new P(t,r,n);return m(function(){var s=o,u=s.operator,c=s.source;i.add(u?u.call(i,c):c?o._subscribe(i):o._trySubscribe(i))}),i},e.prototype._trySubscribe=function(t){try{return this._subscribe(t)}catch(r){t.error(r)}},e.prototype.forEach=function(t,r){var n=this;return r=K(r),new r(function(o,i){var s=new P({next:function(u){try{t(u)}catch(c){i(c),s.unsubscribe()}},error:i,complete:o});n.subscribe(s)})},e.prototype._subscribe=function(t){var r;return(r=this.source)===null||r===void 0?void 0:r.subscribe(t)},e.prototype[Z]=function(){return this},e.prototype.pipe=function(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];return rr(t)(this)},e.prototype.toPromise=function(t){var r=this;return t=K(t),new t(function(n,o){var i;r.subscribe(function(s){return i=s},function(s){return o(s)},function(){return n(i)})})},e.create=function(t){return new e(t)},e}();function K(e){var t;return(t=e!=null?e:D.Promise)!==null&&t!==void 0?t:Promise}function tr(e){return e&&l(e.next)&&l(e.error)&&l(e.complete)}function er(e){return e&&e instanceof T||tr(e)&&W(e)}function nr(e){return l(e==null?void 0:e.lift)}function or(e){return function(t){if(nr(t))return t.lift(function(r){try{return e(r,this)}catch(n){this.error(n)}});throw new TypeError("Unable to lift unknown Observable type")}}function ir(e,t,r,n,o){return new sr(e,t,r,n,o)}var sr=function(e){d(t,e);function t(r,n,o,i,s,u){var c=e.call(this,r)||this;return c.onFinalize=s,c.shouldUnsubscribe=u,c._next=n?function(f){try{n(f)}catch(p){r.error(p)}}:e.prototype._next,c._error=i?function(f){try{i(f)}catch(p){r.error(p)}finally{this.unsubscribe()}}:e.prototype._error,c._complete=o?function(){try{o()}catch(f){r.error(f)}finally{this.unsubscribe()}}:e.prototype._complete,c}return t.prototype.unsubscribe=function(){var r;if(!this.shouldUnsubscribe||this.shouldUnsubscribe()){var n=this.closed;e.prototype.unsubscribe.call(this),!n&&((r=this.onFinalize)===null||r===void 0||r.call(this))}},t}(T),ur=F(function(e){return function(){e(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed"}}),w=function(e){d(t,e);function t(){var r=e.call(this)||this;return r.closed=!1,r.currentObservers=null,r.observers=[],r.isStopped=!1,r.hasError=!1,r.thrownError=null,r}return t.prototype.lift=function(r){var n=new $(this,this);return n.operator=r,n},t.prototype._throwIfClosed=function(){if(this.closed)throw new ur},t.prototype.next=function(r){var n=this;m(function(){var o,i;if(n._throwIfClosed(),!n.isStopped){n.currentObservers||(n.currentObservers=Array.from(n.observers));try{for(var s=A(n.currentObservers),u=s.next();!u.done;u=s.next()){var c=u.value;c.next(r)}}catch(f){o={error:f}}finally{try{u&&!u.done&&(i=s.return)&&i.call(s)}finally{if(o)throw o.error}}}})},t.prototype.error=function(r){var n=this;m(function(){if(n._throwIfClosed(),!n.isStopped){n.hasError=n.isStopped=!0,n.thrownError=r;for(var o=n.observers;o.length;)o.shift().error(r)}})},t.prototype.complete=function(){var r=this;m(function(){if(r._throwIfClosed(),!r.isStopped){r.isStopped=!0;for(var n=r.observers;n.length;)n.shift().complete()}})},t.prototype.unsubscribe=function(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null},Object.defineProperty(t.prototype,"observed",{get:function(){var r;return((r=this.observers)===null||r===void 0?void 0:r.length)>0},enumerable:!1,configurable:!0}),t.prototype._trySubscribe=function(r){return this._throwIfClosed(),e.prototype._trySubscribe.call(this,r)},t.prototype._subscribe=function(r){return this._throwIfClosed(),this._checkFinalizedStatuses(r),this._innerSubscribe(r)},t.prototype._innerSubscribe=function(r){var n=this,o=this,i=o.hasError,s=o.isStopped,u=o.observers;return i||s?R:(this.currentObservers=null,u.push(r),new S(function(){n.currentObservers=null,k(u,r)}))},t.prototype._checkFinalizedStatuses=function(r){var n=this,o=n.hasError,i=n.thrownError,s=n.isStopped;o?r.error(i):s&&r.complete()},t.prototype.asObservable=function(){var r=new M;return r.source=this,r},t.create=function(r,n){return new $(r,n)},t}(M),$=function(e){d(t,e);function t(r,n){var o=e.call(this)||this;return o.destination=r,o.source=n,o}return t.prototype.next=function(r){var n,o;(o=(n=this.destination)===null||n===void 0?void 0:n.next)===null||o===void 0||o.call(n,r)},t.prototype.error=function(r){var n,o;(o=(n=this.destination)===null||n===void 0?void 0:n.error)===null||o===void 0||o.call(n,r)},t.prototype.complete=function(){var r,n;(n=(r=this.destination)===null||r===void 0?void 0:r.complete)===null||n===void 0||n.call(r)},t.prototype._subscribe=function(r){var n,o;return(o=(n=this.source)===null||n===void 0?void 0:n.subscribe(r))!==null&&o!==void 0?o:R},t}(w);function cr(e,t){return or(function(r,n){var o=0;r.subscribe(ir(n,function(i){return e.call(t,i,o++)&&n.next(i)}))})}class ar{constructor(t){v(this,"closed$",new w);v(this,"message$",new w);this.worker=t,this.watchMessages()}watchMessage(t){return this.message$.pipe(cr(r=>r.type===t))}watchMessages(){this.worker.onmessage=({data:t})=>{if(t.type===j.KeepAlive){clearTimeout(t.id);return}this.message$.next(t)}}emit(t){this.worker.postMessage(t)}}class lr extends ar{constructor(){super(...arguments);v(this,"error$",new w)}watchMessages(){this.worker.onmessage=({data:r})=>{this.checkKeepAliveAction(r)||this.message$.next(r)},this.worker.onmessageerror=r=>{this.error$.next(r)}}checkKeepAliveAction(r){if(r.type===j.KeepAlive)return console.log(`✎: [shared-worker][${new Date().toString()}] KEEP ALIVE SW`),this.worker.postMessage(new z(r.id)),!0}close(){this.closed$.next(),this.worker.terminate()}}const hr=V(({store:e})=>{const t=new Worker(new URL(""+new URL("graph.worker-DPcNo8Rh.js",import.meta.url).href,import.meta.url),{type:"module"}),r=new lr(t);e.use(()=>({graphWorker:r}))});export{hr as default};