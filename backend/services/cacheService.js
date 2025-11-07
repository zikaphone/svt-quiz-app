
const os = require('os');
const path = require('path');
const fs = require('fs');
const CACHE_FILENAME = 'full_structure_cache.json';
const FALLBACK_FILENAME = path.join(__dirname, '../data/initialData.json');


function getCacheDir() {
  const cacheDir = path.join(os.homedir(), '.appQuizCache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
  return cacheDir;
}

function getUserCacheFilePath(userId) {
  return path.join(getCacheDir(), `user_${userId}_dashboard.json`);
}

function writeCacheFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function initCacheFromDefaultIfNeeded(userId) {
  const targetPath = getUserCacheFilePath(userId);
  if (fs.existsSync(targetPath)) return;

  const defaultPath = path.join(__dirname, '../data/defaultUserData.json');

  if (fs.existsSync(defaultPath)) {
    fs.copyFileSync(defaultPath, targetPath);
    console.log(`📦 Copied defaultUserData.json to ${targetPath}`);
  }
}

function getCacheFilePath() {
  const userHomeDir = os.homedir();
  const cacheDir = path.join(userHomeDir, '.appQuizCache');
  if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
  return path.join(cacheDir, CACHE_FILENAME);
}

function loadCache() {
  const cachePath = getCacheFilePath();
  if (!fs.existsSync(cachePath)) return null;

  try {
    const rawData = fs.readFileSync(cachePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('[CacheService] Erreur lecture cache:', err);
    return null;
  }
}

function saveCache(data) {
  const cachePath = getCacheFilePath();
  const toSave = {
    timestamp: Date.now(),
    data,
  };

  try {
    fs.writeFileSync(cachePath, JSON.stringify(toSave, null, 2), 'utf-8');
    console.log('[CacheService] Cache sauvegardé.');
  } catch (err) {
    console.error('[CacheService] Erreur écriture cache:', err);
  }
}

// Si cache absent, on initialise depuis un JSON local
function initializeCacheFromFallback() {
  const cachePath = getCacheFilePath();
  if (!fs.existsSync(FALLBACK_FILENAME)) {
    console.warn('[CacheService] Fichier fallback introuvable.');
    return null;
  }

  try {
    const fallbackData = fs.readFileSync(FALLBACK_FILENAME, 'utf-8');
    const json = JSON.parse(fallbackData);
    saveCache(json.data || json); // On force à avoir un champ "data" si besoin
    return json.data || json;
  } catch (err) {
    console.error('[CacheService] Erreur lecture fallback:', err);
    return null;
  }
}

function isCacheValid(cache, maxAgeMs = 1800000) {
  if (!cache || !cache.timestamp) return false;
  return (Date.now() - cache.timestamp) <= maxAgeMs;
}

module.exports = {
  loadCache,
  saveCache,
  isCacheValid,
  initializeCacheFromFallback,
  getUserCacheFilePath,
  writeCacheFile,
  getCacheDir,
  initCacheFromDefaultIfNeeded
};
