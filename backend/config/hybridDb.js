// STUGUIDE X - Hybrid DB Fallback Layer
// Provides an in-memory/JSON-file database overlay in case MongoDB becomes unavailable.

const fs = require('fs');
const path = require('path');

const FALLBACK_FILE = path.join(__dirname, '..', '..', '.db', 'fallback_db.json');

class HybridDatabase {
  constructor() {
    this.data = {
      users: [],
      profiles: [],
      companies: [],
      placementdrives: [],
      applications: [],
      mocktests: [],
      questions: [],
      results: [],
      resources: [],
      reminders: [],
      notifications: [],
      forumposts: [],
      comments: [],
      habits: [],
      tasks: []
    };
    this.isActive = false;
    this._load();
  }

  // Load from local JSON if exists
  _load() {
    try {
      const dbDir = path.dirname(FALLBACK_FILE);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      if (fs.existsSync(FALLBACK_FILE)) {
        const fileContent = fs.readFileSync(FALLBACK_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
        console.log("[HybridDB] Local JSON database loaded successfully.");
      }
    } catch (err) {
      console.warn("[HybridDB] Could not load JSON fallback, using clean state.", err.message);
    }
  }

  // Save state to local file
  _save() {
    try {
      fs.writeFileSync(FALLBACK_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error("[HybridDB] Save failed: ", err.message);
    }
  }

  // Generic CRUD Mocking
  find(collection, query = {}) {
    const list = this.data[collection] || [];
    return list.filter(item => {
      for (let key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
  }

  findOne(collection, query = {}) {
    const matches = this.find(collection, query);
    return matches.length > 0 ? matches[0] : null;
  }

  insert(collection, document) {
    if (!this.data[collection]) this.data[collection] = [];
    const newDoc = {
      _id: document._id || 'id_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...document
    };
    this.data[collection].push(newDoc);
    this._save();
    return newDoc;
  }

  update(collection, query = {}, updates = {}) {
    const list = this.data[collection] || [];
    let count = 0;
    list.forEach(item => {
      let match = true;
      for (let key in query) {
        if (item[key] !== query[key]) {
          match = false;
          break;
        }
      }
      if (match) {
        Object.assign(item, updates, { updatedAt: new Date().toISOString() });
        count++;
      }
    });
    if (count > 0) this._save();
    return count;
  }

  delete(collection, query = {}) {
    const beforeLength = (this.data[collection] || []).length;
    this.data[collection] = (this.data[collection] || []).filter(item => {
      for (let key in query) {
        if (item[key] === query[key]) return false;
      }
      return true;
    });
    const afterLength = this.data[collection].length;
    if (beforeLength !== afterLength) this._save();
    return beforeLength - afterLength;
  }
}

const hybridDb = new HybridDatabase();
module.exports = hybridDb;
