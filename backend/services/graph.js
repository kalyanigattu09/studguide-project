// STUGUIDE X - Graph Service
// Implements an Adjacency List Directed Graph to model learning paths and career roadmaps.

class CareerGraph {
  constructor() {
    this.adjacencyList = new Map();
  }

  // Adds a node/skill/milestone
  addVertex(vertex, info = {}) {
    if (!this.adjacencyList.has(vertex)) {
      this.adjacencyList.set(vertex, {
        info: info,
        edges: []
      });
    }
  }

  // Adds a directed dependency edge (from source to target skill)
  addEdge(source, destination, type = "prerequisite") {
    if (!this.adjacencyList.has(source)) this.addVertex(source);
    if (!this.adjacencyList.has(destination)) this.addVertex(destination);

    this.adjacencyList.get(source).edges.push({
      node: destination,
      type: type
    });
  }

  // Gets the info and prerequisites for a specific node
  getVertexInfo(vertex) {
    return this.adjacencyList.get(vertex) || null;
  }

  // Generates a complete sequential roadmap using Topological Sort / BFS traversal
  getRoadmap(startNode) {
    if (!this.adjacencyList.has(startNode)) return [];

    const visited = new Set();
    const roadmap = [];
    const queue = [startNode];

    visited.add(startNode);

    while (queue.length > 0) {
      const current = queue.shift();
      const nodeData = this.adjacencyList.get(current);
      
      roadmap.push({
        name: current,
        info: nodeData.info,
        connections: nodeData.edges.map(e => e.node)
      });

      for (let edge of nodeData.edges) {
        if (!visited.has(edge.node)) {
          visited.add(edge.node);
          queue.push(edge.node);
        }
      }
    }

    return roadmap;
  }

  // Find skill gaps: Given a student's acquired skills, find remaining skills in a career path
  findSkillGaps(careerPathName, acquiredSkills) {
    const roadmap = this.getRoadmap(careerPathName);
    const acquiredSet = new Set(acquiredSkills.map(s => s.toLowerCase().trim()));
    const missing = [];
    
    // Skip the root career node itself, check all child node dependencies
    for (let i = 1; i < roadmap.length; i++) {
      const skillName = roadmap[i].name;
      if (!acquiredSet.has(skillName.toLowerCase().trim())) {
        missing.push({
          name: skillName,
          info: roadmap[i].info
        });
      }
    }
    return missing;
  }
}

// Pre-seed career pathways and skill dependencies
const careerGraph = new CareerGraph();

// Add Full Stack Path
careerGraph.addVertex("Full Stack Developer", { desc: "Design client-side and server-side web applications", duration: "6 Months" });
careerGraph.addEdge("Full Stack Developer", "Frontend Fundamentals");
careerGraph.addEdge("Frontend Fundamentals", "React.js Framework");
careerGraph.addEdge("React.js Framework", "Backend Core Node/Express");
careerGraph.addEdge("Backend Core Node/Express", "Databases MongoDB/SQL");
careerGraph.addEdge("Databases MongoDB/SQL", "Advanced System Design");

// Add AI/Data Science Path
careerGraph.addVertex("AI Engineer", { desc: "Develop advanced neural network models and machine learning pipelines", duration: "8 Months" });
careerGraph.addEdge("AI Engineer", "Mathematics (Linear Algebra, Calculus, Stats)");
careerGraph.addEdge("Mathematics (Linear Algebra, Calculus, Stats)", "Python and PyTorch/TensorFlow");
careerGraph.addEdge("Python and PyTorch/TensorFlow", "Supervised & Unsupervised Machine Learning");
careerGraph.addEdge("Supervised & Unsupervised Machine Learning", "Deep Learning & Neural Networks");
careerGraph.addEdge("Deep Learning & Neural Networks", "Natural Language Processing & LLMs");

// Add DevOps Path
careerGraph.addVertex("DevOps Engineer", { desc: "Manage software operations, server architectures, and release cycles", duration: "5 Months" });
careerGraph.addEdge("DevOps Engineer", "Linux Commands & Scripting");
careerGraph.addEdge("Linux Commands & Scripting", "Git Version Control & Actions");
careerGraph.addEdge("Git Version Control & Actions", "Docker Containerization");
careerGraph.addEdge("Docker Containerization", "Kubernetes Orchestration");
careerGraph.addEdge("Kubernetes Orchestration", "Cloud Deployments (AWS/GCP)");

module.exports = { CareerGraph, careerGraph };
