// SUPER DEFENSE - service worker (troque o número da versão abaixo para forçar atualização)
const V='sd-v1',MUS='sd-musica';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==MUS).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function music(req){
 const c=await caches.open(MUS);let res=await c.match(req.url);
 if(!res){const net=await fetch(req.url);if(!net.ok)return net;await c.put(req.url,net.clone());res=net}
 const r=req.headers.get('range');if(!r)return res;
 const buf=await res.arrayBuffer(),m=/bytes=(\d*)-(\d*)/.exec(r),n=buf.byteLength;
 let s=m&&m[1]?+m[1]:0,e=m&&m[2]?+m[2]:n-1;e=Math.min(e,n-1);
 return new Response(buf.slice(s,e+1),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':'bytes '+s+'-'+e+'/'+n,'Content-Length':String(e-s+1)}})}
async function netFirst(req){
 try{const net=await fetch(req);if(net&&net.ok){const c=await caches.open(V);c.put(req,net.clone())}return net}
 catch(err){const c=await caches.match(req,{ignoreSearch:true});if(c)return c;if(req.mode=='navigate'){const i=await caches.match('./index.html');if(i)return i}throw err}}
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.origin!==location.origin)return;
 if(u.pathname.includes('/musica/'))e.respondWith(music(req));else e.respondWith(netFirst(req))});
