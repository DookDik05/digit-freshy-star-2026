import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import contestantsRouter from './routes/contestants';
import { createScoreRouter } from './routes/scores';

const app = express();
const httpServer = createServer(app);

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const PORT = process.env.PORT || 3001;

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new SocketServer(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiter — max 60 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please slow down.' },
});
app.use('/api', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/contestants', contestantsRouter);
app.use('/api/scores', createScoreRouter(io));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('[Error]', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 DIGIT FRESHY STAR 2026 Backend`);
  console.log(`   Listening on http://localhost:${PORT}`);
  console.log(`   Socket.IO enabled`);
  console.log(`   CORS allowed from: ${FRONTEND_ORIGIN}\n`);
});

export default app;
