# Database Migrations

Ce dossier contient les migrations SQL pour la base de données Supabase.

## Comment appliquer une migration

1. Connectez-vous à votre dashboard Supabase: https://app.supabase.com
2. Sélectionnez votre projet
3. Allez dans l'onglet "SQL Editor"
4. Copiez le contenu du fichier de migration
5. Collez-le dans l'éditeur SQL
6. Cliquez sur "Run" pour exécuter la migration

## Migrations disponibles

### add_sources_to_portfolios.sql
**Date**: 2025-10-14
**Description**: Ajoute la colonne `sources` (JSONB) à la table `portfolios` pour permettre la consolidation de plusieurs sources (manuel, binance, coinbase, kraken) dans un seul portfolio.

Cette migration:
- Ajoute une colonne `sources` de type JSONB
- Définit une valeur par défaut: `{"manual": true, "binance": false, "coinbase": false, "kraken": false}`
- Met à jour les portfolios existants avec cette valeur par défaut

### create_users_profiles_table.sql
**Description**: Crée la table des profils utilisateurs.

### create_backtests_table.sql
**Description**: Crée la table des backtests.

## Structure de la colonne sources

La colonne `sources` est un objet JSON avec la structure suivante:

```json
{
  "manual": boolean,    // Inclure les holdings manuels
  "binance": boolean,   // Inclure les balances Binance
  "coinbase": boolean,  // Inclure les balances Coinbase
  "kraken": boolean     // Inclure les balances Kraken
}
```

## Notes importantes

- Toujours tester les migrations sur une base de données de développement avant de les appliquer en production
- Faire une sauvegarde avant d'appliquer des migrations en production
- Les migrations sont conçues pour être idempotentes (peuvent être exécutées plusieurs fois sans erreur)
