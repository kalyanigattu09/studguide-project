// STUGUIDE X - Queue Service
// Implements a standard Queue for background processing of dispatch notifications and reminders.

class QueueNode {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class NotificationQueue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  // Enqueues a notification job
  enqueue(data) {
    const newNode = new QueueNode(data);
    if (this.isEmpty()) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.length++;
  }

  // Dequeues a notification job
  dequeue() {
    if (this.isEmpty()) return null;
    const dequeuedNode = this.head;
    this.head = this.head.next;
    this.length--;
    
    if (this.isEmpty()) {
      this.tail = null;
    }
    return dequeuedNode.data;
  }

  isEmpty() {
    return this.length === 0;
  }

  size() {
    return this.length;
  }

  peek() {
    return this.isEmpty() ? null : this.head.data;
  }
}

// Global instance to handle notification dispatch pipeline
const dispatchQueue = new NotificationQueue();

// Background worker simulation to process notifications sequentially
function startNotificationWorker() {
  setInterval(async () => {
    if (dispatchQueue.isEmpty()) return;
    
    const notification = dispatchQueue.dequeue();
    try {
      // Simulate dispatching a real-time event
      console.log(`[Worker] Dispatching Notification to ${notification.userId}: "${notification.title}" - Status: SENT`);
      
      // In a production app, we would emit via Socket.io or trigger Web Push here.
    } catch (err) {
      console.error("[Worker] Error processing notification: ", err);
    }
  }, 2000); // Check and dispatch every 2 seconds
}

startNotificationWorker();

module.exports = { NotificationQueue, dispatchQueue };
