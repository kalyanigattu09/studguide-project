// STUGUIDE X - Max Heap Service
// Implements a Max-Heap to manage and retrieve real-time student leaderboard rankings.

class HeapNode {
  constructor(studentId, name, rollNo, branch, score, cgpa = 0, avgMockScore = 0, codingStreak = 0) {
    this.studentId = studentId;
    this.name = name;
    this.rollNo = rollNo;
    this.branch = branch;
    this.score = score; // Numerical ranking score (e.g. CGPA + test score + coding score)
    this.cgpa = cgpa;
    this.avgMockScore = avgMockScore;
    this.codingStreak = codingStreak;
  }
}

class MaxHeap {
  constructor() {
    this.heap = [];
  }

  // Inserts a new student score record
  insert(studentId, name, rollNo, branch, score, cgpa = 0, avgMockScore = 0, codingStreak = 0) {
    const node = new HeapNode(studentId, name, rollNo, branch, score, cgpa, avgMockScore, codingStreak);
    this.heap.push(node);
    this._bubbleUp(this.heap.length - 1);
  }

  // Returns the top student and removes them from the heap
  extractMax() {
    if (this.heap.length === 0) return null;
    const max = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown(0);
    }
    return max;
  }

  // Returns top N student rankings without destroying the heap
  getTopRankings(limit = 10) {
    // Clone heap to extract items sequentially without mutating the original
    const tempHeap = new MaxHeap();
    tempHeap.heap = [...this.heap];
    
    const rankings = [];
    const count = Math.min(limit, tempHeap.heap.length);
    for (let i = 0; i < count; i++) {
      rankings.push(tempHeap.extractMax());
    }
    return rankings;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  // Rebuild heap from raw array of student profiles
  buildHeap(studentList) {
    this.heap = studentList.map(s => {
      // Calculate consolidated success score: (CGPA * 10) + codingStreak + averageMockScore
      const cgpaContrib = (s.cgpa || 0) * 10;
      const codingContrib = s.codingStreak || 0;
      const testContrib = s.avgMockScore || 0;
      const totalScore = cgpaContrib + codingContrib + testContrib;
      return new HeapNode(
        s.userId,
        s.name,
        s.rollNo,
        s.branch,
        parseFloat(totalScore.toFixed(2)),
        s.cgpa || 0,
        s.avgMockScore || 0,
        s.codingStreak || 0
      );
    });
    
    // Bottom-up heapify
    const startIdx = Math.floor(this.heap.length / 2) - 1;
    for (let i = startIdx; i >= 0; i--) {
      this._sinkDown(i);
    }
  }

  _bubbleUp(index) {
    const node = this.heap[index];
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIdx];
      
      if (node.score <= parent.score) break;
      
      this.heap[index] = parent;
      this.heap[parentIdx] = node;
      index = parentIdx;
    }
  }

  _sinkDown(index) {
    const length = this.heap.length;
    const node = this.heap[index];

    while (true) {
      let leftChildIdx = 2 * index + 1;
      let rightChildIdx = 2 * index + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIdx < length) {
        leftChild = this.heap[leftChildIdx];
        if (leftChild.score > node.score) {
          swap = leftChildIdx;
        }
      }

      if (rightChildIdx < length) {
        rightChild = this.heap[rightChildIdx];
        if (
          (swap === null && rightChild.score > node.score) ||
          (swap !== null && rightChild.score > leftChild.score)
        ) {
          swap = rightChildIdx;
        }
      }

      if (swap === null) break;

      this.heap[index] = this.heap[swap];
      this.heap[swap] = node;
      index = swap;
    }
  }
}

module.exports = { MaxHeap };
