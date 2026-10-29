const V='asn-andu-v2',CORE=['/','/dashboard/','/komunitas/','/vault/','/vault/ekin/','/profil/','/bantuan/','/harga/','/privasi/','/syarat/','/keamanan/','/assets/css/app.css','/assets/js/app.js','/assets/js/site.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(V).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('/'))))});
self.addEventListener('push',e=>{const d=e.data?e.data.text():'Ada pengingat baru dari ASN Andu';e.waitUntil(self.registration.showNotification('ASN Andu',{body:d,icon:'/assets/icon.svg'}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('/dashboard/'))});
