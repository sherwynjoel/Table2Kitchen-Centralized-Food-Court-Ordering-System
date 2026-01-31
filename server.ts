import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: "*", // Allow all for local network dev
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a kitchen room
    socket.on('join-kitchen', (kitchenId) => {
      console.log(`Socket ${socket.id} joining kitchen-${kitchenId}`);
      socket.join(`kitchen-${kitchenId}`);
    });

    // New Order placed (Customer -> Server -> Kitchen)
    socket.on('new-order', (data) => {
      // data should contain kitchenId and order details
      // In a real app, successful DB save triggers this via API, 
      // but for simplicity client can emit too or server emit after API call.
      // Here we assume server-side API triggers specific room events.
      // Broadcast to specific kitchen room
      // Ideally we fetch the order again to get details, or trust client data for notification (with validation)
      // For this MVP, we just ping the room to refetch.
      // We know the kitchen IDs from the order, but let's assume client sends kitchenId or we rely on 'new-order-kitchen-ID' pattern
      // Actually, let's just emit to all kitchens for simplicity or refine this.
      // Real approach: 
      // socket.to(`kitchen-${kitchenId}`).emit('new-order');

      // MVP: Client (Cart) emits this event. 
      // But since Cart doesn't know ALL kitchen IDs easily without parsing, let's just use a broadcast to all kitchens "check-orders"
      // OR better: The client emits 'new-order' with { orderId, table }. 
      // We can just emit to all connected clients "new-order". Kitchens verify if they have items.
      io.emit('check-new-orders');
    });

    socket.on('order-update', (data) => {
      // Kitchen -> Customer
      io.emit(`order-update-${data.orderId}`, data);
    });

    socket.on('call-staff', (data) => {
      console.log(`Table ${data.table} is calling staff`);
      io.emit('staff-alert', { table: data.table });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Make io available in express request (optional, for API routes)
  server.use((req: any, res, next) => {
    req.io = io;
    next();
  });

  server.all(/(.*)/, (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3000;
  httpServer.listen(PORT, () => {
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
