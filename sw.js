// SUPER DEFENSE - service worker (troque o número da versão abaixo para forçar atualização)
const V='sd-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function netFirst(req){
 try{const net=await fetch(req);if(net&&net.ok){const c=await caches.open(V);c.put(req,net.clone())}return net}
 catch(err){const c=await caches.match(req,{ignoreSearch:true});if(c)return c;if(req.mode=='navigate'){const i=await caches.match('./index.html');if(i)return i}throw err}}
self.addEventListener('fetch',e=>{
 const req=e.request;if(req.method!=='GET')return;const u=new URL(req.url);if(u.origin!==location.origin)return;
 if(u.pathname.includes('/musica/'))return; // músicas: o navegador cuida (cache e Range)
 e.respondWith(netFirst(req))});
