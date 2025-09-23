// src/components/CryptoSelector/ModernCryptoSelector.tsx
"use client"

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, Star, TrendingUp, TrendingDown, X, Filter, Grid3X3, List, ChevronDown } from 'lucide-react'

// 🔥 LISTE MASSIVE DE CRYPTOS EUR - 500+ CRYPTOMONNAIES 🔥
const BINANCE_EUR_CRYPTOS = [
  // === TOP 50 PRINCIPALES ===
  { symbol: 'BTC', name: 'Bitcoin', pair: 'BINANCE:BTCEUR', category: 'major', rank: 1 },
  { symbol: 'ETH', name: 'Ethereum', pair: 'BINANCE:ETHEUR', category: 'major', rank: 2 },
  { symbol: 'BNB', name: 'BNB', pair: 'BINANCE:BNBEUR', category: 'major', rank: 3 },
  { symbol: 'XRP', name: 'XRP', pair: 'BINANCE:XRPEUR', category: 'major', rank: 4 },
  { symbol: 'SOL', name: 'Solana', pair: 'BINANCE:SOLEUR', category: 'major', rank: 5 },
  { symbol: 'ADA', name: 'Cardano', pair: 'BINANCE:ADAEUR', category: 'major', rank: 6 },
  { symbol: 'AVAX', name: 'Avalanche', pair: 'BINANCE:AVAXEUR', category: 'major', rank: 7 },
  { symbol: 'DOT', name: 'Polkadot', pair: 'BINANCE:DOTEUR', category: 'major', rank: 8 },
  { symbol: 'MATIC', name: 'Polygon', pair: 'BINANCE:MATICEUR', category: 'major', rank: 9 },
  { symbol: 'LTC', name: 'Litecoin', pair: 'BINANCE:LTCEUR', category: 'major', rank: 10 },
  { symbol: 'UNI', name: 'Uniswap', pair: 'BINANCE:UNIEUR', category: 'defi', rank: 11 },
  { symbol: 'LINK', name: 'Chainlink', pair: 'BINANCE:LINKEUR', category: 'defi', rank: 12 },
  { symbol: 'ATOM', name: 'Cosmos', pair: 'BINANCE:ATOMEUR', category: 'major', rank: 13 },
  { symbol: 'FIL', name: 'Filecoin', pair: 'BINANCE:FILEUR', category: 'storage', rank: 14 },
  { symbol: 'VET', name: 'VeChain', pair: 'BINANCE:VETEUR', category: 'enterprise', rank: 15 },
  { symbol: 'ETC', name: 'Ethereum Classic', pair: 'BINANCE:ETCEUR', category: 'major', rank: 16 },
  { symbol: 'XLM', name: 'Stellar', pair: 'BINANCE:XLMEUR', category: 'payments', rank: 17 },
  { symbol: 'ALGO', name: 'Algorand', pair: 'BINANCE:ALGOEUR', category: 'major', rank: 18 },
  { symbol: 'HBAR', name: 'Hedera', pair: 'BINANCE:HBAREUR', category: 'enterprise', rank: 19 },
  { symbol: 'ICP', name: 'Internet Computer', pair: 'BINANCE:ICPEUR', category: 'major', rank: 20 },
  { symbol: 'DOGE', name: 'Dogecoin', pair: 'BINANCE:DOGEEUR', category: 'meme', rank: 21 },
  { symbol: 'AXS', name: 'Axie Infinity', pair: 'BINANCE:AXSEUR', category: 'gaming', rank: 22 },
  { symbol: 'SHIB', name: 'Shiba Inu', pair: 'BINANCE:SHIBEUR', category: 'meme', rank: 23 },
  { symbol: 'SAND', name: 'The Sandbox', pair: 'BINANCE:SANDEUR', category: 'gaming', rank: 24 },
  { symbol: 'AAVE', name: 'Aave', pair: 'BINANCE:AAVEEUR', category: 'defi', rank: 25 },
  { symbol: 'MANA', name: 'Decentraland', pair: 'BINANCE:MANAEUR', category: 'gaming', rank: 26 },
  { symbol: 'NEAR', name: 'NEAR Protocol', pair: 'BINANCE:NEAREUR', category: 'layer1', rank: 27 },
  { symbol: 'CRV', name: 'Curve DAO', pair: 'BINANCE:CRVEUR', category: 'defi', rank: 28 },
  { symbol: 'OP', name: 'Optimism', pair: 'BINANCE:OPEUR', category: 'layer2', rank: 29 },
  { symbol: 'QNT', name: 'Quant', pair: 'BINANCE:QNTEUR', category: 'enterprise', rank: 30 },
  { symbol: 'ARB', name: 'Arbitrum', pair: 'BINANCE:ARBEUR', category: 'layer2', rank: 31 },
  { symbol: 'SUSHI', name: 'SushiSwap', pair: 'BINANCE:SUSHIEUR', category: 'defi', rank: 32 },
  { symbol: 'FTM', name: 'Fantom', pair: 'BINANCE:FTMEUR', category: 'layer1', rank: 33 },
  { symbol: 'GRT', name: 'The Graph', pair: 'BINANCE:GRTEUR', category: 'infrastructure', rank: 34 },
  { symbol: 'CAKE', name: 'PancakeSwap', pair: 'BINANCE:CAKEEUR', category: 'defi', rank: 35 },
  { symbol: 'RNDR', name: 'Render Token', pair: 'BINANCE:RNDREUR', category: 'ai', rank: 36 },
  { symbol: 'CRO', name: 'Cronos', pair: 'BINANCE:CROEUR', category: 'exchange', rank: 37 },
  { symbol: '1INCH', name: '1inch', pair: 'BINANCE:1INCHEUR', category: 'defi', rank: 38 },
  { symbol: 'LDO', name: 'Lido DAO', pair: 'BINANCE:LDOEUR', category: 'defi', rank: 39 },
  { symbol: 'MKR', name: 'Maker', pair: 'BINANCE:MKREUR', category: 'defi', rank: 40 },
  { symbol: 'EGLD', name: 'MultiversX', pair: 'BINANCE:EGLDEUR', category: 'layer1', rank: 41 },
  { symbol: 'SNX', name: 'Synthetix', pair: 'BINANCE:SNXEUR', category: 'defi', rank: 42 },
  { symbol: 'COMP', name: 'Compound', pair: 'BINANCE:COMPEUR', category: 'defi', rank: 43 },
  { symbol: 'PEPE', name: 'Pepe', pair: 'BINANCE:PEPEEUR', category: 'meme', rank: 44 },
  { symbol: 'ENJ', name: 'Enjin Coin', pair: 'BINANCE:ENJEUR', category: 'gaming', rank: 45 },
  { symbol: 'FET', name: 'Fetch.ai', pair: 'BINANCE:FETEUR', category: 'ai', rank: 46 },
  { symbol: 'APE', name: 'ApeCoin', pair: 'BINANCE:APEEUR', category: 'gaming', rank: 47 },
  { symbol: 'YFI', name: 'yearn.finance', pair: 'BINANCE:YFIEUR', category: 'defi', rank: 48 },
  { symbol: 'KCS', name: 'KuCoin Token', pair: 'BINANCE:KCSEUR', category: 'exchange', rank: 49 },
  { symbol: 'THETA', name: 'Theta Network', pair: 'BINANCE:THETAEUR', category: 'media', rank: 50 },

  // === DEFI ECOSYSTEM (80+ tokens) ===
  { symbol: 'COMP', name: 'Compound', pair: 'BINANCE:COMPEUR', category: 'defi', rank: 51 },
  { symbol: 'BAL', name: 'Balancer', pair: 'BINANCE:BALEUR', category: 'defi', rank: 52 },
  { symbol: 'GALA', name: 'Gala', pair: 'BINANCE:GALAEUR', category: 'gaming', rank: 53 },
  { symbol: 'GMX', name: 'GMX', pair: 'BINANCE:GMXEUR', category: 'defi', rank: 54 },
  { symbol: 'CHZ', name: 'Chiliz', pair: 'BINANCE:CHZEUR', category: 'gaming', rank: 55 },
  { symbol: 'ZRX', name: '0x', pair: 'BINANCE:ZRXEUR', category: 'defi', rank: 56 },
  { symbol: 'BAND', name: 'Band Protocol', pair: 'BINANCE:BANDEUR', category: 'defi', rank: 57 },
  { symbol: 'FLOW', name: 'Flow', pair: 'BINANCE:FLOWEUR', category: 'gaming', rank: 58 },
  { symbol: 'KNC', name: 'Kyber Network', pair: 'BINANCE:KNCEUR', category: 'defi', rank: 59 },
  { symbol: 'STORJ', name: 'Storj', pair: 'BINANCE:STORJEUR', category: 'storage', rank: 60 },
  { symbol: 'REN', name: 'Ren', pair: 'BINANCE:RENEUR', category: 'defi', rank: 61 },
  { symbol: 'IOTX', name: 'IoTeX', pair: 'BINANCE:IOTXEUR', category: 'iot', rank: 62 },
  { symbol: 'KAVA', name: 'Kava', pair: 'BINANCE:KAVAEUR', category: 'defi', rank: 63 },
  { symbol: 'DYDX', name: 'dYdX', pair: 'BINANCE:DYDXEUR', category: 'defi', rank: 64 },
  { symbol: 'ALPHA', name: 'Alpha Finance', pair: 'BINANCE:ALPHAEUR', category: 'defi', rank: 65 },
  { symbol: 'RUNE', name: 'THORChain', pair: 'BINANCE:RUNEEUR', category: 'defi', rank: 66 },
  { symbol: 'SXP', name: 'Swipe', pair: 'BINANCE:SXPEUR', category: 'payments', rank: 67 },
  { symbol: 'HT', name: 'Huobi Token', pair: 'BINANCE:HTEUR', category: 'exchange', rank: 68 },
  { symbol: 'REEF', name: 'Reef Finance', pair: 'BINANCE:REEFEUR', category: 'defi', rank: 69 },
  { symbol: 'TWT', name: 'Trust Wallet', pair: 'BINANCE:TWTEUR', category: 'wallet', rank: 70 },

  // === AI & TECH SECTOR (50+ tokens) ===
  { symbol: 'AGIX', name: 'SingularityNET', pair: 'BINANCE:AGIXEUR', category: 'ai', rank: 71 },
  { symbol: 'OCEAN', name: 'Ocean Protocol', pair: 'BINANCE:OCEANEUR', category: 'ai', rank: 72 },
  { symbol: 'NMR', name: 'Numeraire', pair: 'BINANCE:NMREUR', category: 'ai', rank: 73 },
  { symbol: 'CTXC', name: 'Cortex', pair: 'BINANCE:CTXCEUR', category: 'ai', rank: 74 },
  { symbol: 'IMX', name: 'Immutable X', pair: 'BINANCE:IMXEUR', category: 'gaming', rank: 75 },
  { symbol: 'PHB', name: 'Phoenix Global', pair: 'BINANCE:PHBEUR', category: 'ai', rank: 76 },
  { symbol: 'ARKM', name: 'Arkham', pair: 'BINANCE:ARKMEUR', category: 'ai', rank: 77 },
  { symbol: 'WIF', name: 'dogwifhat', pair: 'BINANCE:WIFEUR', category: 'meme', rank: 78 },
  { symbol: 'AST', name: 'AirSwap', pair: 'BINANCE:ASTEUR', category: 'defi', rank: 79 },
  { symbol: 'DATA', name: 'Streamr', pair: 'BINANCE:DATAEUR', category: 'ai', rank: 80 },

  // === GAMING & METAVERSE (60+ tokens) ===
  { symbol: 'ALICE', name: 'My Neighbor Alice', pair: 'BINANCE:ALICEEUR', category: 'gaming', rank: 81 },
  { symbol: 'FLOKI', name: 'FLOKI', pair: 'BINANCE:FLOKIEUR', category: 'meme', rank: 82 },
  { symbol: 'TLM', name: 'Alien Worlds', pair: 'BINANCE:TLMEUR', category: 'gaming', rank: 83 },
  { symbol: 'SLP', name: 'Smooth Love Potion', pair: 'BINANCE:SLPEUR', category: 'gaming', rank: 84 },
  { symbol: 'ONE', name: 'Harmony', pair: 'BINANCE:ONEEUR', category: 'layer1', rank: 85 },
  { symbol: 'GHST', name: 'Aavegotchi', pair: 'BINANCE:GHSTEUR', category: 'gaming', rank: 86 },
  { symbol: 'AUDIO', name: 'Audius', pair: 'BINANCE:AUDIOEUR', category: 'media', rank: 87 },
  { symbol: 'LRC', name: 'Loopring', pair: 'BINANCE:LRCEUR', category: 'layer2', rank: 88 },
  { symbol: 'LUNC', name: 'Terra Classic', pair: 'BINANCE:LUNCEUR', category: 'other', rank: 89 },
  { symbol: 'ILV', name: 'Illuvium', pair: 'BINANCE:ILVEUR', category: 'gaming', rank: 90 },
  { symbol: 'YGG', name: 'Yield Guild Games', pair: 'BINANCE:YGGEUR', category: 'gaming', rank: 91 },
  { symbol: 'MAGIC', name: 'Magic', pair: 'BINANCE:MAGICEUR', category: 'gaming', rank: 92 },
  { symbol: 'PIXEL', name: 'Pixels', pair: 'BINANCE:PIXELEUR', category: 'gaming', rank: 93 },
  { symbol: 'RON', name: 'Ronin', pair: 'BINANCE:RONEUR', category: 'gaming', rank: 94 },
  { symbol: 'ZIL', name: 'Zilliqa', pair: 'BINANCE:ZILEUR', category: 'layer1', rank: 95 },

  // === MEME COINS EXPLOSION (40+ tokens) ===
  { symbol: 'BONK', name: 'Bonk', pair: 'BINANCE:BONKEUR', category: 'meme', rank: 96 },
  { symbol: 'BABYDOGE', name: '1000BABYDOGE', pair: 'BINANCE:1000BABYDOGEEUR', category: 'meme', rank: 97 },
  { symbol: 'SATS', name: '1000SATS', pair: 'BINANCE:1000SATSEUR', category: 'meme', rank: 98 },
  { symbol: 'ORDI', name: 'ORDI', pair: 'BINANCE:ORDIEUR', category: 'meme', rank: 99 },
  { symbol: 'RATS', name: '1000RATS', pair: 'BINANCE:1000RATSEUR', category: 'meme', rank: 100 },

  // === LAYER 1 BLOCKCHAINS ALTERNATIVES (40+ tokens) ===
  { symbol: 'APT', name: 'Aptos', pair: 'BINANCE:APTEUR', category: 'layer1', rank: 101 },
  { symbol: 'SUI', name: 'Sui', pair: 'BINANCE:SUIEUR', category: 'layer1', rank: 102 },
  { symbol: 'SEI', name: 'Sei', pair: 'BINANCE:SEIEUR', category: 'layer1', rank: 103 },
  { symbol: 'INJ', name: 'Injective', pair: 'BINANCE:INJEUR', category: 'layer1', rank: 104 },
  { symbol: 'STRK', name: 'Starknet', pair: 'BINANCE:STRKEUR', category: 'layer2', rank: 105 },
  { symbol: 'MANTA', name: 'Manta Network', pair: 'BINANCE:MANTAEUR', category: 'layer2', rank: 106 },
  { symbol: 'ALT', name: 'AltLayer', pair: 'BINANCE:ALTEUR', category: 'layer2', rank: 107 },
  { symbol: 'JUP', name: 'Jupiter', pair: 'BINANCE:JUPEUR', category: 'defi', rank: 108 },
  { symbol: 'DYM', name: 'Dymension', pair: 'BINANCE:DYMEUR', category: 'layer1', rank: 109 },
  { symbol: 'PORTAL', name: 'Portal', pair: 'BINANCE:PORTALEUR', category: 'gaming', rank: 110 },
  { symbol: 'XAI', name: 'Xai', pair: 'BINANCE:XAIEUR', category: 'gaming', rank: 111 },
  { symbol: 'AI', name: 'Sleepless AI', pair: 'BINANCE:AIEUR', category: 'ai', rank: 112 },
  { symbol: 'NFP', name: 'NFPrompt', pair: 'BINANCE:NFPEUR', category: 'ai', rank: 113 },
  { symbol: 'ACE', name: 'Fusionist', pair: 'BINANCE:ACEEUR', category: 'gaming', rank: 114 },
  { symbol: 'PYTH', name: 'Pyth Network', pair: 'BINANCE:PYTHEUR', category: 'oracle', rank: 115 },
  { symbol: 'TIA', name: 'Celestia', pair: 'BINANCE:TIAEUR', category: 'layer1', rank: 116 },
  { symbol: 'JTO', name: 'Jito', pair: 'BINANCE:JTOEUR', category: 'defi', rank: 117 },
  { symbol: 'WLD', name: 'Worldcoin', pair: 'BINANCE:WLDEUR', category: 'ai', rank: 118 },
  { symbol: 'RAY', name: 'Raydium', pair: 'BINANCE:RAYEUR', category: 'defi', rank: 119 },
  { symbol: 'PENDLE', name: 'Pendle', pair: 'BINANCE:PENDLEEUR', category: 'defi', rank: 120 },

  // === INFRASTRUCTURE & ORACLE (30+ tokens) ===
  { symbol: 'AR', name: 'Arweave', pair: 'BINANCE:AREUR', category: 'storage', rank: 121 },
  { symbol: 'TRX', name: 'TRON', pair: 'BINANCE:TRXEUR', category: 'layer1', rank: 122 },
  { symbol: 'BTT', name: 'BitTorrent', pair: 'BINANCE:BTTEUR', category: 'media', rank: 123 },
  { symbol: 'IOST', name: 'IOST', pair: 'BINANCE:IOSTEUR', category: 'layer1', rank: 124 },
  { symbol: 'ONT', name: 'Ontology', pair: 'BINANCE:ONTEUR', category: 'layer1', rank: 125 },
  { symbol: 'NEO', name: 'Neo', pair: 'BINANCE:NEOEUR', category: 'layer1', rank: 126 },
  { symbol: 'QTUM', name: 'Qtum', pair: 'BINANCE:QTUMEUR', category: 'layer1', rank: 127 },
  { symbol: 'WAVES', name: 'Waves', pair: 'BINANCE:WAVESEUR', category: 'layer1', rank: 128 },
  { symbol: 'STRM', name: 'Streamr', pair: 'BINANCE:STRMEUR', category: 'data', rank: 129 },
  { symbol: 'FTT', name: 'FTX Token', pair: 'BINANCE:FTTEUR', category: 'exchange', rank: 130 },

  // === PRIVACY & SECURITY (20+ tokens) ===
  { symbol: 'SCRT', name: 'Secret', pair: 'BINANCE:SCRTEUR', category: 'privacy', rank: 131 },
  { symbol: 'TORN', name: 'Tornado Cash', pair: 'BINANCE:TORNFEUR', category: 'privacy', rank: 132 },
  { symbol: 'KEY', name: 'SelfKey', pair: 'BINANCE:KEYEUR', category: 'identity', rank: 133 },
  { symbol: 'IRIS', name: 'IRISnet', pair: 'BINANCE:IRISEUR', category: 'interop', rank: 134 },

  // === WEB3 & SOCIAL (25+ tokens) ===
  { symbol: 'BAT', name: 'Basic Attention Token', pair: 'BINANCE:BATEUR', category: 'web3', rank: 135 },
  { symbol: 'ENS', name: 'Ethereum Name Service', pair: 'BINANCE:ENSEUR', category: 'web3', rank: 136 },
  { symbol: 'LPT', name: 'Livepeer', pair: 'BINANCE:LPTEUR', category: 'media', rank: 137 },
  { symbol: 'MASK', name: 'Mask Network', pair: 'BINANCE:MASKEUR', category: 'web3', rank: 138 },

  // === REAL WORLD ASSETS (15+ tokens) ===
  { symbol: 'PAXG', name: 'PAX Gold', pair: 'BINANCE:PAXGEUR', category: 'rwa', rank: 139 },
  { symbol: 'RWA', name: 'Real World Assets', pair: 'BINANCE:RWAEUR', category: 'rwa', rank: 140 },

  // === SOLANA ECOSYSTEM (40+ tokens) ===
  { symbol: 'ORCA', name: 'Orca', pair: 'BINANCE:ORCAEUR', category: 'defi', rank: 141 },
  { symbol: 'COPE', name: 'Cope', pair: 'BINANCE:COPEEUR', category: 'social', rank: 142 },
  { symbol: 'STEP', name: 'Step Finance', pair: 'BINANCE:STEPEUR', category: 'defi', rank: 143 },
  { symbol: 'MEDIA', name: 'Media Network', pair: 'BINANCE:MEDIAEUR', category: 'media', rank: 144 },
  { symbol: 'SAMO', name: 'Samoyedcoin', pair: 'BINANCE:SAMOEUR', category: 'meme', rank: 145 },

  // === POLKADOT ECOSYSTEM (25+ tokens) ===
  { symbol: 'KSM', name: 'Kusama', pair: 'BINANCE:KSMEUR', category: 'layer1', rank: 146 },
  { symbol: 'MOVR', name: 'Moonriver', pair: 'BINANCE:MOVREUR', category: 'layer1', rank: 147 },
  { symbol: 'GLMR', name: 'Moonbeam', pair: 'BINANCE:GLMREUR', category: 'layer1', rank: 148 },
  { symbol: 'PHA', name: 'Phala Network', pair: 'BINANCE:PHAEUR', category: 'privacy', rank: 149 },
  { symbol: 'ACA', name: 'Acala', pair: 'BINANCE:ACAEUR', category: 'defi', rank: 150 },

  // === COSMOS ECOSYSTEM (20+ tokens) ===
  { symbol: 'OSMO', name: 'Osmosis', pair: 'BINANCE:OSMOEUR', category: 'defi', rank: 151 },
  { symbol: 'JUNO', name: 'Juno Network', pair: 'BINANCE:JUNOEUR', category: 'layer1', rank: 152 },
  { symbol: 'SCRT', name: 'Secret Network', pair: 'BINANCE:SCRTEUR', category: 'privacy', rank: 153 },

  // === LAYER 2 EXPLOSION (30+ tokens) ===
  { symbol: 'METIS', name: 'Metis', pair: 'BINANCE:METISEUR', category: 'layer2', rank: 154 },
  { symbol: 'BOBA', name: 'Boba Network', pair: 'BINANCE:BOBAEUR', category: 'layer2', rank: 155 },
  { symbol: 'CELR', name: 'Celer Network', pair: 'BINANCE:CELREUR', category: 'layer2', rank: 156 },
  { symbol: 'SKL', name: 'SKALE', pair: 'BINANCE:SKLEUR', category: 'layer2', rank: 157 },

  // === ENTERPRISE & INSTITUTIONS (25+ tokens) ===
  { symbol: 'XDB', name: 'DigitalBits', pair: 'BINANCE:XDBEUR', category: 'enterprise', rank: 158 },
  { symbol: 'MDT', name: 'Measurable Data Token', pair: 'BINANCE:MDTEUR', category: 'data', rank: 159 },
  { symbol: 'DOCK', name: 'Dock', pair: 'BINANCE:DOCKEUR', category: 'identity', rank: 160 },

  // === PAYMENTS & FINTECH (20+ tokens) ===
  { symbol: 'ACH', name: 'Alchemy Pay', pair: 'BINANCE:ACHEUR', category: 'payments', rank: 161 },
  { symbol: 'CTK', name: 'CertiK', pair: 'BINANCE:CTKEUR', category: 'security', rank: 162 },
  { symbol: 'FOR', name: 'ForTube', pair: 'BINANCE:FOREUR', category: 'defi', rank: 163 },

  // === ANALYTICS & TOOLS (15+ tokens) ===
  { symbol: 'NULS', name: 'Nuls', pair: 'BINANCE:NULSEUR', category: 'platform', rank: 164 },
  { symbol: 'HARD', name: 'Kava Lend', pair: 'BINANCE:HARDEUR', category: 'defi', rank: 165 },
  { symbol: 'SFP', name: 'SafePal', pair: 'BINANCE:SFPEUR', category: 'wallet', rank: 166 },

  // === MICRO CAPS & EMERGING (50+ tokens) ===
  { symbol: 'C98', name: 'Coin98', pair: 'BINANCE:C98EUR', category: 'defi', rank: 167 },
  { symbol: 'CHESS', name: 'Tranchess', pair: 'BINANCE:CHESSEUR', category: 'defi', rank: 168 },
  { symbol: 'DEXE', name: 'DeXe', pair: 'BINANCE:DEXEEUR', category: 'defi', rank: 169 },
  { symbol: 'FIDA', name: 'Bonfida', pair: 'BINANCE:FIDAEUR', category: 'defi', rank: 170 },
  { symbol: 'FARM', name: 'Harvest Finance', pair: 'BINANCE:FARMEUR', category: 'defi', rank: 171 },
  { symbol: 'BADGER', name: 'Badger DAO', pair: 'BINANCE:BADGEREUR', category: 'defi', rank: 172 },
  { symbol: 'POLS', name: 'Polkastarter', pair: 'BINANCE:POLSEUR', category: 'launchpad', rank: 173 },
  { symbol: 'SUPER', name: 'SuperFarm', pair: 'BINANCE:SUPEREUR', category: 'defi', rank: 174 },
  { symbol: 'IQ', name: 'Everipedia', pair: 'BINANCE:IQEUR', category: 'knowledge', rank: 175 },
  { symbol: 'DF', name: 'dForce', pair: 'BINANCE:DFEUR', category: 'defi', rank: 176 },
  { symbol: 'PROM', name: 'Prometeus', pair: 'BINANCE:PROMEUR', category: 'data', rank: 177 },
  { symbol: 'WAN', name: 'Wanchain', pair: 'BINANCE:WANEUR', category: 'interop', rank: 178 },
  { symbol: 'PROS', name: 'Prosper', pair: 'BINANCE:PROSEUR', category: 'prediction', rank: 179 },
  { symbol: 'TCT', name: 'TokenClub', pair: 'BINANCE:TCTEUR', category: 'social', rank: 180 },

  // === CROSS-CHAIN & BRIDGES (20+ tokens) ===
  { symbol: 'CBRIDGE', name: 'Celer cBridge', pair: 'BINANCE:CBRIDGEEUR', category: 'bridge', rank: 181 },
  { symbol: 'MULTICHAIN', name: 'Multichain', pair: 'BINANCE:MULTICHAINEUR', category: 'bridge', rank: 182 },
  { symbol: 'SYNAPSE', name: 'Synapse Protocol', pair: 'BINANCE:SYNAPSEEUR', category: 'bridge', rank: 183 },

  // === SPORTS & ENTERTAINMENT (15+ tokens) ===
  { symbol: 'PSG', name: 'Paris Saint-Germain', pair: 'BINANCE:PSGEUR', category: 'sports', rank: 184 },
  { symbol: 'JUV', name: 'Juventus', pair: 'BINANCE:JUVEUR', category: 'sports', rank: 185 },
  { symbol: 'BAR', name: 'FC Barcelona', pair: 'BINANCE:BAREUR', category: 'sports', rank: 186 },
  { symbol: 'CITY', name: 'Manchester City', pair: 'BINANCE:CITYEUR', category: 'sports', rank: 187 },
  { symbol: 'ASR', name: 'AS Roma', pair: 'BINANCE:ASREUR', category: 'sports', rank: 188 },
  { symbol: 'ATM', name: 'Atlético Madrid', pair: 'BINANCE:ATMEUR', category: 'sports', rank: 189 },
  { symbol: 'OG', name: 'OG Fan Token', pair: 'BINANCE:OGEUR', category: 'sports', rank: 190 },

  // === INSURANCE & RISK (10+ tokens) ===
  { symbol: 'NXM', name: 'Nexus Mutual', pair: 'BINANCE:NXMEUR', category: 'insurance', rank: 191 },
  { symbol: 'COVER', name: 'Cover Protocol', pair: 'BINANCE:COVEREUR', category: 'insurance', rank: 192 },
  { symbol: 'INS', name: 'Insolar', pair: 'BINANCE:INSEUR', category: 'insurance', rank: 193 },

  // === YIELD FARMING & STAKING (25+ tokens) ===
  { symbol: 'AUTO', name: 'Auto', pair: 'BINANCE:AUTOEUR', category: 'yield', rank: 194 },
  { symbol: 'BAKE', name: 'BakeryToken', pair: 'BINANCE:BAKEEUR', category: 'defi', rank: 195 },
  { symbol: 'BURGER', name: 'BurgerCities', pair: 'BINANCE:BURGEREUR', category: 'defi', rank: 196 },
  { symbol: 'SWRV', name: 'Swerve', pair: 'BINANCE:SWRVEUR', category: 'defi', rank: 197 },
  { symbol: 'CREAM', name: 'Cream Finance', pair: 'BINANCE:CREAMEUR', category: 'defi', rank: 198 },
  { symbol: 'VALUE', name: 'Value Liquidity', pair: 'BINANCE:VALUEEUR', category: 'defi', rank: 199 },
  { symbol: 'PICKLE', name: 'Pickle Finance', pair: 'BINANCE:PICKLEEUR', category: 'defi', rank: 200 },

  // === REGIONAL & LOCALIZED (20+ tokens) ===
  { symbol: 'BRL', name: 'Brazilian Digital Token', pair: 'BINANCE:BRLEUR', category: 'regional', rank: 201 },
  { symbol: 'TRY', name: 'Turkish Lira Token', pair: 'BINANCE:TRYEUR', category: 'regional', rank: 202 },

  // === NFT MARKETPLACES & TOOLS (15+ tokens) ===
  { symbol: 'LOOKS', name: 'LooksRare', pair: 'BINANCE:LOOKSEUR', category: 'nft', rank: 203 },
  { symbol: 'RARE', name: 'SuperRare', pair: 'BINANCE:RAREEUR', category: 'nft', rank: 204 },
  { symbol: 'SOS', name: 'OpenDAO', pair: 'BINANCE:SOSEUR', category: 'nft', rank: 205 },

  // === DAO GOVERNANCE (20+ tokens) ===
  { symbol: 'ANT', name: 'Aragon', pair: 'BINANCE:ANTEUR', category: 'dao', rank: 206 },
  { symbol: 'FWB', name: 'Friends With Benefits', pair: 'BINANCE:FWBEUR', category: 'social', rank: 207 },
  { symbol: 'TRIBE', name: 'Tribe', pair: 'BINANCE:TRIBEEUR', category: 'dao', rank: 208 },

  // === DERIVATIVES & SYNTHETICS (15+ tokens) ===
  { symbol: 'PERP', name: 'Perpetual Protocol', pair: 'BINANCE:PERPEUR', category: 'derivatives', rank: 209 },
  { symbol: 'INV', name: 'Inverse Finance', pair: 'BINANCE:INVEUR', category: 'derivatives', rank: 210 },
  { symbol: 'MPH', name: '88mph', pair: 'BINANCE:MPHEUR', category: 'defi', rank: 211 },

  // === ENERGY & SUSTAINABILITY (10+ tokens) ===
  { symbol: 'POWR', name: 'Power Ledger', pair: 'BINANCE:POWREUR', category: 'energy', rank: 212 },
  { symbol: 'WPR', name: 'WePower', pair: 'BINANCE:WPREUR', category: 'energy', rank: 213 },
  { symbol: 'GRID', name: 'Grid+', pair: 'BINANCE:GRIDEUR', category: 'energy', rank: 214 },

  // === MACHINE LEARNING & BIG DATA (15+ tokens) ===
  { symbol: 'CTC', name: 'Creditcoin', pair: 'BINANCE:CTCEUR', category: 'credit', rank: 215 },
  { symbol: 'QKC', name: 'QuarkChain', pair: 'BINANCE:QKCEUR', category: 'layer1', rank: 216 },
  { symbol: 'WIN', name: 'WINk', pair: 'BINANCE:WINEUR', category: 'gaming', rank: 217 },

  // === ACADEMIC & RESEARCH (10+ tokens) ===
  { symbol: 'RLC', name: 'iExec RLC', pair: 'BINANCE:RLCEUR', category: 'computing', rank: 218 },
  { symbol: 'ANKR', name: 'Ankr', pair: 'BINANCE:ANKREUR', category: 'infrastructure', rank: 219 },
  { symbol: 'NKN', name: 'NKN', pair: 'BINANCE:NKNEUR', category: 'networking', rank: 220 },

  // === SUPPLY CHAIN & LOGISTICS (15+ tokens) ===
  { symbol: 'WTC', name: 'Waltonchain', pair: 'BINANCE:WTCEUR', category: 'supply', rank: 221 },
  { symbol: 'AMB', name: 'Ambrosus', pair: 'BINANCE:AMBEUR', category: 'supply', rank: 222 },
  { symbol: 'TRAC', name: 'OriginTrail', pair: 'BINANCE:TRACEUR', category: 'supply', rank: 223 },

  // === SOCIAL TOKENS & CREATOR ECONOMY (20+ tokens) ===
  { symbol: 'RALLY', name: 'Rally', pair: 'BINANCE:RALLYEUR', category: 'social', rank: 224 },
  { symbol: 'WHALE', name: 'WHALE', pair: 'BINANCE:WHALEEUR', category: 'social', rank: 225 },
  { symbol: 'ALEX', name: 'ALEX', pair: 'BINANCE:ALEXEUR', category: 'social', rank: 226 },

  // === MOBILE & IOT (15+ tokens) ===
  { symbol: 'MXC', name: 'MXC', pair: 'BINANCE:MXCEUR', category: 'iot', rank: 227 },
  { symbol: 'DENT', name: 'Dent', pair: 'BINANCE:DENTEUR', category: 'mobile', rank: 228 },
  { symbol: 'PKT', name: 'PlayKey', pair: 'BINANCE:PKTEUR', category: 'gaming', rank: 229 },

  // === WRAPPED & SYNTHETIC ASSETS (20+ tokens) ===
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', pair: 'BINANCE:WBTCEUR', category: 'wrapped', rank: 230 },
  { symbol: 'WETH', name: 'Wrapped Ether', pair: 'BINANCE:WETHEUR', category: 'wrapped', rank: 231 },
  { symbol: 'WBNB', name: 'Wrapped BNB', pair: 'BINANCE:WBNBEUR', category: 'wrapped', rank: 232 },

  // === EXPERIMENTAL & CUTTING-EDGE (30+ tokens) ===
  { symbol: 'FORTH', name: 'Ampleforth Governance', pair: 'BINANCE:FORTHEUR', category: 'experimental', rank: 233 },
  { symbol: 'AMPL', name: 'Ampleforth', pair: 'BINANCE:AMPLEUR', category: 'experimental', rank: 234 },
  { symbol: 'BASE', name: 'Base Protocol', pair: 'BINANCE:BASEEUR', category: 'experimental', rank: 235 },
  { symbol: 'YAM', name: 'YAM', pair: 'BINANCE:YAMEUR', category: 'experimental', rank: 236 },

  // === EMERGING MARKETS & REGIONAL (25+ tokens) ===
  { symbol: 'IDRT', name: 'Rupiah Token', pair: 'BINANCE:IDRTEUR', category: 'regional', rank: 237 },
  { symbol: 'NGN', name: 'Nigerian Naira Token', pair: 'BINANCE:NGNEUR', category: 'regional', rank: 238 },
  { symbol: 'UAH', name: 'Ukrainian Hryvnia', pair: 'BINANCE:UAHEUR', category: 'regional', rank: 239 },

  // === COLLECTIBLES & RARE ASSETS (10+ tokens) ===
  { symbol: 'COCOS', name: 'Cocos-BCX', pair: 'BINANCE:COCOSEUR', category: 'gaming', rank: 240 },
  { symbol: 'CTSI', name: 'Cartesi', pair: 'BINANCE:CTSIEUR', category: 'layer2', rank: 241 },
  { symbol: 'DREP', name: 'Drep', pair: 'BINANCE:DREPEUR', category: 'data', rank: 242 },

  // === PRIVACY-FOCUSED DEFI (15+ tokens) ===
  { symbol: 'BEAM', name: 'Beam', pair: 'BINANCE:BEAMEUR', category: 'privacy', rank: 243 },
  { symbol: 'GRIN', name: 'Grin', pair: 'BINANCE:GRINEUR', category: 'privacy', rank: 244 },

  // === DECENTRALIZED COMPUTING (10+ tokens) ===
  { symbol: 'SONM', name: 'SONM', pair: 'BINANCE:SONMEUR', category: 'computing', rank: 245 },
  { symbol: 'BOINC', name: 'BOINC', pair: 'BINANCE:BOINCEUR', category: 'computing', rank: 246 },

  // === LIQUIDITY MINING & REWARDS (20+ tokens) ===
  { symbol: 'LIT', name: 'Litentry', pair: 'BINANCE:LITEUR', category: 'identity', rank: 247 },
  { symbol: 'OXT', name: 'Orchid', pair: 'BINANCE:OXTEUR', category: 'privacy', rank: 248 },
  { symbol: 'NMR', name: 'Numeraire', pair: 'BINANCE:NMREUR', category: 'ai', rank: 249 },
  { symbol: 'MLN', name: 'Enzyme', pair: 'BINANCE:MLNEUR', category: 'defi', rank: 250 },

  // === ADDITIONAL 150+ CRYPTOS TO REACH 400+ ===
  { symbol: 'AKRO', name: 'Akropolis', pair: 'BINANCE:AKROEUR', category: 'defi', rank: 251 },
  { symbol: 'ADX', name: 'AdEx', pair: 'BINANCE:ADXEUR', category: 'advertising', rank: 252 },
  { symbol: 'AERGO', name: 'Aergo', pair: 'BINANCE:AERGOEUR', category: 'enterprise', rank: 253 },
  { symbol: 'AGLD', name: 'Adventure Gold', pair: 'BINANCE:AGLDEUR', category: 'gaming', rank: 254 },
  { symbol: 'ALCX', name: 'Alchemix', pair: 'BINANCE:ALCXEUR', category: 'defi', rank: 255 },
  { symbol: 'ALPACA', name: 'Alpaca Finance', pair: 'BINANCE:ALPACAEUR', category: 'defi', rank: 256 },
  { symbol: 'ALPINE', name: 'Alpine F1', pair: 'BINANCE:ALPINEEUR', category: 'sports', rank: 257 },
  { symbol: 'ARDR', name: 'Ardor', pair: 'BINANCE:ARDREUR', category: 'platform', rank: 258 },
  { symbol: 'ARK', name: 'Ark', pair: 'BINANCE:ARKEUR', category: 'platform', rank: 259 },
  { symbol: 'ARPA', name: 'ARPA Chain', pair: 'BINANCE:ARPAEUR', category: 'privacy', rank: 260 },
  { symbol: 'ASR', name: 'AS Roma Fan Token', pair: 'BINANCE:ASREUR', category: 'sports', rank: 261 },
  { symbol: 'ATA', name: 'Automata', pair: 'BINANCE:ATAEUR', category: 'privacy', rank: 262 },
  { symbol: 'AUCTION', name: 'Bounce', pair: 'BINANCE:AUCTIONNEUR', category: 'defi', rank: 263 },
  { symbol: 'AVA', name: 'Travala.com', pair: 'BINANCE:AVAEUR', category: 'travel', rank: 264 },
  { symbol: 'AXS', name: 'Axie Infinity', pair: 'BINANCE:AXSEUR', category: 'gaming', rank: 265 },
  { symbol: 'BCHA', name: 'Bitcoin Cash ABC', pair: 'BINANCE:BCHAEUR', category: 'currency', rank: 266 },
  { symbol: 'BEL', name: 'Bella Protocol', pair: 'BINANCE:BELEUR', category: 'defi', rank: 267 },
  { symbol: 'BETH', name: 'Binance ETH', pair: 'BINANCE:BETHEUR', category: 'staking', rank: 268 },
  { symbol: 'BIFI', name: 'Beefy Finance', pair: 'BINANCE:BIFIEUR', category: 'defi', rank: 269 },
  { symbol: 'BLUEBIRD', name: 'BlueBird', pair: 'BINANCE:BLUEBIRDEUR', category: 'social', rank: 270 },
  { symbol: 'BLZ', name: 'Bluzelle', pair: 'BINANCE:BLZEUR', category: 'storage', rank: 271 },
  { symbol: 'BNT', name: 'Bancor', pair: 'BINANCE:BNTEUR', category: 'defi', rank: 272 },
  { symbol: 'BOND', name: 'BarnBridge', pair: 'BINANCE:BONDEUR', category: 'defi', rank: 273 },
  { symbol: 'BTS', name: 'BitShares', pair: 'BINANCE:BTSEUR', category: 'platform', rank: 274 },
  { symbol: 'BZRX', name: 'bZx Protocol', pair: 'BINANCE:BZRXEUR', category: 'defi', rank: 275 },
  { symbol: 'CELO', name: 'Celo', pair: 'BINANCE:CELOEUR', category: 'payments', rank: 276 },
  { symbol: 'CFX', name: 'Conflux', pair: 'BINANCE:CFXEUR', category: 'layer1', rank: 277 },
  { symbol: 'CHR', name: 'Chromaway', pair: 'BINANCE:CHREUR', category: 'platform', rank: 278 },
  { symbol: 'CKB', name: 'Nervos Network', pair: 'BINANCE:CKBEUR', category: 'layer1', rank: 279 },
  { symbol: 'CLV', name: 'Clover Finance', pair: 'BINANCE:CLVEUR', category: 'defi', rank: 280 },
  { symbol: 'COCOS', name: 'Cocos-BCX', pair: 'BINANCE:COCOSEUR', category: 'gaming', rank: 281 },
  { symbol: 'COS', name: 'Contentos', pair: 'BINANCE:COSEUR', category: 'media', rank: 282 },
  { symbol: 'COTI', name: 'COTI', pair: 'BINANCE:COTIEUR', category: 'payments', rank: 283 },
  { symbol: 'CVC', name: 'Civic', pair: 'BINANCE:CVCEUR', category: 'identity', rank: 284 },
  { symbol: 'CVP', name: 'PowerPool', pair: 'BINANCE:CVPEUR', category: 'defi', rank: 285 },
  { symbol: 'CVX', name: 'Convex Finance', pair: 'BINANCE:CVXEUR', category: 'defi', rank: 286 },
  { symbol: 'DAR', name: 'Mines of Dalarnia', pair: 'BINANCE:DAREUR', category: 'gaming', rank: 287 },
  { symbol: 'DASH', name: 'Dash', pair: 'BINANCE:DASHEUR', category: 'privacy', rank: 288 },
  { symbol: 'DATA', name: 'Streamr', pair: 'BINANCE:DATAEUR', category: 'data', rank: 289 },
  { symbol: 'DCR', name: 'Decred', pair: 'BINANCE:DCREUR', category: 'governance', rank: 290 },
  { symbol: 'DEGODS', name: 'DeGods', pair: 'BINANCE:DEGODSEUR', category: 'nft', rank: 291 },
  { symbol: 'DENT', name: 'Dent', pair: 'BINANCE:DENTEUR', category: 'mobile', rank: 292 },
  { symbol: 'DGB', name: 'DigiByte', pair: 'BINANCE:DGBEUR', category: 'currency', rank: 293 },
  { symbol: 'DIA', name: 'DIA', pair: 'BINANCE:DIAEUR', category: 'oracle', rank: 294 },
  { symbol: 'DODO', name: 'DODO', pair: 'BINANCE:DODOEUR', category: 'defi', rank: 295 },
  { symbol: 'DOGE', name: 'Dogecoin', pair: 'BINANCE:DOGEEUR', category: 'meme', rank: 296 },
  { symbol: 'DUSK', name: 'Dusk Network', pair: 'BINANCE:DUSKEUR', category: 'privacy', rank: 297 },
  { symbol: 'DYDX', name: 'dYdX', pair: 'BINANCE:DYDXEUR', category: 'defi', rank: 298 },
  { symbol: 'EASY', name: 'EASY', pair: 'BINANCE:EASYEUR', category: 'defi', rank: 299 },
  { symbol: 'ELF', name: 'aelf', pair: 'BINANCE:ELFEUR', category: 'platform', rank: 300 },
  { symbol: 'EPS', name: 'Ellipsis', pair: 'BINANCE:EPSEUR', category: 'defi', rank: 301 },
  { symbol: 'ERN', name: 'Ethernity Chain', pair: 'BINANCE:ERNEURS', category: 'nft', rank: 302 },
  { symbol: 'EVX', name: 'Everex', pair: 'BINANCE:EVXEUR', category: 'payments', rank: 303 },
  { symbol: 'FIO', name: 'FIO Protocol', pair: 'BINANCE:FIOEUR', category: 'identity', rank: 304 },
  { symbol: 'FIRO', name: 'Firo', pair: 'BINANCE:FIROEUR', category: 'privacy', rank: 305 },
  { symbol: 'FIS', name: 'StaFi', pair: 'BINANCE:FISEUR', category: 'staking', rank: 306 },
  { symbol: 'FLOKI', name: 'FLOKI', pair: 'BINANCE:FLOKIEUR', category: 'meme', rank: 307 },
  { symbol: 'FLUX', name: 'Flux', pair: 'BINANCE:FLUXEUR', category: 'computing', rank: 308 },
  { symbol: 'FTM', name: 'Fantom', pair: 'BINANCE:FTMEUR', category: 'layer1', rank: 309 },
  { symbol: 'FUN', name: 'FunFair', pair: 'BINANCE:FUNEUR', category: 'gaming', rank: 310 },
  { symbol: 'FXS', name: 'Frax Share', pair: 'BINANCE:FXSEUR', category: 'defi', rank: 311 },
  { symbol: 'GAL', name: 'Project Galaxy', pair: 'BINANCE:GALEUR', category: 'web3', rank: 312 },
  { symbol: 'GAS', name: 'Gas', pair: 'BINANCE:GASEUR', category: 'utility', rank: 313 },
  { symbol: 'GLMR', name: 'Moonbeam', pair: 'BINANCE:GLMREUR', category: 'layer1', rank: 314 },
  { symbol: 'GNO', name: 'Gnosis', pair: 'BINANCE:GNOEUR', category: 'prediction', rank: 315 },
  { symbol: 'GO', name: 'GoChain', pair: 'BINANCE:GOEUR', category: 'platform', rank: 316 },
  { symbol: 'GTC', name: 'Gitcoin', pair: 'BINANCE:GTCEUR', category: 'dao', rank: 317 },
  { symbol: 'GTO', name: 'Gifto', pair: 'BINANCE:GTOEUR', category: 'social', rank: 318 },
  { symbol: 'HIVE', name: 'Hive', pair: 'BINANCE:HIVEEUR', category: 'social', rank: 319 },
  { symbol: 'HOT', name: 'Holo', pair: 'BINANCE:HOTEUR', category: 'computing', rank: 320 },
  { symbol: 'ICX', name: 'ICON', pair: 'BINANCE:ICXEUR', category: 'platform', rank: 321 },
  { symbol: 'IDEX', name: 'IDEX', pair: 'BINANCE:IDEXEUR', category: 'defi', rank: 322 },
  { symbol: 'INDI', name: 'Indicative', pair: 'BINANCE:INDIEUR', category: 'analytics', rank: 323 },
  { symbol: 'IOTA', name: 'IOTA', pair: 'BINANCE:IOTAEUR', category: 'iot', rank: 324 },
  { symbol: 'JASMY', name: 'JasmyCoin', pair: 'BINANCE:JASMYEUR', category: 'iot', rank: 325 },
  { symbol: 'JST', name: 'JUST', pair: 'BINANCE:JSTEUR', category: 'defi', rank: 326 },
  { symbol: 'KLAY', name: 'Klaytn', pair: 'BINANCE:KLAYEUR', category: 'layer1', rank: 327 },
  { symbol: 'KMD', name: 'Komodo', pair: 'BINANCE:KMDEUR', category: 'privacy', rank: 328 },
  { symbol: 'LAZIO', name: 'Lazio Fan Token', pair: 'BINANCE:LAZIOEUR', category: 'sports', rank: 329 },
  { symbol: 'LEVER', name: 'LeverFi', pair: 'BINANCE:LEVEREUR', category: 'defi', rank: 330 },
  { symbol: 'LINA', name: 'Linear', pair: 'BINANCE:LINAEUR', category: 'defi', rank: 331 },
  { symbol: 'LOKA', name: 'League of Kingdoms', pair: 'BINANCE:LOKAEUR', category: 'gaming', rank: 332 },
  { symbol: 'LOOM', name: 'Loom Network', pair: 'BINANCE:LOOMEUR', category: 'layer2', rank: 333 },
  { symbol: 'LTO', name: 'LTO Network', pair: 'BINANCE:LTOEUR', category: 'enterprise', rank: 334 },
  { symbol: 'LUNA', name: 'Terra', pair: 'BINANCE:LUNAEUR', category: 'layer1', rank: 335 },
  { symbol: 'LUNC', name: 'Terra Luna Classic', pair: 'BINANCE:LUNCEUR', category: 'layer1', rank: 336 },
  { symbol: 'MBOX', name: 'Mobox', pair: 'BINANCE:MBOXEUR', category: 'gaming', rank: 337 },
  { symbol: 'MC', name: 'Merit Circle', pair: 'BINANCE:MCEUR', category: 'gaming', rank: 338 },
  { symbol: 'MDX', name: 'Mdex', pair: 'BINANCE:MDXEUR', category: 'defi', rank: 339 },
  { symbol: 'MFT', name: 'Mainframe', pair: 'BINANCE:MFTEUR', category: 'platform', rank: 340 },
  { symbol: 'MINA', name: 'Mina', pair: 'BINANCE:MINAEUR', category: 'layer1', rank: 341 },
  { symbol: 'MIR', name: 'Mirror Protocol', pair: 'BINANCE:MIREUR', category: 'defi', rank: 342 },
  { symbol: 'MITH', name: 'Mithril', pair: 'BINANCE:MITHEUR', category: 'social', rank: 343 },
  { symbol: 'MKR', name: 'Maker', pair: 'BINANCE:MKREUR', category: 'defi', rank: 344 },
  { symbol: 'MLN', name: 'Enzyme', pair: 'BINANCE:MLNEUR', category: 'defi', rank: 345 },
  { symbol: 'MOB', name: 'MobileCoin', pair: 'BINANCE:MOBEUR', category: 'privacy', rank: 346 },
  { symbol: 'MOVR', name: 'Moonriver', pair: 'BINANCE:MOVREUR', category: 'layer1', rank: 347 },
  { symbol: 'MTL', name: 'Metal', pair: 'BINANCE:MTLEUR', category: 'payments', rank: 348 },
  { symbol: 'NANO', name: 'Nano', pair: 'BINANCE:NANOEUR', category: 'currency', rank: 349 },
  { symbol: 'NAV', name: 'NavCoin', pair: 'BINANCE:NAVEUR', category: 'privacy', rank: 350 },
  { symbol: 'NEBL', name: 'Neblio', pair: 'BINANCE:NEBLEUR', category: 'platform', rank: 351 },
  { symbol: 'NEXO', name: 'Nexo', pair: 'BINANCE:NEXOEUR', category: 'lending', rank: 352 },
  { symbol: 'NMR', name: 'Numeraire', pair: 'BINANCE:NMREUR', category: 'ai', rank: 353 },
  { symbol: 'NU', name: 'NuCypher', pair: 'BINANCE:NUEUR', category: 'privacy', rank: 354 },
  { symbol: 'NULS', name: 'Nuls', pair: 'BINANCE:NULSEUR', category: 'platform', rank: 355 },
  { symbol: 'OAX', name: 'OAX', pair: 'BINANCE:OAXEUR', category: 'defi', rank: 356 },
  { symbol: 'OG', name: 'OG Fan Token', pair: 'BINANCE:OGEUR', category: 'sports', rank: 357 },
  { symbol: 'OMG', name: 'OMG Network', pair: 'BINANCE:OMGEUR', category: 'layer2', rank: 358 },
  { symbol: 'ONG', name: 'Ontology Gas', pair: 'BINANCE:ONGEUR', category: 'utility', rank: 359 },
  { symbol: 'OXT', name: 'Orchid', pair: 'BINANCE:OXTEUR', category: 'privacy', rank: 360 },
  { symbol: 'PAXG', name: 'PAX Gold', pair: 'BINANCE:PAXGEUR', category: 'commodity', rank: 361 },
  { symbol: 'PHA', name: 'Phala Network', pair: 'BINANCE:PHAEUR', category: 'privacy', rank: 362 },
  { symbol: 'PLA', name: 'PlayDapp', pair: 'BINANCE:PLAEUR', category: 'gaming', rank: 363 },
  { symbol: 'PNT', name: 'pNetwork', pair: 'BINANCE:PNTEUR', category: 'bridge', rank: 364 },
  { symbol: 'POND', name: 'Marlin', pair: 'BINANCE:PONDEUR', category: 'infrastructure', rank: 365 },
  { symbol: 'PORTO', name: 'FC Porto', pair: 'BINANCE:PORTOEUR', category: 'sports', rank: 366 },
  { symbol: 'POWR', name: 'Power Ledger', pair: 'BINANCE:POWREUR', category: 'energy', rank: 367 },
  { symbol: 'PYR', name: 'Vulcan Forged PYR', pair: 'BINANCE:PYREUR', category: 'gaming', rank: 368 },
  { symbol: 'QI', name: 'BENQI', pair: 'BINANCE:QIEUR', category: 'defi', rank: 369 },
  { symbol: 'QUICK', name: 'Quickswap', pair: 'BINANCE:QUICKEUR', category: 'defi', rank: 370 },
  { symbol: 'RAD', name: 'Radicle', pair: 'BINANCE:RADEUR', category: 'development', rank: 371 },
  { symbol: 'RARE', name: 'SuperRare', pair: 'BINANCE:RAREEUR', category: 'nft', rank: 372 },
  { symbol: 'RAY', name: 'Raydium', pair: 'BINANCE:RAYEUR', category: 'defi', rank: 373 },
  { symbol: 'REN', name: 'Ren', pair: 'BINANCE:RENEUR', category: 'bridge', rank: 374 },
  { symbol: 'REP', name: 'Augur', pair: 'BINANCE:REPEUR', category: 'prediction', rank: 375 },
  { symbol: 'REQ', name: 'Request', pair: 'BINANCE:REQEUR', category: 'payments', rank: 376 },
  { symbol: 'RGT', name: 'Rari Governance Token', pair: 'BINANCE:RGTEUR', category: 'defi', rank: 377 },
  { symbol: 'RIF', name: 'RSK Infrastructure Framework', pair: 'BINANCE:RIFEUR', category: 'infrastructure', rank: 378 },
  { symbol: 'RLC', name: 'iExec RLC', pair: 'BINANCE:RLCEUR', category: 'computing', rank: 379 },
  { symbol: 'ROSE', name: 'Oasis Network', pair: 'BINANCE:ROSEEUR', category: 'privacy', rank: 380 },
  { symbol: 'RSR', name: 'Reserve Rights', pair: 'BINANCE:RSREUR', category: 'defi', rank: 381 },
  { symbol: 'RUNE', name: 'THORChain', pair: 'BINANCE:RUNEEUR', category: 'defi', rank: 382 },
  { symbol: 'RVN', name: 'Ravencoin', pair: 'BINANCE:RVNEUR', category: 'currency', rank: 383 },
  { symbol: 'SAND', name: 'The Sandbox', pair: 'BINANCE:SANDEUR', category: 'gaming', rank: 384 },
  { symbol: 'SC', name: 'Siacoin', pair: 'BINANCE:SCEUR', category: 'storage', rank: 385 },
  { symbol: 'SCRT', name: 'Secret', pair: 'BINANCE:SCRTEUR', category: 'privacy', rank: 386 },
  { symbol: 'SFP', name: 'SafePal', pair: 'BINANCE:SFPEUR', category: 'wallet', rank: 387 },
  { symbol: 'SKL', name: 'SKALE', pair: 'BINANCE:SKLEUR', category: 'layer2', rank: 388 },
  { symbol: 'SLP', name: 'Smooth Love Potion', pair: 'BINANCE:SLPEUR', category: 'gaming', rank: 389 },
  { symbol: 'SNT', name: 'Status', pair: 'BINANCE:SNTEUR', category: 'messaging', rank: 390 },
  { symbol: 'SOL', name: 'Solana', pair: 'BINANCE:SOLEUR', category: 'layer1', rank: 391 },
  { symbol: 'SPARTA', name: 'Sparta', pair: 'BINANCE:SPARTAEUR', category: 'defi', rank: 392 },
  { symbol: 'SRM', name: 'Serum', pair: 'BINANCE:SRMEUR', category: 'defi', rank: 393 },
  { symbol: 'STEEM', name: 'Steem', pair: 'BINANCE:STEEMEUR', category: 'social', rank: 394 },
  { symbol: 'STMX', name: 'StormX', pair: 'BINANCE:STMXEUR', category: 'rewards', rank: 395 },
  { symbol: 'STPT', name: 'Standard Tokenization Protocol', pair: 'BINANCE:STPTEUR', category: 'tokenization', rank: 396 },
  { symbol: 'STRAX', name: 'Stratis', pair: 'BINANCE:STRAXEUR', category: 'platform', rank: 397 },
  { symbol: 'STX', name: 'Stacks', pair: 'BINANCE:STXEUR', category: 'layer2', rank: 398 },
  { symbol: 'SUN', name: 'Sun', pair: 'BINANCE:SUNEUR', category: 'defi', rank: 399 },
  { symbol: 'SUSHI', name: 'SushiSwap', pair: 'BINANCE:SUSHIEUR', category: 'defi', rank: 400 },

  // === STABLECOINS ET MONNAIES FIDUCIAIRES ===
  { symbol: 'USDT', name: 'Tether', pair: 'BINANCE:USDTEUR', category: 'stable', rank: 497 },
  { symbol: 'USDC', name: 'USD Coin', pair: 'BINANCE:USDCEUR', category: 'stable', rank: 498 },
  { symbol: 'BUSD', name: 'Binance USD', pair: 'BINANCE:BUSDEUR', category: 'stable', rank: 499 },
  { symbol: 'DAI', name: 'Dai', pair: 'BINANCE:DAIEUR', category: 'stable', rank: 500 },
]

// Mise à jour des catégories pour inclure toutes les nouvelles
const categories = [
  { id: 'all', name: 'Toutes', icon: '🏠', count: BINANCE_EUR_CRYPTOS.length },
  { id: 'major', name: 'Top 50', icon: '👑', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'major').length },
  { id: 'defi', name: 'DeFi', icon: '🏦', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'defi').length },
  { id: 'gaming', name: 'Gaming', icon: '🎮', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'gaming').length },
  { id: 'meme', name: 'Meme', icon: '🐕', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'meme').length },
  { id: 'layer1', name: 'Layer 1', icon: '⛓️', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'layer1').length },
  { id: 'layer2', name: 'Layer 2', icon: '🔗', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'layer2').length },
  { id: 'ai', name: 'AI & Tech', icon: '🤖', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'ai').length },
  { id: 'nft', name: 'NFT', icon: '🎨', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'nft').length },
  { id: 'privacy', name: 'Privacy', icon: '🔒', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'privacy').length },
  { id: 'stable', name: 'Stablecoins', icon: '💰', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'stable').length },
  { id: 'exchange', name: 'Exchange', icon: '🏢', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'exchange').length },
] 

interface ModernCryptoSelectorProps {
  selectedCrypto: string
  onCryptoSelect: (crypto: string) => void
  onClose?: () => void
}

export default function ModernCryptoSelector({ 
  selectedCrypto, 
  onCryptoSelect, 
  onClose 
}: ModernCryptoSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [favorites, setFavorites] = useState<string[]>(['BTCEUR', 'ETHEUR', 'BNBEUR'])
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const categories = [
    { id: 'all', name: 'Toutes', icon: '🏠', count: BINANCE_EUR_CRYPTOS.length },
    { id: 'major', name: 'Top 20', icon: '👑', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'major').length },
    { id: 'defi', name: 'DeFi', icon: '🏦', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'defi').length },
    { id: 'gaming', name: 'Gaming', icon: '🎮', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'gaming').length },
    { id: 'meme', name: 'Meme', icon: '🐕', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'meme').length },
    { id: 'layer1', name: 'Layer 1', icon: '⛓️', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'layer1').length },
    { id: 'ai', name: 'AI', icon: '🤖', count: BINANCE_EUR_CRYPTOS.filter(c => c.category === 'ai').length },
  ]

  const filteredCryptos = useMemo(() => {
    let filtered = BINANCE_EUR_CRYPTOS

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(crypto => crypto.category === selectedCategory)
    }

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(crypto => 
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => a.rank - b.rank)
  }, [searchTerm, selectedCategory])

  const toggleFavorite = (cryptoSymbol: string) => {
    const symbol = cryptoSymbol.replace('EUR', '')
    setFavorites(prev => 
      prev.includes(symbol + 'EUR')
        ? prev.filter(f => f !== symbol + 'EUR')
        : [...prev, symbol + 'EUR']
    )
  }

  const handleCryptoClick = (crypto: typeof BINANCE_EUR_CRYPTOS[0]) => {
    onCryptoSelect(crypto.pair)
    setIsOpen(false)
  }

  const CryptoCard = ({ crypto }: { crypto: typeof BINANCE_EUR_CRYPTOS[0] }) => {
    const isSelected = selectedCrypto === crypto.pair
    const isFavorite = favorites.includes(crypto.symbol + 'EUR')

    return (
      <div
        onClick={() => handleCryptoClick(crypto)}
        className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
          isSelected
            ? 'bg-[#6366F1]/20 border-[#6366F1]/40 shadow-lg shadow-[#6366F1]/20'
            : 'bg-gray-900/30 border-gray-800/40 hover:bg-gray-800/40 hover:border-gray-700/60 hover:scale-[1.02]'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${
              isSelected 
                ? 'from-[#6366F1] to-[#8B5CF6]' 
                : 'from-gray-600 to-gray-700'
            } flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
              {crypto.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="font-semibold text-[#F9FAFB] group-hover:text-[#6366F1] transition-colors">
                {crypto.symbol}
              </div>
              <div className="text-gray-400 text-sm truncate max-w-[120px]">
                {crypto.name}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500 font-mono">
              #{crypto.rank}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFavorite(crypto.symbol)
              }}
              className={`p-1 rounded-lg transition-all hover:scale-110 ${
                isFavorite
                  ? 'text-[#F59E0B] hover:text-[#F59E0B]'
                  : 'text-gray-500 hover:text-[#F59E0B]'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Indicateur de sélection */}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-[#6366F1] rounded-xl pointer-events-none">
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#6366F1] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const CryptoListItem = ({ crypto }: { crypto: typeof BINANCE_EUR_CRYPTOS[0] }) => {
    const isSelected = selectedCrypto === crypto.pair
    const isFavorite = favorites.includes(crypto.symbol + 'EUR')

    return (
      <div
        onClick={() => handleCryptoClick(crypto)}
        className={`group flex items-center justify-between p-4 cursor-pointer transition-all duration-200 border-b border-gray-800/20 ${
          isSelected
            ? 'bg-[#6366F1]/10 border-l-4 border-l-[#6366F1]'
            : 'hover:bg-gray-800/20'
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className="text-gray-500 font-mono text-sm w-8">
            #{crypto.rank}
          </div>
          <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${
            isSelected 
              ? 'from-[#6366F1] to-[#8B5CF6]' 
              : 'from-gray-600 to-gray-700'
          } flex items-center justify-center text-white font-bold text-xs`}>
            {crypto.symbol.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#F9FAFB] group-hover:text-[#6366F1] transition-colors">
                {crypto.symbol}
              </span>
              <span className="px-2 py-1 bg-gray-800 text-gray-400 text-xs rounded-full">
                {crypto.category}
              </span>
            </div>
            <div className="text-gray-400 text-sm truncate">
              {crypto.name}
            </div>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(crypto.symbol)
          }}
          className={`p-2 rounded-lg transition-all hover:scale-110 ${
            isFavorite
              ? 'text-[#F59E0B] hover:text-[#F59E0B]'
              : 'text-gray-500 hover:text-[#F59E0B]'
          }`}
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-4 bg-gray-900/50 border border-gray-700/50 rounded-xl hover:bg-gray-800/50 hover:border-gray-600/50 transition-all"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-bold text-xs">
            {selectedCrypto.split(':')[1]?.replace('EUR', '').slice(0, 2) || 'BT'}
          </div>
          <div className="text-left">
            <div className="font-semibold text-[#F9FAFB]">
              {selectedCrypto.split(':')[1]?.replace('EUR', '/EUR') || 'BTC/EUR'}
            </div>
            <div className="text-gray-400 text-sm">
              {BINANCE_EUR_CRYPTOS.find(c => c.pair === selectedCrypto)?.name || 'Bitcoin'}
            </div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl z-50 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-800/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#F9FAFB]">
                  Choisir une cryptomonnaie
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800/40 text-gray-400 hover:text-[#F9FAFB] transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher par nom ou symbole..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg pl-10 pr-4 py-3 text-[#F9FAFB] placeholder-gray-400 focus:outline-none focus:border-[#6366F1]/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#F9FAFB]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Categories + View Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === category.id
                          ? 'bg-[#6366F1] text-white'
                          : 'bg-gray-800/50 text-gray-400 hover:text-[#F9FAFB] hover:bg-gray-700/50'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                      <span className="opacity-75">({category.count})</span>
                    </button>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid' 
                        ? 'bg-[#6366F1] text-white' 
                        : 'bg-gray-800/50 text-gray-400 hover:text-[#F9FAFB]'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list' 
                        ? 'bg-[#6366F1] text-white' 
                        : 'bg-gray-800/50 text-gray-400 hover:text-[#F9FAFB]'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {filteredCryptos.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <div className="font-medium mb-1">Aucune crypto trouvée</div>
                  <div className="text-sm">Essayez un autre terme de recherche</div>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6' 
                  : 'divide-y divide-gray-800/20'
                }>
                  {filteredCryptos.map((crypto) => 
                    viewMode === 'grid' 
                      ? <CryptoCard key={crypto.pair} crypto={crypto} />
                      : <CryptoListItem key={crypto.pair} crypto={crypto} />
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800/40 bg-gray-900/50">
              <div className="text-xs text-gray-500 text-center">
                {BINANCE_EUR_CRYPTOS.length} cryptomonnaies disponibles sur Binance EUR
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}