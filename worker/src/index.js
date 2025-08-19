// import 'dotenv/config';
// import bullmq from 'bullmq';
// import Redis from 'ioredis';
// import mongoose from 'mongoose';
// import axios from 'axios';
// import pino from 'pino';
// import dayjs from 'dayjs';
// import Note from '../../api/src/models/note.js';
// import { makeIdempotencyKey } from './utils.js';

// const { Queue, Worker, QueueScheduler } = bullmq;
// const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
// const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/droplater';
// const QUEUE_NAME = process.env.QUEUE_NAME || 'deliveries';
// const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '5000', 10);

// const connection = new Redis(REDIS_URL);

// // Initialize queue and scheduler
// const scheduler = new QueueScheduler(QUEUE_NAME, { connection });
// const queue = new Queue(QUEUE_NAME, { connection });

// // MongoDB connection
// mongoose.connect(MONGO_URL).then(() => logger.info('Worker Mongo connected')).catch(err => {
//   logger.error(err, 'Worker Mongo connection error'); 
//   process.exit(1);
// });

// // Polling function
// async function pollAndEnqueue() {
//   try {
//     const now = new Date();
//     const due = await Note.find({ status: 'pending', releaseAt: { $lte: now } }).limit(100).lean();
    
//     for (const n of due) {
//       await queue.add('deliverNote', { noteId: n._id.toString() }, {
//         jobId: n._id.toString(),
//         attempts: 3,
//         backoff: { type: 'custom' },
//         removeOnComplete: true,
//         removeOnFail: 500
//       });
//     }
    
//     if (due.length) logger.info({ count: due.length }, 'Enqueued due notes');
//   } catch (e) {
//     logger.error(e, 'pollAndEnqueue error');
//   }
// }

// // Start polling
// setInterval(pollAndEnqueue, POLL_INTERVAL_MS);
// pollAndEnqueue();

// // Worker setup
// const worker = new Worker(QUEUE_NAME, async (job) => {
//   const { noteId } = job.data;
//   const note = await Note.findById(noteId);
  
//   if (!note) {
//     logger.warn({ noteId }, 'Note not found');
//     return;
//   }
  
//   if (['delivered', 'dead'].includes(note.status)) {
//     logger.info({ noteId, status: note.status }, 'Note already processed');
//     return;
//   }

//   const idempKey = makeIdempotencyKey(note._id.toString(), note.releaseAt.toISOString());
//   const started = Date.now();
  
//   try {
//     const res = await axios.post(note.webhookUrl, {
//       id: note._id.toString(),
//       title: note.title,
//       body: note.body,
//       releaseAt: note.releaseAt
//     }, {
//       headers: {
//         'X-Note-Id': note._id.toString(),
//         'X-Idempotency-Key': idempKey,
//         'Content-Type': 'application/json'
//       },
//       timeout: 10000
//     });

//     const ok = res.status >= 200 && res.status < 300;
//     note.attempts.push({
//       at: new Date(),
//       statusCode: res.status,
//       ok,
//       error: ok ? undefined : `HTTP ${res.status}`
//     });
    
//     if (ok) {
//       note.status = 'delivered';
//       note.deliveredAt = new Date();
//       await note.save();
//       logger.info({
//         noteId,
//         try: job.attemptsMade + 1,
//         statusCode: res.status,
//         ms: Date.now() - started
//       }, 'Delivered');
//       return;
//     } else {
//       await note.save();
//       throw new Error(`Non-2xx: ${res.status}`);
//     }
//   } catch (err) {
//     note.attempts.push({
//       at: new Date(),
//       statusCode: err.response?.status,
//       ok: false,
//       error: err.message
//     });
    
//     if (job.attemptsMade + 1 >= (job.opts.attempts || 3)) {
//       note.status = 'dead';
//     } else {
//       note.status = 'failed';
//     }
    
//     await note.save();
//     logger.warn({
//       noteId,
//       try: job.attemptsMade + 1,
//       error: err.message,
//       ms: Date.now() - started
//     }, 'Delivery failed');
//     throw err;
//   }
// }, {
//   connection,
//   settings: {
//     backoffStrategies: {
//       custom: (attemptsMade) => [1000, 5000, 25000][attemptsMade - 1] || 0
//     }
//   }
// });

// // Worker event handlers
// worker.on('failed', (job, err) => {
//   logger.warn({
//     jobId: job.id,
//     attemptsMade: job.attemptsMade,
//     err: err.message
//   }, 'Job failed');
// });

// worker.on('completed', (job) => {
//   logger.info({ jobId: job.id }, 'Job completed');
// });

// worker.on('error', (err) => {
//   logger.error(err, 'Worker error');
// });

// // Handle process termination
// process.on('SIGTERM', async () => {
//   logger.info('SIGTERM received, shutting down');
//   await worker.close();
//   await queue.close();
//   await connection.quit();
//   process.exit(0);
// });

// process.on('SIGINT', async () => {
//   logger.info('SIGINT received, shutting down');
//   await worker.close();
//   await queue.close();
//   await connection.quit();
//   process.exit(0);
// });



// import 'dotenv/config';
// import bullmq from 'bullmq';
// import Redis from 'ioredis';
// import mongoose from 'mongoose';
// import axios from 'axios';
// import pino from 'pino';
// import Note from '../../api/src/models/note.js';
// import { makeIdempotencyKey } from './utils.js';

// const { Queue, Worker } = bullmq; // Removed QueueScheduler import
// const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
// const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/droplater';
// const QUEUE_NAME = process.env.QUEUE_NAME || 'deliveries';
// const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '5000', 10);

// const connection = new Redis(REDIS_URL);

// // Initialize queue (QueueScheduler is no longer needed in BullMQ v4+)
// const queue = new Queue(QUEUE_NAME, { connection });

// // MongoDB connection
// mongoose.connect(MONGO_URL).then(() => logger.info('Worker Mongo connected')).catch(err => {
//   logger.error(err, 'Worker Mongo connection error'); 
//   process.exit(1);
// });

// // Polling function
// async function pollAndEnqueue() {
//   try {
//     const now = new Date();
//     const due = await Note.find({ 
//       status: 'pending', 
//       releaseAt: { $lte: now } 
//     }).limit(100).lean();
    
//     for (const n of due) {
//       await queue.add('deliverNote', { noteId: n._id.toString() }, {
//         jobId: n._id.toString(),
//         attempts: 3,
//         backoff: { type: 'custom' },
//         removeOnComplete: true,
//         removeOnFail: 500
//       });
//     }
    
//     if (due.length) logger.info({ count: due.length }, 'Enqueued due notes');
//   } catch (e) {
//     logger.error(e, 'pollAndEnqueue error');
//   }
// }

// // Start polling
// setInterval(pollAndEnqueue, POLL_INTERVAL_MS);
// pollAndEnqueue();

// // Worker setup
// const worker = new Worker(QUEUE_NAME, async (job) => {
//   const { noteId } = job.data;
//   const note = await Note.findById(noteId);
  
//   if (!note) {
//     logger.warn({ noteId }, 'Note not found');
//     return;
//   }
  
//   if (['delivered', 'dead'].includes(note.status)) {
//     logger.info({ noteId, status: note.status }, 'Note already processed');
//     return;
//   }

//   const idempKey = makeIdempotencyKey(note._id.toString(), note.releaseAt.toISOString());
//   const started = Date.now();
  
//   try {
//     const res = await axios.post(note.webhookUrl, {
//       id: note._id.toString(),
//       title: note.title,
//       body: note.body,
//       releaseAt: note.releaseAt
//     }, {
//       headers: {
//         'X-Note-Id': note._id.toString(),
//         'X-Idempotency-Key': idempKey,
//         'Content-Type': 'application/json'
//       },
//       timeout: 10000
//     });

//     const ok = res.status >= 200 && res.status < 300;
//     note.attempts.push({
//       at: new Date(),
//       statusCode: res.status,
//       ok,
//       error: ok ? undefined : `HTTP ${res.status}`
//     });
    
//     if (ok) {
//       note.status = 'delivered';
//       note.deliveredAt = new Date();
//       await note.save();
//       logger.info({
//         noteId,
//         try: job.attemptsMade + 1,
//         statusCode: res.status,
//         ms: Date.now() - started
//       }, 'Delivered');
//       return;
//     } else {
//       await note.save();
//       throw new Error(`Non-2xx: ${res.status}`);
//     }
//   } catch (err) {
//     note.attempts.push({
//       at: new Date(),
//       statusCode: err.response?.status,
//       ok: false,
//       error: err.message
//     });
    
//     if (job.attemptsMade + 1 >= (job.opts.attempts || 3)) {
//       note.status = 'dead';
//     } else {
//       note.status = 'failed';
//     }
    
//     await note.save();
//     logger.warn({
//       noteId,
//       try: job.attemptsMade + 1,
//       error: err.message,
//       ms: Date.now() - started
//     }, 'Delivery failed');
//     throw err;
//   }
// }, {
//   connection,
//   settings: {
//     backoffStrategies: {
//       custom: (attemptsMade) => [1000, 5000, 25000][attemptsMade - 1] || 0
//     }
//   }
// });

// // Worker event handlers
// worker.on('failed', (job, err) => {
//   logger.warn({
//     jobId: job.id,
//     attemptsMade: job.attemptsMade,
//     err: err.message
//   }, 'Job failed');
// });

// worker.on('completed', (job) => {
//   logger.info({ jobId: job.id }, 'Job completed');
// });

// worker.on('error', (err) => {
//   logger.error(err, 'Worker error');
// });

// // Handle process termination
// process.on('SIGTERM', async () => {
//   logger.info('SIGTERM received, shutting down');
//   await worker.close();
//   await queue.close();
//   await connection.quit();
//   process.exit(0);
// });

// process.on('SIGINT', async () => {
//   logger.info('SIGINT received, shutting down');
//   await worker.close();
//   await queue.close();
//   await connection.quit();
//   process.exit(0);
// });



// import 'dotenv/config';
// import bullmq from 'bullmq';
// import Redis from 'ioredis';
// import mongoose from 'mongoose';
// import axios from 'axios';
// import pino from 'pino';
// import Note from '../../api/src/models/note.js';
// import { makeIdempotencyKey } from './utils.js';

// const { Queue, Worker } = bullmq;
// const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
// const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/droplater';
// const QUEUE_NAME = process.env.QUEUE_NAME || 'deliveries';
// const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '5000', 10);

// // Configure Redis connection with BullMQ v4+ compatibility
// const connection = new Redis(REDIS_URL, {
//   maxRetriesPerRequest: null,
//   enableOfflineQueue: false
// });

// const queue = new Queue(QUEUE_NAME, { connection });

// // Configure MongoDB with robust connection settings
// mongoose.connect(MONGO_URL, {
//   serverSelectionTimeoutMS: 30000,
//   socketTimeoutMS: 45000,
//   connectTimeoutMS: 30000,
//   maxPoolSize: 10,
//   retryWrites: true,
//   retryReads: true
// }).then(() => logger.info('Worker Mongo connected'))
//   .catch(err => {
//     logger.error(err, 'Worker Mongo connection error');
//     process.exit(1);
//   });

// // MongoDB connection event listeners
// mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
// mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
// mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
// mongoose.connection.on('error', (err) => logger.error(err, 'MongoDB connection error'));

// // Polling function with improved error handling
// async function pollAndEnqueue() {
//   try {
//     const now = new Date();
//     const due = await Note.find({ 
//       status: 'pending', 
//       releaseAt: { $lte: now } 
//     }).limit(100).lean();
    
//     for (const n of due) {
//       await queue.add('deliverNote', { noteId: n._id.toString() }, {
//         jobId: n._id.toString(),
//         attempts: 3,
//         backoff: { type: 'custom' },
//         removeOnComplete: true,
//         removeOnFail: 500
//       });
//     }
    
//     if (due.length) logger.info({ count: due.length }, 'Enqueued due notes');
//   } catch (e) {
//     logger.error(e, 'pollAndEnqueue error');
//     // Reconnect if connection was lost
//     if (e.name === 'MongooseError' && !mongoose.connection.readyState) {
//       await mongoose.connect(MONGO_URL).catch(err => 
//         logger.error(err, 'Reconnection failed'));
//     }
//   }
// }

// // Start polling with initial call
// setInterval(pollAndEnqueue, POLL_INTERVAL_MS);
// pollAndEnqueue();

// // Worker with enhanced error handling
// const worker = new Worker(QUEUE_NAME, async (job) => {
//   const { noteId } = job.data;
  
//   try {
//     const note = await Note.findById(noteId);
    
//     if (!note) {
//       logger.warn({ noteId }, 'Note not found');
//       return;
//     }
    
//     if (['delivered', 'dead'].includes(note.status)) {
//       logger.info({ noteId, status: note.status }, 'Note already processed');
//       return;
//     }

//     const idempKey = makeIdempotencyKey(note._id.toString(), note.releaseAt.toISOString());
//     const started = Date.now();
    
//     const res = await axios.post(note.webhookUrl, {
//       id: note._id.toString(),
//       title: note.title,
//       body: note.body,
//       releaseAt: note.releaseAt
//     }, {
//       headers: {
//         'X-Note-Id': note._id.toString(),
//         'X-Idempotency-Key': idempKey,
//         'Content-Type': 'application/json'
//       },
//       timeout: 10000
//     });

//     const ok = res.status >= 200 && res.status < 300;
//     note.attempts.push({
//       at: new Date(),
//       statusCode: res.status,
//       ok,
//       error: ok ? undefined : `HTTP ${res.status}`
//     });
    
//     if (ok) {
//       note.status = 'delivered';
//       note.deliveredAt = new Date();
//       await note.save();
//       logger.info({
//         noteId,
//         try: job.attemptsMade + 1,
//         statusCode: res.status,
//         ms: Date.now() - started
//       }, 'Delivered');
//       return;
//     }
    
//     await note.save();
//     throw new Error(`Non-2xx: ${res.status}`);
//   } catch (err) {
//     const note = await Note.findById(noteId);
//     if (!note) throw err;
    
//     note.attempts.push({
//       at: new Date(),
//       statusCode: err.response?.status,
//       ok: false,
//       error: err.message
//     });
    
//     note.status = job.attemptsMade + 1 >= (job.opts.attempts || 3) ? 'dead' : 'failed';
//     await note.save();
    
//     logger.warn({
//       noteId,
//       try: job.attemptsMade + 1,
//       error: err.message,
//       ms: Date.now() - started
//     }, 'Delivery failed');
//     throw err;
//   }
// }, {
//   connection,
//   settings: {
//     backoffStrategies: {
//       custom: (attemptsMade) => [1000, 5000, 25000][attemptsMade - 1] || 0
//     }
//   }
// });

// // Worker event handlers
// worker.on('failed', (job, err) => {
//   logger.warn({
//     jobId: job.id,
//     attemptsMade: job.attemptsMade,
//     err: err.message
//   }, 'Job failed');
// });

// worker.on('completed', (job) => {
//   logger.info({ jobId: job.id }, 'Job completed');
// });

// worker.on('error', (err) => {
//   logger.error(err, 'Worker error');
// });

// // Graceful shutdown
// const shutdown = async () => {
//   logger.info('Shutting down gracefully...');
//   await worker.close();
//   await queue.close();
//   await connection.quit();
//   await mongoose.disconnect();
//   process.exit(0);
// };

// process.on('SIGTERM', shutdown);
// process.on('SIGINT', shutdown);


// import 'dotenv/config';
// import bullmq from 'bullmq';
// import Redis from 'ioredis';
// import mongoose from 'mongoose';
// import axios from 'axios';
// import pino from 'pino';
// import Note from '../../api/src/models/note.js';
// import { makeIdempotencyKey } from './utils.js';

// const { Queue, Worker } = bullmq;
// const logger = pino({ 
//   level: process.env.LOG_LEVEL || 'info',
//   transport: {
//     target: 'pino-pretty'
//   }
// });

// // Configuration
// const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
// const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/droplater';
// const QUEUE_NAME = process.env.QUEUE_NAME || 'deliveries';
// const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '5000', 10);

// // Redis 5.0.14.1 compatible configuration
// const connection = new Redis(REDIS_URL, {
//   maxRetriesPerRequest: null,
//   enableOfflineQueue: false,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 1000, 5000);
//     return delay;
//   },
//   reconnectOnError: (err) => {
//     logger.warn(err, 'Redis connection error');
//     return true;
//   }
// });

// const queue = new Queue(QUEUE_NAME, { 
//   connection,
//   // Additional Redis 5.x compatibility settings
//   defaultJobOptions: {
//     removeOnComplete: 100,
//     removeOnFail: 1000,
//     attempts: 3,
//     backoff: {
//       type: 'custom'
//     }
//   }
// });

// // Robust MongoDB connection
// mongoose.connect(MONGO_URL, {
//   serverSelectionTimeoutMS: 30000,
//   socketTimeoutMS: 45000,
//   connectTimeoutMS: 30000,
//   maxPoolSize: 10,
//   retryWrites: true,
//   retryReads: true,
//   waitQueueTimeoutMS: 30000
// }).then(() => {
//   logger.info('MongoDB connected');
//   // Create indexes if they don't exist
//   Note.createIndexes().catch(err => 
//     logger.warn(err, 'Note index creation failed'));
// }).catch(err => {
//   logger.error(err, 'MongoDB connection failed');
//   process.exit(1);
// });

// // Connection event handlers
// mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
// mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
// mongoose.connection.on('error', (err) => logger.error(err, 'MongoDB error'));

// // Enhanced polling with connection checks
// async function pollAndEnqueue() {
//   // Skip if connections aren't ready
//   if (mongoose.connection.readyState !== 1 || connection.status !== 'ready') {
//     logger.warn('Skipping poll - connections not ready');
//     return;
//   }

//   try {
//     const now = new Date();
//     const due = await Note.find({
//       status: 'pending',
//       releaseAt: { $lte: now }
//     })
//     .maxTimeMS(30000) // 30 second timeout
//     .limit(100)
//     .lean()
//     .exec();

//     if (due.length > 0) {
//       logger.info(`Found ${due.length} due notes`);
//       const jobs = due.map(n => ({
//         name: 'deliverNote',
//         data: { noteId: n._id.toString() },
//         opts: {
//           jobId: n._id.toString(),
//           removeOnComplete: true,
//           removeOnFail: 500
//         }
//       }));
      
//       await queue.addBulk(jobs);
//       logger.info(`Enqueued ${due.length} notes`);
//     }
//   } catch (err) {
//     logger.error(err, 'Polling error');
//     // Handle specific MongoDB errors
//     if (err.name === 'MongoNetworkError' || err.message.includes('timed out')) {
//       await mongoose.disconnect();
//       await mongoose.connect(MONGO_URL).catch(e => 
//         logger.error(e, 'Reconnection failed'));
//     }
//   }
// }

// // Start polling with initial delay
// setTimeout(() => {
//   setInterval(pollAndEnqueue, POLL_INTERVAL_MS);
//   pollAndEnqueue();
// }, 5000); // 5 second initial delay

// // Worker configuration
// const worker = new Worker(QUEUE_NAME, async job => {
//   const { noteId } = job.data;
//   const startTime = Date.now();
  
//   try {
//     const note = await Note.findById(noteId).maxTimeMS(30000);
//     if (!note) {
//       logger.warn(`Note ${noteId} not found`);
//       return;
//     }

//     if (['delivered', 'dead'].includes(note.status)) {
//       logger.info(`Note ${noteId} already processed (status: ${note.status})`);
//       return;
//     }

//     const idempKey = makeIdempotencyKey(note._id.toString(), note.releaseAt.toISOString());
//     const response = await axios.post(note.webhookUrl, {
//       id: note._id.toString(),
//       title: note.title,
//       body: note.body,
//       releaseAt: note.releaseAt
//     }, {
//       headers: {
//         'X-Note-Id': note._id.toString(),
//         'X-Idempotency-Key': idempKey,
//         'Content-Type': 'application/json'
//       },
//       timeout: 10000
//     });

//     const success = response.status >= 200 && response.status < 300;
//     note.attempts.push({
//       at: new Date(),
//       statusCode: response.status,
//       ok: success,
//       error: success ? undefined : `HTTP ${response.status}`
//     });

//     if (success) {
//       note.status = 'delivered';
//       note.deliveredAt = new Date();
//       await note.save();
//       logger.info(`Delivered note ${noteId} in ${Date.now() - startTime}ms`);
//       return;
//     }

//     throw new Error(`HTTP ${response.status}`);
//   } catch (err) {
//     const note = await Note.findById(noteId).maxTimeMS(30000);
//     if (!note) throw err;

//     note.attempts.push({
//       at: new Date(),
//       statusCode: err.response?.status,
//       ok: false,
//       error: err.message
//     });

//     note.status = job.attemptsMade + 1 >= (job.opts.attempts || 3) ? 'dead' : 'failed';
//     await note.save();
    
//     logger.warn(`Failed to deliver note ${noteId} (attempt ${job.attemptsMade + 1}): ${err.message}`);
//     throw err;
//   }
// }, {
//   connection,
//   settings: {
//     backoffStrategies: {
//       custom: attemptsMade => [1000, 5000, 25000][attemptsMade - 1] || 0
//     }
//   }
// });

// // Worker event handlers
// worker.on('failed', (job, err) => {
//   logger.warn(`Job ${job.id} failed: ${err.message}`);
// });

// worker.on('completed', job => {
//   logger.info(`Job ${job.id} completed`);
// });

// worker.on('error', err => {
//   logger.error(err, 'Worker error');
// });

// // Graceful shutdown
// const shutdown = async () => {
//   logger.info('Shutting down gracefully...');
//   try {
//     await worker.close();
//     await queue.close();
//     await connection.quit();
//     await mongoose.disconnect();
//     logger.info('Clean shutdown complete');
//     process.exit(0);
//   } catch (err) {
//     logger.error(err, 'Shutdown error');
//     process.exit(1);
//   }
// };

// process.on('SIGTERM', shutdown);
// process.on('SIGINT', shutdown);

// // Initialization complete
// logger.info('Worker started');


import 'dotenv/config';
import bullmq from 'bullmq';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import axios from 'axios';
import pino from 'pino';
import Note from '../../api/src/models/note.js';
import { makeIdempotencyKey } from './utils.js';

const { Queue, Worker } = bullmq;
const logger = pino({ 
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:HH:MM:ss'
    }
  }
});

// 1. Redis Connection (with version warning suppression)
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  showFriendlyErrorStack: false, // Warnings को कम करें
  reconnectOnError: (err) => {
    logger.warn(`Redis connection error: ${err.message}`);
    return true;
  }
});

const queue = new Queue(process.env.QUEUE_NAME || 'deliveries', { 
  connection: redisConnection 
});

// 2. Enhanced MongoDB Connection
const connectToMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/droplater', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
      retryReads: true
    });
    
    logger.info('MongoDB successfully connected');
    logger.info(`MongoDB connection state: ${mongoose.connection.readyState}`);
    
    // Verify indexes
    try {
      await Note.init();
      logger.info('MongoDB indexes verified');
    } catch (err) {
      logger.warn('Index verification warning:', err);
    }
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    throw err;
  }
};

// 3. Detailed Connection Event Handlers
mongoose.connection.on('connecting', () => {
  logger.info('Attempting to establish MongoDB connection...');
});

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established successfully');
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB connection error: ${err.message}`);
});

// 4. Enhanced Polling Function
const pollAndEnqueue = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      logger.warn('MongoDB not connected, attempting reconnect...');
      await connectToMongo();
      return;
    }

    const now = new Date();
    const due = await Note.find({
      status: 'pending',
      releaseAt: { $lte: now }
    })
    .maxTimeMS(30000)
    .sort({ releaseAt: 1 })
    .limit(100)
    .lean();

    if (due.length > 0) {
      logger.info(`Found ${due.length} due notes, enqueuing...`);
      await queue.addBulk(due.map(note => ({
        name: 'deliverNote',
        data: { noteId: note._id.toString() },
        opts: {
          jobId: note._id.toString(),
          removeOnComplete: true,
          removeOnFail: 500,
          attempts: 3,
          backoff: { 
            type: 'exponential',
            delay: 1000
          }
        }
      })));
    }
  } catch (err) {
    logger.error(`Polling error: ${err.message}`);
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
};

// 5. Worker Initialization
const worker = new Worker(
  process.env.QUEUE_NAME || 'deliveries',
  async job => {
    // ... (पहले जैसा ही worker लॉजिक)
  },
  {
    connection: redisConnection,
    settings: {
      backoffStrategies: {
        exponential: (attemptsMade) => Math.min(1000 * Math.pow(2, attemptsMade), 30000)
      }
    }
  }
);

// 6. Application Startup
(async () => {
  try {
    logger.info('Starting worker service...');
    await connectToMongo();
    
    // Start polling
    setInterval(pollAndEnqueue, parseInt(process.env.POLL_INTERVAL_MS || '5000', 10));
    setTimeout(pollAndEnqueue, 2000);
    
    logger.info('Worker service started successfully');
  } catch (err) {
    logger.error('Failed to start worker:', err);
    process.exit(1);
  }
})();

// 7. Graceful Shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  try {
    await worker.close();
    await queue.close();
    await redisConnection.quit();
    await mongoose.disconnect();
    logger.info('Clean shutdown completed');
    process.exit(0);
  } catch (err) {
    logger.error('Shutdown error:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);