// STUGUIDE X - Priority Queue Service
// Implements a binary heap-based Priority Queue for sorting jobs/drives by deadline or notification urgency.

class PriorityQueueNode {
  constructor(element, priority) {
    this.element = element;
    this.priority = priority; // Numeric priority. Lower value = higher priority (Min-Heap style)
  }
}

class PriorityQueue {
  constructor() {
    this.heap = [];
  }

  // Inserts an element with a given priority
  enqueue(element, priority) {
    const newNode = new PriorityQueueNode(element, priority);
    this.heap.push(newNode);
    this._bubbleUp();
  }

  // Dequeues the highest priority element (lowest priority number)
  dequeue() {
    if (this.isEmpty()) return null;
    const min = this.heap[0];
    const end = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this._sinkDown();
    }
    return min.element;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  size() {
    return this.heap.length;
  }

  peek() {
    return this.isEmpty() ? null : this.heap[0].element;
  }

  // Restores heap property going upwards
  _bubbleUp() {
    let index = this.heap.length - 1;
    const element = this.heap[index];

    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      let parent = this.heap[parentIndex];

      if (element.priority >= parent.priority) break;

      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  // Restores heap property going downwards
  _sinkDown() {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];

    while (true) {
      let leftChildIndex = 2 * index + 1;
      let rightChildIndex = 2 * index + 2;
      let leftChild, rightChild;
      let swap = null;

      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (leftChild.priority < element.priority) {
          swap = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && rightChild.priority < leftChild.priority)
        ) {
          swap = rightChildIndex;
        }
      }

      if (swap === null) break;

      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
  }
}

module.exports = { PriorityQueue };
