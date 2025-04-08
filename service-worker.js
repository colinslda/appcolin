const CACHE_NAME = 'monapp-pwa-cache-v1';
const urlsToCache = [
    '/', // Si votre serveur redirige / vers index.html
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    // Ajoutez les chemins vers vos icônes ici
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    // Ajoutez les polices si vous les hébergez localement
    // '/fonts/montserrat.woff2',
    // '/fonts/dmsans.woff2'
    // Attention : les polices Google Fonts sont généralement mieux servies par Google
];

// Installation du Service Worker et mise en cache initial
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                // Utiliser addAll pour mettre en cache plusieurs URLs. Attention, si une seule échoue, tout échoue.
                // Pour plus de robustesse, on pourrait utiliser cache.add() individuellement dans une boucle avec des .catch()
                return cache.addAll(urlsToCache).catch(error => {
                    console.error('Failed to cache one or more resources during install:', error);
                    // Vous pourriez vouloir ne pas échouer l'installation complètement ici
                    // ou tenter de cacher seulement les ressources réussies.
                });
            })
            .then(() => {
                // Force le service worker installé à devenir actif immédiatement
                // C'est utile pour les démos, mais peut perturber des clients ouverts sur d'anciennes versions
                // return self.skipWaiting(); // Optionnel: Active immédiatement le nouveau SW
            })
    );
});

// Stratégie de Cache (Cache d'abord, puis réseau)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Pas dans le cache, aller au réseau
                return fetch(event.request).then(
                    networkResponse => {
                        // Vérifier si nous avons reçu une réponse valide
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // IMPORTANT: Cloner la réponse. Une réponse est un flux
                        // et comme nous voulons que le navigateur consomme la réponse
                        // ainsi que le cache consomme la réponse, nous devons la cloner
                        // pour en avoir deux copies.
                        const responseToCache = networkResponse.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // Mettre en cache la nouvelle ressource pour la prochaine fois
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    }
                ).catch(error => {
                    // Gestion d'erreur réseau (par exemple, afficher une page hors ligne si mise en cache)
                    console.error('Fetching failed:', error);
                    // Optionnel: Retourner une page hors ligne par défaut depuis le cache
                    // return caches.match('/offline.html');
                });
            })
    );
});

// Nettoyage des anciens caches lors de l'activation d'un nouveau SW
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME]; // Garder seulement le cache actuel

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Si ce cache n'est pas dans la liste blanche, le supprimer
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        // S'assure que le SW actif contrôle la page immédiatement (si skipWaiting a été utilisé)
        // .then(() => self.clients.claim()) // Optionnel: Prend le contrôle immédiatement
    );
});
