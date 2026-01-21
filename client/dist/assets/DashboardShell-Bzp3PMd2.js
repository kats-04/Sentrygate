import{j as a,A as _,m as C}from"./animations-CVxur35w.js";import{r as p,e as Y,u as D,L as Z}from"./vendor-dbpypOpC.js";import{u as L,v as F,f as Q}from"./index-BPDhQj-8.js";import{s as W,t as X,u as J,v as ee,w as te,B as P,c as se,S as ae,q as re,K as oe,U as ie,p as ne,x as le,a as M,y as ce,h as R}from"./icons-BJJ_CL-s.js";import{A as de}from"./Badge-CuQR1N-9.js";const me=({onChange:e=null,size:t="md"})=>{const[s,n]=p.useState("system"),[r,o]=p.useState(!1);p.useEffect(()=>{const d=localStorage.getItem("theme")||"system";n(d),i(d),o(!0)},[]);const i=d=>{const f=document.documentElement;d==="dark"?f.classList.add("dark"):d==="light"?f.classList.remove("dark"):window.matchMedia("(prefers-color-scheme: dark)").matches?f.classList.add("dark"):f.classList.remove("dark")},l=()=>{const d=["light","dark","system"],f=d.indexOf(s),x=d[(f+1)%d.length];n(x),localStorage.setItem("theme",x),i(x),e&&e(x)};if(!r)return null;const c=t==="sm"?16:t==="lg"?24:20,m="transition-transform duration-300";return a.jsxs("button",{onClick:l,className:"p-2 rounded-lg glass-effect hover:bg-slate-100 dark:hover:bg-slate-700 transition-smooth focus-ring",title:`Current theme: ${s}`,"aria-label":`Toggle theme (current: ${s})`,children:[s==="light"&&a.jsx(W,{size:c,className:m}),s==="dark"&&a.jsx(X,{size:c,className:m}),s==="system"&&a.jsx(J,{size:c,className:m})]})};let pe={data:""},ue=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||pe},fe=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,xe=/\/\*[^]*?\*\/|  +/g,U=/\n+/g,j=(e,t)=>{let s="",n="",r="";for(let o in e){let i=e[o];o[0]=="@"?o[1]=="i"?s=o+" "+i+";":n+=o[1]=="f"?j(i,o):o+"{"+j(i,o[1]=="k"?"":t)+"}":typeof i=="object"?n+=j(i,t?t.replace(/([^,])+/g,l=>o.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,c=>/&/.test(c)?c.replace(/&/g,l):l?l+" "+c:c)):o):i!=null&&(o=/^--/.test(o)?o:o.replace(/[A-Z]/g,"-$&").toLowerCase(),r+=j.p?j.p(o,i):o+":"+i+";")}return s+(t&&r?t+"{"+r+"}":r)+n},b={},B=e=>{if(typeof e=="object"){let t="";for(let s in e)t+=s+B(e[s]);return t}return e},ge=(e,t,s,n,r)=>{let o=B(e),i=b[o]||(b[o]=(c=>{let m=0,d=11;for(;m<c.length;)d=101*d+c.charCodeAt(m++)>>>0;return"go"+d})(o));if(!b[i]){let c=o!==e?e:(m=>{let d,f,x=[{}];for(;d=fe.exec(m.replace(xe,""));)d[4]?x.shift():d[3]?(f=d[3].replace(U," ").trim(),x.unshift(x[0][f]=x[0][f]||{})):x[0][d[1]]=d[2].replace(U," ").trim();return x[0]})(e);b[i]=j(r?{["@keyframes "+i]:c}:c,s?"":"."+i)}let l=s&&b.g?b.g:null;return s&&(b.g=b[i]),((c,m,d,f)=>{f?m.data=m.data.replace(f,c):m.data.indexOf(c)===-1&&(m.data=d?c+m.data:m.data+c)})(b[i],t,n,l),i},he=(e,t,s)=>e.reduce((n,r,o)=>{let i=t[o];if(i&&i.call){let l=i(s),c=l&&l.props&&l.props.className||/^go/.test(l)&&l;i=c?"."+c:l&&typeof l=="object"?l.props?"":j(l,""):l===!1?"":l}return n+r+(i??"")},"");function $(e){let t=this||{},s=e.call?e(t.p):e;return ge(s.unshift?s.raw?he(s,[].slice.call(arguments,1),t.p):s.reduce((n,r)=>Object.assign(n,r&&r.call?r(t.p):r),{}):s,ue(t.target),t.g,t.o,t.k)}let K,E,T;$.bind({g:1});let y=$.bind({k:1});function be(e,t,s,n){j.p=t,K=e,E=s,T=n}function w(e,t){let s=this||{};return function(){let n=arguments;function r(o,i){let l=Object.assign({},o),c=l.className||r.className;s.p=Object.assign({theme:E&&E()},l),s.o=/ *go\d+/.test(c),l.className=$.apply(s,n)+(c?" "+c:"");let m=e;return e[0]&&(m=l.as||e,delete l.as),T&&m[0]&&T(l),K(m,l)}return r}}var ye=e=>typeof e=="function",I=(e,t)=>ye(e)?e(t):e,ve=(()=>{let e=0;return()=>(++e).toString()})(),je=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),we=20,q="default",G=(e,t)=>{let{toastLimit:s}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,s)};case 1:return{...e,toasts:e.toasts.map(i=>i.id===t.toast.id?{...i,...t.toast}:i)};case 2:let{toast:n}=t;return G(e,{type:e.toasts.find(i=>i.id===n.id)?1:0,toast:n});case 3:let{toastId:r}=t;return{...e,toasts:e.toasts.map(i=>i.id===r||r===void 0?{...i,dismissed:!0,visible:!1}:i)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(i=>i.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let o=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(i=>({...i,pauseDuration:i.pauseDuration+o}))}}},ke=[],Ne={toasts:[],pausedAt:void 0,settings:{toastLimit:we}},N={},H=(e,t=q)=>{N[t]=G(N[t]||Ne,e),ke.forEach(([s,n])=>{s===t&&n(N[t])})},V=e=>Object.keys(N).forEach(t=>H(e,t)),Ae=e=>Object.keys(N).find(t=>N[t].toasts.some(s=>s.id===e)),O=(e=q)=>t=>{H(t,e)},Le=(e,t="blank",s)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...s,id:(s==null?void 0:s.id)||ve()}),A=e=>(t,s)=>{let n=Le(t,e,s);return O(n.toasterId||Ae(n.id))({type:2,toast:n}),n.id},g=(e,t)=>A("blank")(e,t);g.error=A("error");g.success=A("success");g.loading=A("loading");g.custom=A("custom");g.dismiss=(e,t)=>{let s={type:3,toastId:e};t?O(t)(s):V(s)};g.dismissAll=e=>g.dismiss(void 0,e);g.remove=(e,t)=>{let s={type:4,toastId:e};t?O(t)(s):V(s)};g.removeAll=e=>g.remove(void 0,e);g.promise=(e,t,s)=>{let n=g.loading(t.loading,{...s,...s==null?void 0:s.loading});return typeof e=="function"&&(e=e()),e.then(r=>{let o=t.success?I(t.success,r):void 0;return o?g.success(o,{id:n,...s,...s==null?void 0:s.success}):g.dismiss(n),r}).catch(r=>{let o=t.error?I(t.error,r):void 0;o?g.error(o,{id:n,...s,...s==null?void 0:s.error}):g.dismiss(n)}),e};var $e=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Se=y`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,ze=y`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Ce=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${$e} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Se} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${ze} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Ee=y`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Te=w("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Ee} 1s linear infinite;
`,Ie=y`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,De=y`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,Oe=w("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ie} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${De} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,Ue=w("div")`
  position: absolute;
`,_e=w("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Fe=y`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Pe=w("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Fe} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,Me=({toast:e})=>{let{icon:t,type:s,iconTheme:n}=e;return t!==void 0?typeof t=="string"?p.createElement(Pe,null,t):t:s==="blank"?null:p.createElement(_e,null,p.createElement(Te,{...n}),s!=="loading"&&p.createElement(Ue,null,s==="error"?p.createElement(Ce,{...n}):p.createElement(Oe,{...n})))},Re=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,Be=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,Ke="0%{opacity:0;} 100%{opacity:1;}",qe="0%{opacity:1;} 100%{opacity:0;}",Ge=w("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,He=w("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,Ve=(e,t)=>{let s=e.includes("top")?1:-1,[n,r]=je()?[Ke,qe]:[Re(s),Be(s)];return{animation:t?`${y(n)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${y(r)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};p.memo(({toast:e,position:t,style:s,children:n})=>{let r=e.height?Ve(e.position||t||"top-center",e.visible):{opacity:0},o=p.createElement(Me,{toast:e}),i=p.createElement(He,{...e.ariaProps},I(e.message,e));return p.createElement(Ge,{className:e.className,style:{...r,...s,...e.style}},typeof n=="function"?n({icon:o,message:i}):p.createElement(p.Fragment,null,o,i))});be(p.createElement);$`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var k=g;let v=null;const Ye=()=>{const[e,t]=p.useState(0),[s,n]=p.useState([]),{user:r}=L();return p.useEffect(()=>{if(!r||r.role!=="Admin")return;v||(v=F("http://localhost:5001",{withCredentials:!0}),v.on("connect",()=>{console.log("🔌 Connected to security alerts"),v.emit("join-admin-room")}),v.on("disconnect",()=>{console.log("🔌 Disconnected from security alerts")}));const i=l=>{console.log("🚨 Security Alert:",l),n(d=>[l,...d].slice(0,50)),t(d=>d+1);const c=l.severity==="critical"?"🚨":"⚠️";(l.severity==="critical"?k.error:k.warning)(`${c} ${l.message}`,{duration:l.severity==="critical"?1e4:5e3,position:"top-right"})};return v.on("security:alert",i),()=>{v&&v.off("security:alert",i)}},[r]),{alertCount:e,alerts:s,clearAlerts:()=>{t(0),n([])}}},Ze=()=>{const[e,t]=p.useState(!1),s=Y(),n=D(),{user:r,logout:o,loading:i}=L(),{alertCount:l}=Ye(),m=[{path:"/dashboard",icon:ee,label:"Dashboard",roles:["Admin","TeamLead","User","Auditor"]},{path:"/analytics",icon:te,label:"Analytics",roles:["Admin","TeamLead","Auditor"]},{path:"/notifications",icon:P,label:"Notifications",roles:["Admin","TeamLead","User","Auditor"]},{path:"/teams",icon:se,label:"Teams",roles:["Admin","TeamLead"]},{path:"/security",icon:ae,label:"Security",roles:["Admin","TeamLead","User"]},{path:"/audit",icon:re,label:"Audit Trail",roles:["Admin","Auditor"]},{path:"/api-keys",icon:oe,label:"API Keys",roles:["Admin","TeamLead","User"]},{path:"/profile",icon:ie,label:"Profile",roles:["Admin","TeamLead","User","Auditor"]},{path:"/settings",icon:ne,label:"Settings",roles:["Admin","TeamLead","User","Auditor"]},{path:"/admin",icon:le,label:"Admin Panel",roles:["Admin"]}].filter(h=>!h.roles||h.roles.includes(r==null?void 0:r.role)),d=h=>s.pathname===h,f=async()=>{try{await o(),n("/login")}catch(h){console.error("Logout failed:",h)}},x={hidden:{x:-320},visible:{x:0,transition:{duration:.3}},exit:{x:-320,transition:{duration:.2}}};return a.jsxs(a.Fragment,{children:[a.jsx("button",{type:"button",onClick:()=>t(!e),className:"hidden max-sm:flex fixed top-4 left-4 z-40 p-2 rounded-lg glass-effect","aria-label":"Toggle menu",children:e?a.jsx(M,{size:24}):a.jsx(ce,{size:24})}),a.jsx(_,{children:e&&a.jsx(C.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:()=>t(!1),className:"fixed inset-0 bg-black/50 z-30 sm:hidden"})}),a.jsxs(C.div,{variants:x,initial:!1,animate:"visible",className:"w-64 h-screen flex-shrink-0 flex-col glass-effect border-r border-slate-200 dark:border-slate-700 z-30 p-6 gap-6 max-md:fixed md:flex",children:[a.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[a.jsx("div",{className:"w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex-center text-white font-bold text-lg",children:"SG"}),a.jsxs("div",{className:"hidden sm:block",children:[a.jsx("span",{className:"font-bold text-xl",children:"SentryGate"}),a.jsxs("div",{className:"flex items-center gap-2",children:[a.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400",children:"Verified access"}),(r==null?void 0:r.role)&&a.jsx("span",{className:`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${r.role==="Admin"?"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300":r.role==="TeamLead"?"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300":r.role==="Auditor"?"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300":"bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`,children:r.role})]})]})]}),a.jsx("nav",{className:"flex-1 flex flex-col gap-2",children:m.map(h=>{const S=h.icon,u=d(h.path);return a.jsxs(Z,{to:h.path,onClick:()=>t(!1),className:`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth
                  ${u?"bg-primary-500 text-white shadow-lg":"text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}
                `,children:[a.jsx(S,{size:20}),a.jsx("span",{className:"font-medium",children:h.label}),h.path==="/audit"&&l>0&&(r==null?void 0:r.role)==="Admin"&&a.jsx("span",{className:"ml-auto bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse",children:l})]},h.path)})}),a.jsxs("button",{type:"button",onClick:f,disabled:i,className:"flex items-center gap-3 px-4 py-3 rounded-lg text-error-600 hover:bg-error-50 dark:hover:bg-error-950/20 transition-smooth w-full disabled:opacity-50 disabled:cursor-not-allowed",children:[a.jsx(R,{size:20}),a.jsx("span",{className:"font-medium",children:i?"Logging out...":"Logout"})]})]}),a.jsx("div",{className:"hidden sm:block w-64 h-screen"})]})},Qe=()=>{const[e,t]=p.useState(!1),s=p.useRef(null),n=D(),{user:r,logout:o,loading:i}=L(),{notifications:l,unreadCount:c,deleteNotification:m,markAsRead:d}=Q(),f=async()=>{try{await o(),n("/login")}catch(u){console.error("Logout failed:",u)}};p.useEffect(()=>{const u=z=>{s.current&&!s.current.contains(z.target)&&t(!1)};return document.addEventListener("mousedown",u),()=>document.removeEventListener("mousedown",u)},[]);const x=(r==null?void 0:r.name)||"User",h=(r==null?void 0:r.role)||"User",S=x.split(" ").map(u=>u[0]).join("").toUpperCase().slice(0,2);return a.jsxs("div",{className:"h-16 glass-effect border-b border-slate-200 dark:border-slate-700 flex-between px-6 gap-4",children:[a.jsx("div",{className:"hidden sm:block flex-1"}),a.jsxs("div",{className:"flex items-center gap-4",children:[a.jsxs("div",{className:"relative",ref:s,children:[a.jsxs("button",{type:"button",onClick:()=>t(!e),className:"relative p-2 rounded-lg glass-effect hover:bg-slate-100 dark:hover:bg-slate-700 transition-smooth focus-ring","aria-label":"Notifications",children:[a.jsx(P,{size:20}),c>0&&a.jsx("span",{className:"absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs rounded-full flex items-center justify-center font-bold",children:c>9?"9+":c})]}),a.jsx(_,{children:e&&a.jsxs(C.div,{initial:{opacity:0,y:-10,scale:.95},animate:{opacity:1,y:0,scale:1},exit:{opacity:0,y:-10,scale:.95},className:"absolute right-0 top-full mt-2 w-80 glass-effect border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-4 z-50",children:[a.jsx("div",{className:"flex justify-between items-center mb-3",children:a.jsx("h3",{className:"font-bold",children:"Notifications"})}),a.jsx("div",{className:"space-y-2 max-h-96 overflow-y-auto",children:l.length>0?l.map(u=>a.jsxs("div",{className:`flex items-start gap-2 p-3 rounded-lg ${u.read?"bg-slate-50 dark:bg-slate-800 opacity-75":"bg-white dark:bg-slate-700 border-l-2 border-primary-500 shadow-sm"}`,onClick:()=>!u.read&&d(u._id),children:[a.jsxs("div",{className:"flex-1 cursor-pointer",children:[a.jsx("p",{className:"text-sm font-medium",children:u.title||"Notification"}),a.jsx("p",{className:"text-xs opacity-90",children:u.message}),a.jsx("p",{className:"text-[10px] text-slate-400 mt-1",children:new Date(u.createdAt||Date.now()).toLocaleString()})]}),a.jsx("button",{type:"button",onClick:z=>{z.stopPropagation(),m(u._id)},className:"flex-shrink-0 hover:opacity-70","aria-label":"Dismiss notification",children:a.jsx(M,{size:14})})]},u._id||u.id)):a.jsx("p",{className:"text-sm text-slate-500 text-center py-4",children:"No notifications"})})]})})]}),a.jsx(me,{}),a.jsxs("div",{className:"flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700",children:[a.jsxs("div",{className:"hidden sm:flex flex-col items-end",children:[a.jsx("p",{className:"text-sm font-semibold text-slate-900 dark:text-slate-50",children:x}),a.jsx("p",{className:"text-xs text-slate-500 dark:text-slate-400",children:h})]}),a.jsx(de,{initials:S,size:"sm"})]}),a.jsx("button",{type:"button",onClick:f,disabled:i,className:"p-2 rounded-lg glass-effect hover:bg-error-50 dark:hover:bg-error-950/20 transition-smooth focus-ring text-error-600 disabled:opacity-50 disabled:cursor-not-allowed","aria-label":"Logout",title:"Logout",children:a.jsx(R,{size:20})})]})]})},st=({children:e})=>{const{user:t,logout:s}=L(),n=D();return p.useEffect(()=>{if(!t)return;const r=F("http://localhost:5001",{withCredentials:!0});return r.on("connect",()=>{r.emit("join-user-room",t._id)}),r.on("force-logout",async o=>{console.log("🚫 Force logout received:",o),k.error(o.reason||"Your account has been suspended by an administrator.",{duration:5e3,position:"top-center"}),setTimeout(async()=>{await s(),n("/login",{replace:!0})},2e3)}),r.on("notification",o=>{o.type==="info"?k(o.message,{icon:"ℹ️"}):o.type==="warning"?k(o.message,{icon:"⚠️"}):o.type==="success"&&k.success(o.message)}),()=>{r.disconnect()}},[t,s,n]),a.jsxs("div",{className:"flex h-screen overflow-x-hidden",children:[a.jsx(Ze,{}),a.jsxs("div",{className:"flex-1 flex flex-col overflow-hidden min-w-0",children:[a.jsx(Qe,{}),a.jsx("div",{className:"flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",children:a.jsx("div",{className:"container-content py-6 sm:py-8",children:e})})]})]})};export{st as D,k as z};
