# Design System Documentation - Cryptium

## 🎨 Introduction

Ce guide documente le système de design unifié de Cryptium. Toutes les couleurs, espacements, typographies et composants sont centralisés pour garantir une cohérence visuelle sur l'ensemble de la plateforme.

## 📁 Structure des Fichiers

- **`design-tokens.css`** - Variables CSS centralisées (couleurs, espacements, typographie)
- **`globals.css`** - Styles globaux, classes utilitaires, et glass effects
- **`README.md`** - Cette documentation

---

## 🎨 Couleurs

### Couleurs Primaires - Bleu Corporate Moderne

```css
--color-primary: #2563EB        /* Bleu profond - Actions principales */
--color-primary-hover: #3B82F6  /* Bleu clair - Hover state */
--color-secondary: #4F46E5      /* Indigo - Actions secondaires */
```

### Couleurs d'Accent - Premium

```css
--color-accent-gold: #F59E0B         /* Doré - CTAs importantes */
--color-accent-blue-light: #60A5FA   /* Bleu clair - Accents */
--color-accent-indigo: #818CF8       /* Indigo clair - Highlights */
```

### Couleurs de Statut

```css
--color-success: #00FF88
--color-error: #DC2626
--color-warning: #F59E0B
--color-info: #00D9FF
```

### Utilisation

```tsx
// Dans un composant
<div style={{ color: 'var(--color-primary)' }}>Texte vert</div>

// Avec Tailwind
<div className="text-[var(--color-primary)]">Texte vert</div>
```

---

## 📏 Espacements

Échelle basée sur 4px (0.25rem) :

| Variable | Valeur | Pixels |
|----------|--------|--------|
| `--space-1` | 0.25rem | 4px |
| `--space-2` | 0.5rem | 8px |
| `--space-3` | 0.75rem | 12px |
| `--space-4` | 1rem | 16px |
| `--space-6` | 1.5rem | 24px |
| `--space-8` | 2rem | 32px |
| `--space-12` | 3rem | 48px |
| `--space-16` | 4rem | 64px |

### Utilisation

```tsx
// Padding
<div className="p-[var(--space-6)]">Contenu</div>

// Margin
<div className="mt-[var(--space-8)]">Contenu</div>

// Gap
<div className="flex gap-[var(--space-4)]">...</div>
```

---

## ✍️ Typographie

### Familles de Polices

```css
--font-primary: 'Inter'      /* Texte principal */
--font-display: 'Manrope'    /* Titres et headings */
--font-mono: 'JetBrains Mono' /* Code et nombres */
```

### Classes de Polices

```tsx
<p className="font-display">Titre en Manrope</p>
<code className="font-mono">Code en JetBrains Mono</code>
<p>Texte normal en Inter (par défaut)</p>
```

### Tailles de Police

| Variable | Valeur | Pixels | Usage |
|----------|--------|--------|-------|
| `--text-xs` | 0.75rem | 12px | Petites annotations |
| `--text-sm` | 0.875rem | 14px | Texte secondaire |
| `--text-base` | 1rem | 16px | Texte principal |
| `--text-lg` | 1.125rem | 18px | Texte important |
| `--text-xl` | 1.25rem | 20px | Sous-titres |
| `--text-2xl` | 1.5rem | 24px | Titres H3 |
| `--text-3xl` | 1.875rem | 30px | Titres H2 |
| `--text-4xl` | 2.25rem | 36px | Titres H1 |

---

## 🔘 Border Radius

| Variable | Valeur | Pixels | Usage |
|----------|--------|--------|-------|
| `--radius-sm` | 0.5rem | 8px | Petits éléments |
| `--radius-md` | 0.75rem | 12px | Éléments moyens |
| `--radius-lg` | 1rem | 16px | Boutons, inputs |
| `--radius-xl` | 1.5rem | 24px | Cartes |
| `--radius-2xl` | 2rem | 32px | Grandes cartes |
| `--radius-full` | 9999px | - | Éléments circulaires |

---

## 🎭 Classes Utilitaires

### Glass Effects

```tsx
// Effet de verre standard
<div className="glass-effect">Contenu</div>

// Effet de verre renforcé (plus opaque)
<div className="glass-effect-strong">Contenu</div>
```

### Texte avec Gradient

```tsx
// Gradient principal (bleu → indigo → bleu clair)
<h1 className="text-gradient-primary">Titre avec gradient</h1>

// Gradient doré premium
<h1 className="text-gradient-gold">Titre doré</h1>
```

### Boutons

```tsx
// Bouton principal (bleu corporate avec gradient)
<button className="btn-primary">Action Principale</button>

// Bouton secondaire (bleu avec bordure)
<button className="btn-secondary">Action Secondaire</button>

// Bouton doré premium (pour CTAs importantes)
<button className="btn-gold">CTA Important</button>
```

**Styles Appliqués:**
- `btn-primary` : Gradient bleu→indigo, effet lift au hover, glow subtil
- `btn-secondary` : Bordure bleue, fond transparent, hover avec glow
- `btn-gold` : Gradient doré, style premium pour actions critiques

### Cartes

```tsx
<div className="card-base">
  <h3>Titre de la carte</h3>
  <p>Contenu de la carte</p>
</div>
```

**Styles Appliqués:**
- Background avec glass effect
- Border radius 2xl
- Padding automatique (24px)
- S'adapte automatiquement au mode clair/sombre

### Espacement de Section

```tsx
<section className="section-spacing">
  <h2>Titre de section</h2>
  <p>Contenu...</p>
</section>
```

**Styles Appliqués:**
- Padding vertical : 64px (desktop) / 48px (mobile)
- Padding horizontal : 24px (desktop) / 16px (mobile)

---

## 🌓 Mode Clair / Sombre

Le système de design s'adapte automatiquement au thème sélectionné.

### Variables de Couleurs

#### Mode Sombre (par défaut)
```css
--bg-primary-dark: #0A0E1A
--text-primary-dark: #F9FAFB
```

#### Mode Clair
```css
--bg-primary-light: #F8FAFC
--text-primary-light: #1E293B
```

### Utilisation

Les classes `.glass-effect`, `.card-base`, et `.btn-*` s'adaptent automatiquement.

Pour forcer un style en mode clair :

```tsx
<div className="light">
  <div className="glass-effect">Toujours en mode clair</div>
</div>
```

---

## 🔧 Exemples d'Utilisation

### Carte de Feature

```tsx
<div className="card-base">
  <h3 className="text-gradient-primary text-[var(--text-2xl)] font-display mb-[var(--space-4)]">
    Backtesting Avancé
  </h3>
  <p className="text-[var(--text-base)] mb-[var(--space-6)]">
    Testez vos stratégies sur 10 ans de données historiques
  </p>
  <button className="btn-primary">
    Commencer
  </button>
</div>
```

### Hero Section

```tsx
<section className="section-spacing">
  <h1 className="font-display text-gradient-primary text-[var(--text-5xl)] mb-[var(--space-6)]">
    Analysez le Marché Crypto
  </h1>
  <p className="text-[var(--text-lg)] text-[var(--text-secondary-dark)] mb-[var(--space-8)]">
    15K+ cryptomonnaies en temps réel
  </p>
  <div className="flex gap-[var(--space-4)]">
    <button className="btn-primary">Commencer Gratuitement</button>
    <button className="btn-secondary">Découvrir</button>
  </div>
</section>
```

---

## 📦 Composants

### Button Component

Le composant `Button.tsx` utilise automatiquement le design system.

```tsx
import Button from '@/components/ui/Button'

// Variants disponibles
<Button variant="primary">Action Principale</Button>
<Button variant="secondary">Action Secondaire</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Sizes disponibles
<Button size="sm">Petit</Button>
<Button size="md">Moyen</Button>
<Button size="lg">Grand</Button>

// Loading state
<Button loading>Chargement...</Button>
```

---

## 🚀 Migration depuis l'Ancien Code

### Avant (Couleurs hardcodées)

```tsx
<div className="bg-[#00FF88]/10 border-[#00FF88]/30">
  Contenu
</div>
```

### Après (Design System)

```tsx
<div className="bg-[rgba(var(--color-primary-rgb),0.1)] border-[rgba(var(--color-primary-rgb),0.3)]">
  Contenu
</div>
```

**Ou mieux, utiliser les classes utilitaires :**

```tsx
<div className="card-base">
  Contenu
</div>
```

---

## ✅ Bonnes Pratiques

### ✓ À FAIRE

- Utiliser les variables CSS : `var(--color-primary)`
- Utiliser les classes utilitaires : `.btn-primary`, `.glass-effect`
- Respecter l'échelle d'espacement (4px, 8px, 12px, etc.)
- Utiliser `.font-display` pour les titres
- Tester en mode clair ET sombre

### ✗ À ÉVITER

- Couleurs hardcodées : `#00FF88`
- Espacements arbitraires : `padding: 17px`
- Polices inline : `font-family: 'Inter'`
- Styles dupliqués dans chaque page
- Valeurs magiques sans variables

---

## 🔄 Mises à Jour

Pour modifier une couleur, un espacement, ou toute autre valeur :

1. **Modifier `design-tokens.css`** - Changez la variable CSS
2. **Vérifier l'impact** - La modification s'applique automatiquement partout
3. **Tester** - Vérifiez en mode clair et sombre

### Exemple

```css
/* design-tokens.css */
:root {
  --color-primary: #00FF88; /* ← Changez cette valeur */
}
```

➡️ Tous les boutons, textes, et bordures utilisant `--color-primary` se mettent à jour automatiquement.

---

## 📊 Avantages du Design System

✅ **Cohérence visuelle** - Même apparence sur toutes les pages
✅ **Maintenance facile** - Modifier une variable = mise à jour globale
✅ **Développement rapide** - Classes utilitaires réutilisables
✅ **Responsive** - S'adapte automatiquement mobile/desktop
✅ **Thèmes** - Support natif mode clair/sombre
✅ **Performant** - Réduction de 50% du CSS dupliqué

---

## 🆘 Support

Si vous avez des questions sur l'utilisation du design system :

1. Consultez cette documentation
2. Regardez les exemples dans les pages existantes
3. Vérifiez `design-tokens.css` pour les variables disponibles

---

**Dernière mise à jour** : Décembre 2024
**Version** : 1.0.0
