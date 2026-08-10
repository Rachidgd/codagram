import{u as x,a as y,b as S,c as f,r as i,_ as j,e as a,j as e,M as w,L as g,O as k,S as M}from"./components-Csna4H5K.js";/**
 * @remix-run/react v2.17.5
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let l="positions";function O({getKey:r,...c}){let{isSpaMode:u}=x(),o=y(),p=S();f({getKey:r,storageKey:l});let d=i.useMemo(()=>{if(!r)return null;let t=r(o,p);return t!==o.key?t:null},[]);if(u)return null;let h=((t,m)=>{if(!window.history.state||!window.history.state.key){let s=Math.random().toString(32).slice(2);window.history.replaceState({key:s},"")}try{let n=JSON.parse(sessionStorage.getItem(t)||"{}")[m||window.history.state.key];typeof n=="number"&&window.scrollTo(0,n)}catch(s){console.error(s),sessionStorage.removeItem(t)}}).toString();return i.createElement("script",j({},c,{suppressHydrationWarning:!0,dangerouslySetInnerHTML:{__html:`(${h})(${a(JSON.stringify(l))}, ${a(JSON.stringify(d))})`}}))}function R(){return e.jsxs("html",{lang:"fr",children:[e.jsxs("head",{children:[e.jsx("meta",{charSet:"utf-8"}),e.jsx("meta",{name:"viewport",content:"width=device-width,initial-scale=1"}),e.jsx("link",{rel:"preconnect",href:"https://cdn.shopify.com/"}),e.jsx(w,{}),e.jsx(g,{})]}),e.jsxs("body",{children:[e.jsx(k,{}),e.jsx(O,{}),e.jsx(M,{})]})]})}export{R as default};
