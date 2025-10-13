# Système de Cache API - Documentation

## Vue d'ensemble

Ce système de cache réduit drastiquement les appels aux APIs externes (CoinGecko, Alternative.me) en stockant les données en mémoire. Au lieu de 100 utilisateurs = 100 requêtes API, on obtient 100 utilisateurs = 1-2 requêtes API par minute.

## Architecture

```
Client (React)
    ↓
API Proxy (/api/crypto/*)
    ↓
Cache en mémoire (src/lib/cache.ts)
    ↓ (si cache manquant/expiré)
API externe (CoinGecko, Alternative.me)
```

## Fichiers créés

### 1. `src/lib/cache.ts`
Système de cache centralisé avec :
- Stockage en mémoire (Map)
- TTL (Time To Live) configurable
- Nettoyage automatique toutes les 5 minutes
- Wrapper `fetchWithCache()` pour simplifier l'usage

**Durées de cache :**
```typescript
VERY_SHORT: 30s    // Données ultra-volatiles
SHORT: 1min        // Prix crypto temps réel
MEDIUM: 5min       // Stats marché, Fear & Greed
LONG: 30min        // Données historiques
VERY_LONG: 1h      // Données quasi-statiques
DAY: 24h           // Données rarement mises à jour
```

### 2. API Routes créées

#### `/api/crypto/markets`
- **Remplace :** `https://api.coingecko.com/api/v3/coins/markets`
- **Cache :** 1 minute
- **Usage :** Prix en temps réel, market cap, volumes
- **Params :** `?ids=bitcoin,ethereum&vs_currency=usd`

#### `/api/crypto/global`
- **Remplace :** `https://api.coingecko.com/api/v3/global`
- **Cache :** 5 minutes
- **Usage :** Stats globales du marché (market cap total, dominance BTC/ETH)

#### `/api/crypto/fear-greed`
- **Remplace :** `https://api.alternative.me/fng/`
- **Cache :** 5 minutes
- **Usage :** Fear & Greed Index
- **Params :** `?limit=1` ou `?limit=180`

## Migrations effectuées

### ✅ `src/hooks/useExtendedCoinGeckoPrices.ts`
```typescript
// AVANT
fetch('https://api.coingecko.com/api/v3/global')
fetch('https://api.coingecko.com/api/v3/coins/markets')

// APRÈS
fetch('/api/crypto/global')
fetch('/api/crypto/markets')
```

### ✅ `src/components/FearAndGreedIndex.tsx`
```typescript
// AVANT
fetch('https://api.alternative.me/fng/?limit=1')

// APRÈS
fetch('/api/crypto/fear-greed?limit=1')
```

## Bénéfices

### Avant (sans cache)
- 100 utilisateurs sur la page d'accueil = **100 requêtes CoinGecko**
- Limite gratuite CoinGecko : ~10-30 calls/min
- **Limite dépassée instantanément avec >10 utilisateurs simultanés**

### Après (avec cache)
- 100 utilisateurs sur la page d'accueil = **1 requête CoinGecko/minute**
- Réutilisation du cache pour tous les utilisateurs
- **Supporte facilement 1000+ utilisateurs avec les limites gratuites**

### Bonus
- ⚡ **Performances améliorées** : Cache = réponse instantanée (pas d'appel réseau)
- 💰 **Économies** : Pas besoin d'upgrade vers les plans payants
- 🛡️ **Fiabilité** : Moins de risques de rate limiting
- 🌍 **Scalabilité** : Fonctionne même avec des milliers d'utilisateurs

## Statistiques du cache

Pour voir les stats du cache en console :
```typescript
import { apiCache } from '@/lib/cache'

console.log(apiCache.getStats())
// {
//   totalEntries: 15,
//   activeEntries: 12,
//   expiredEntries: 3,
//   memoryEstimate: "~7.5KB"
// }
```

## Monitoring

Le système nettoie automatiquement les entrées expirées et log dans la console :
```
[Cache] Nettoyé 5 entrées expirées
```

## Notes importantes

### Données historiques (backtest)
Le service `historicalDataService.ts` a **déjà son propre cache de 30 minutes** - il n'a pas besoin d'être migré.

### APIs d'exchanges (Binance/Kraken/Coinbase)
Les routes `/api/binance/balances`, `/api/kraken/balances`, etc. sont déjà côté serveur et appellent des données utilisateur spécifiques - **pas besoin de cache partagé**.

### CSP (Content Security Policy)
Les routes API internes ne nécessitent pas de modification du CSP dans `middleware.ts` car elles sont en `'self'` (même origine).

## Prochaines étapes (optionnel)

Si tu veux aller plus loin :
1. **Ajouter un cache Redis** pour partager entre instances Next.js (utile en production avec load balancing)
2. **WebSockets** pour les prix temps réel (Binance/Kraken offrent des WS gratuits)
3. **Background jobs** pour pré-remplir le cache avant les requêtes utilisateurs
4. **Monitoring avancé** avec métriques (nombre de hits/miss, temps de réponse)

## Test

Pour tester que le cache fonctionne :
1. Ouvre la console du navigateur
2. Recharge la page plusieurs fois rapidement
3. Dans les Network DevTools, tu devrais voir que les requêtes `/api/crypto/*` retournent instantanément (cache hit)
4. Attends 1-5 minutes selon l'endpoint
5. Recharge → la première requête sera plus lente (cache miss + fetch API externe)
6. Les requêtes suivantes seront à nouveau instantanées

## Support

Le cache fonctionne en mémoire du processus Next.js. En développement (npm run dev), il persiste tant que le serveur tourne. En production, il persiste tant que l'instance Next.js est active.
