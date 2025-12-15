import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { prisma } from '@/lib/prisma';

let io: SocketIOServer | null = null;

export const initSocketServer = (httpServer: HTTPServer) => {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-chat', async (chatId: string) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat ${chatId}`);
    });

    socket.on('leave-chat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`User ${socket.id} left chat ${chatId}`);
    });

    socket.on('send-message', async (data: {
      chatId: string;
      senderId: string;
      receiverId?: string;
      content: string;
      type?: string;
    }) => {
      try {
        const message = await prisma.chatMessage.create({
          data: {
            chatId: data.chatId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
            type: (data.type as any) || 'TEXT',
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        });

        io?.to(data.chatId).emit('new-message', message);
        
        await prisma.chat.update({
          where: { id: data.chatId },
          data: { updatedAt: new Date() },
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (data: { chatId: string; userId: string }) => {
      socket.to(data.chatId).emit('user-typing', { userId: data.userId });
    });

    socket.on('stop-typing', (data: { chatId: string; userId: string }) => {
      socket.to(data.chatId).emit('user-stop-typing', { userId: data.userId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getSocketServer = () => io;
