# Portfolio Consolidation Feature

## Vue d'ensemble

Cette fonctionnalité permet de créer des portfolios qui agrègent plusieurs sources de holdings (manuel, Binance, Coinbase, Kraken) dans une vue consolidée unique.

## Fonctionnalités

### 1. Sélection des sources dans les portfolios

Lors de la création ou modification d'un portfolio, vous pouvez maintenant sélectionner les sources à inclure:
- ✅ Portfolio Manuel
- ✅ Binance
- ✅ Coinbase
- ✅ Kraken

### 2. Vue consolidée

Le composant `ConsolidatedPortfolioView` affiche:
- **Statistiques globales**: Valeur totale, P&L total, P&L %
- **Liste des holdings**: Tous les holdings de toutes les sources sélectionnées
- **Identification de la source**: Chaque holding affiche sa source d'origine (badge)
- **Rafraîchissement**: Bouton pour recharger les données

### 3. Affichage intelligent

Les sections individuelles des exchanges (Binance, Coinbase, Kraken) ne s'affichent que si:
- L'exchange est connecté
- ET l'exchange n'est PAS inclus dans le portfolio consolidé sélectionné

## Modifications techniques

### Backend (API)

#### `src/app/api/portfolios/route.ts`
- Ajout du champ `sources` dans la création de portfolios (POST)
- Valeur par défaut: `{ manual: true, binance: false, coinbase: false, kraken: false }`
- Mise à jour du portfolio par défaut lors de la création automatique

#### `src/app/api/portfolios/[id]/route.ts`
- Ajout du champ `sources` dans la modification de portfolios (PUT)
- Support de la mise à jour des sources sélectionnées

### Frontend (Composants)

#### `src/components/PortfolioManager.tsx`
Modifications:
- Ajout de l'interface `sources` dans le type `Portfolio`
- Ajout de checkboxes pour chaque source dans le modal de création/modification
- Envoi des sources sélectionnées lors de l'appel API
- Récupération des sources lors de l'édition d'un portfolio

#### `src/components/ConsolidatedPortfolioView.tsx` (NOUVEAU)
Composant qui:
- Charge les holdings de toutes les sources sélectionnées
- Agrège les données en une liste unifiée
- Affiche les statistiques consolidées
- Gère les erreurs par source individuellement

#### `src/app/portefeuille/page.tsx`
Modifications:
- Import du composant `ConsolidatedPortfolioView`
- Remplacement de `ManualPortfolioSection` par `ConsolidatedPortfolioView`
- Ajout de conditions pour masquer les sections d'exchange déjà incluses dans le portfolio

### Base de données

#### Migration: `src/migrations/add_sources_to_portfolios.sql`
```sql
ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '{"manual": true, "binance": false, "coinbase": false, "kraken": false}'::jsonb;
```

Cette migration:
- Ajoute une colonne JSONB `sources` à la table `portfolios`
- Définit une valeur par défaut
- Met à jour les portfolios existants

## Comment l'utiliser

### 1. Appliquer la migration

Avant de tester la fonctionnalité, appliquez la migration SQL:
1. Ouvrez le dashboard Supabase
2. Allez dans "SQL Editor"
3. Exécutez le contenu de `src/migrations/add_sources_to_portfolios.sql`

### 2. Créer un portfolio consolidé

1. Allez sur la page Portfolio
2. Cliquez sur "Nouveau Portfolio"
3. Donnez un nom (ex: "Portfolio Global")
4. Cochez les sources que vous souhaitez inclure:
   - Portfolio Manuel
   - Binance (si connecté)
   - Coinbase (si connecté)
   - Kraken (si connecté)
5. Cliquez sur "Créer"

### 3. Visualiser le portfolio consolidé

Une fois créé, le portfolio affichera automatiquement tous les holdings des sources sélectionnées dans une vue unique avec:
- Valeur totale consolidée
- P&L global
- Liste unifiée des holdings avec indication de leur source

## Avantages

1. **Vue d'ensemble**: Voir tous vos investissements en un seul endroit
2. **Flexibilité**: Créer différents portfolios pour différents objectifs
3. **Organisation**: Grouper logiquement vos holdings (ex: "Long terme", "Trading actif", etc.)
4. **Comparaison**: Comparer facilement la performance entre différentes sources

## Exemple d'utilisation

### Scénario 1: Portfolio de long terme
Créez un portfolio "Long Terme" qui inclut:
- ✅ Portfolio Manuel (BTC, ETH achetés et stockés)
- ✅ Coinbase (Holdings en cold storage)
- ❌ Binance (utilisé pour le trading)

### Scénario 2: Portfolio complet
Créez un portfolio "Vue Complète" qui inclut:
- ✅ Portfolio Manuel
- ✅ Binance
- ✅ Coinbase
- ✅ Kraken

Vous obtenez ainsi une vue consolidée de tous vos actifs crypto.

## Notes techniques

### Structure des données

```typescript
interface Portfolio {
  id: string
  user_id: string
  name: string
  description: string | null
  is_default: boolean
  total_value_usd: number | null
  created_at: string
  sources?: {
    manual: boolean
    binance: boolean
    coinbase: boolean
    kraken: boolean
  }
}
```

### Flux de données

1. L'utilisateur sélectionne un portfolio
2. `ConsolidatedPortfolioView` lit les `sources` du portfolio
3. Pour chaque source activée (true):
   - Appel API à `/api/holdings` (manuel)
   - Appel API à `/api/binance/balances` (Binance)
   - Appel API à `/api/coinbase/balances` (Coinbase)
   - Appel API à `/api/kraken/balances` (Kraken)
4. Agrégation des résultats dans une liste unifiée
5. Calcul des statistiques globales
6. Affichage de la vue consolidée

## Limitations actuelles

1. **Coût moyen**: Les exchanges ne fournissent pas le coût moyen d'achat, donc le P&L n'est calculé que pour les holdings manuels
2. **Prix en temps réel**: Les prix des exchanges sont récupérés via leurs APIs, qui peuvent avoir des délais
3. **Fusion des holdings identiques**: Les holdings du même crypto sur différentes sources sont affichés séparément (pas de fusion automatique)

## Améliorations futures possibles

- [ ] Fusion automatique des holdings identiques (même crypto sur plusieurs sources)
- [ ] Graphique de répartition par source
- [ ] Export CSV du portfolio consolidé
- [ ] Comparaison historique des portfolios
- [ ] Alertes sur des seuils de valeur consolidée
