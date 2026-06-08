// STUGUIDE X - Trie Service
// Implements a prefix tree for ultra-fast autocompletion of skills and resource tags.

class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
    this.data = null; // Associated info (e.g. category, category-specific details)
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Inserts a phrase/word into the Trie
  insert(word, data = null) {
    if (!word) return;
    let current = this.root;
    const cleanWord = word.trim().toLowerCase();
    
    for (let char of cleanWord) {
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
    current.data = data || { name: word.trim() };
  }

  // Helper function to perform DFS and fetch all matching words with a given prefix
  _collectAllWords(node, prefix, results) {
    if (node.isEndOfWord) {
      results.push({
        term: prefix,
        data: node.data
      });
    }
    
    for (let char in node.children) {
      this._collectAllWords(node.children[char], prefix + char, results);
    }
  }

  // Searches for terms with the given prefix and returns suggestions
  searchPrefix(prefix) {
    if (!prefix) return [];
    let current = this.root;
    const cleanPrefix = prefix.trim().toLowerCase();

    for (let char of cleanPrefix) {
      if (!current.children[char]) {
        return []; // No matches found
      }
      current = current.children[char];
    }

    const results = [];
    // Collect all words starting from this node
    this._collectAllWords(current, prefix.trim(), results);
    return results;
  }
}

// Pre-populate with common industry skills and topics
const skillTrie = new Trie();
const commonSkills = [
  "React.js", "React Native", "Redux", "Angular", "Vue.js", "Next.js",
  "HTML5", "CSS3", "JavaScript", "TypeScript", "Node.js", "Express.js",
  "MongoDB", "Mongoose", "SQL", "PostgreSQL", "MySQL", "GraphQL", "REST API",
  "Python", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "Scikit-Learn",
  "Java", "Spring Boot", "Kotlin", "Swift", "C++", "C#", "Go", "Rust",
  "AWS", "Google Cloud", "Azure", "Docker", "Kubernetes", "CI/CD", "Git",
  "Data Structures", "Algorithms", "Operating Systems", "DBMS", "Computer Networks",
  "System Design", "Aptitude", "Verbal Reasoning", "Logical Reasoning"
];

commonSkills.forEach(skill => {
  skillTrie.insert(skill, { name: skill, type: "skill" });
});

module.exports = { Trie, skillTrie };
