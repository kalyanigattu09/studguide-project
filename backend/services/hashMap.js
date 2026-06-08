// STUGUIDE X - HashMap Cache Service
// Implements a key-value hash map with expiration logic to manage active auth sessions and profile caching.

class HashNode {
  constructor(key, value, ttlMs = 1800000) { // Default TTL: 30 minutes
    this.key = key;
    this.value = value;
    this.expiresAt = Date.now() + ttlMs;
  }

  isExpired() {
    return Date.now() > this.expiresAt;
  }
}

class SessionHashMap {
  constructor(bucketCount = 97) { // Prime bucket count for modulo distribution
    this.bucketCount = bucketCount;
    this.buckets = Array(bucketCount).fill(null).map(() => []);
  }

  // DJB2 Hash function for key conversion
  _hash(key) {
    let hash = 5381;
    const strKey = String(key);
    for (let i = 0; i < strKey.length; i++) {
      hash = (hash * 33) ^ strKey.charCodeAt(i);
    }
    return Math.abs(hash) % this.bucketCount;
  }

  // Puts a key-value pair in the map with a given TTL
  set(key, value, ttlMs = 1800000) {
    const index = this._hash(key);
    const bucket = this.buckets[index];
    
    // Check if key already exists, overwrite if found
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i] = new HashNode(key, value, ttlMs);
        return;
      }
    }

    // Add new node to bucket chain (Chaining for collision resolution)
    bucket.push(new HashNode(key, value, ttlMs));
  }

  // Gets a value by key. Cleans up key if it has expired.
  get(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        if (bucket[i].isExpired()) {
          // Remove expired item
          bucket.splice(i, 1);
          return null;
        }
        return bucket[i].value;
      }
    }
    return null;
  }

  // Deletes a key from the map
  delete(key) {
    const index = this._hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  // Clears all expired sessions
  garbageCollect() {
    let count = 0;
    for (let i = 0; i < this.bucketCount; i++) {
      const bucket = this.buckets[i];
      for (let j = bucket.length - 1; j >= 0; j--) {
        if (bucket[j].isExpired()) {
          bucket.splice(j, 1);
          count++;
        }
      }
    }
    return count;
  }
}

// Instantiate global session cache
const sessionCache = new SessionHashMap();

// Run garbage collection helper every 5 minutes in background
setInterval(() => {
  sessionCache.garbageCollect();
}, 300000);

module.exports = { SessionHashMap, sessionCache };
