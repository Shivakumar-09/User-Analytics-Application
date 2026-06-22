import { Request, Response } from 'express';
import Event from '../models/Event';
import { Server } from 'socket.io';

export const trackEvent = async (req: Request, res: Response) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];
    
    // Add server timestamp if not provided by client, though usually client sends it
    const processedEvents = events.map((event: any) => ({
      ...event,
      timestamp: event.timestamp || new Date(),
    }));

    await Event.insertMany(processedEvents);

    // Emit real-time update
    const io: Server = req.app.get('io');
    if (io) {
      io.emit('new_event', processedEvents);
    }

    res.status(200).json({ success: true, message: 'Event stored successfully' });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
