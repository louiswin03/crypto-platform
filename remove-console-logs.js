/**
 * Script pour supprimer tous les console.log/error/warn des fichiers
 *
 * Usage: node remove-console-logs.js
 */

const fs = require('fs');
const path = require('path');

// Dossiers à nettoyer
const DIRECTORIES_TO_CLEAN = [
  './src/app/api',           // Routes API (priorité haute)
  './src/components',         // Composants React
  './src/services',          // Services
  './src/hooks',             // Hooks
  './src/lib',               // Bibliothèques
];

// Extensions de fichiers à traiter
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns à supprimer (lignes complètes)
const PATTERNS_TO_REMOVE = [
  /^\s*console\.log\([^)]*\);?\s*$/gm,
  /^\s*console\.error\([^)]*\);?\s*$/gm,
  /^\s*console\.warn\([^)]*\);?\s*$/gm,
  /^\s*console\.info\([^)]*\);?\s*$/gm,
  /^\s*console\.debug\([^)]*\);?\s*$/gm,
];

let filesProcessed = 0;
let linesRemoved = 0;

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  return FILE_EXTENSIONS.includes(ext);
}

function cleanFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalLineCount = content.split('\n').length;

    // Appliquer tous les patterns
    let modified = false;
    for (const pattern of PATTERNS_TO_REMOVE) {
      const newContent = content.replace(pattern, '');
      if (newContent !== content) {
        modified = true;
        content = newContent;
      }
    }

    if (modified) {
      // Nettoyer les lignes vides multiples (max 2 lignes vides consécutives)
      content = content.replace(/\n\n\n+/g, '\n\n');

      fs.writeFileSync(filePath, content, 'utf8');

      const newLineCount = content.split('\n').length;
      const removed = originalLineCount - newLineCount;

      if (removed > 0) {
        linesRemoved += removed;
        console.log(`✅ ${filePath}: ${removed} ligne(s) supprimée(s)`);
      }
    }

    filesProcessed++;
  } catch (error) {
    console.error(`❌ Erreur avec ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Dossier non trouvé: ${dir}`);
    return;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Ignorer node_modules et .next
      if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
        processDirectory(fullPath);
      }
    } else if (stat.isFile() && shouldProcessFile(fullPath)) {
      cleanFile(fullPath);
    }
  }
}

console.log('🧹 Nettoyage des console.log/error/warn...\n');

for (const dir of DIRECTORIES_TO_CLEAN) {
  console.log(`📁 Traitement de ${dir}...`);
  processDirectory(dir);
}

console.log('\n' + '='.repeat(50));
console.log(`✨ Nettoyage terminé!`);
console.log(`📊 Fichiers traités: ${filesProcessed}`);
console.log(`🗑️  Lignes supprimées: ${linesRemoved}`);
console.log('='.repeat(50));
