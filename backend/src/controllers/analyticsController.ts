import { Request, Response } from 'express';
import Event from '../models/Event';

export const getOverview = async (req: Request, res: Response) => {
  try {
    const totalEvents = await Event.countDocuments();
    
    // Aggregate sessions
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: "$sessionId",
          firstSeen: { $min: "$timestamp" },
          lastSeen: { $max: "$timestamp" },
          eventCount: { $sum: 1 },
          events: { $push: "$eventType" }
        }
      },
      {
        $project: {
          duration: { $subtract: ["$lastSeen", "$firstSeen"] },
          isBounce: { $cond: [{ $eq: ["$eventCount", 1] }, 1, 0] },
          eventCount: 1
        }
      }
    ]);

    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((acc, curr) => acc + curr.duration, 0);
    const avgSessionDuration = totalSessions > 0 ? Math.round(totalDuration / totalSessions) : 0;
    
    const bounces = sessions.filter(s => s.isBounce).length;
    const bounceRate = totalSessions > 0 ? Math.round((bounces / totalSessions) * 100) : 0;
    
    const totalEventCountSum = sessions.reduce((acc, curr) => acc + curr.eventCount, 0);
    const avgEventsPerSession = totalSessions > 0 ? +(totalEventCountSum / totalSessions).toFixed(1) : 0;

    // Trend data (last 7 days grouped by day)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const trendData = await Event.aggregate([
      { $match: { timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          events: { $sum: 1 },
          sessions: { $addToSet: "$sessionId" }
        }
      },
      {
        $project: {
          date: "$_id",
          events: 1,
          sessions: { $size: "$sessions" },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.status(200).json({
      totalSessions,
      totalEvents,
      avgSessionDuration,
      bounceRate,
      avgEventsPerSession,
      trendData
    });
  } catch (error) {
    console.error('Error fetching overview:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, sort = 'lastSeen', order = 'desc', search = '' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const sortField = String(sort);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Initial match for search
    const matchStage: any = {};
    if (search) {
      matchStage["sessionId"] = { $regex: search, $options: 'i' };
    }

    const aggregationPipeline: any[] = [
      { $match: matchStage },
      {
        $group: {
          _id: "$sessionId",
          firstSeen: { $min: "$timestamp" },
          lastSeen: { $max: "$timestamp" },
          totalEvents: { $sum: 1 },
          device: { $first: "$metadata.device" },
          browser: { $first: "$metadata.browser" },
          os: { $first: "$metadata.os" }
        }
      },
      {
        $project: {
          sessionId: "$_id",
          firstSeen: 1,
          lastSeen: 1,
          duration: { $subtract: ["$lastSeen", "$firstSeen"] },
          totalEvents: 1,
          device: 1,
          browser: 1,
          os: 1,
          _id: 0
        }
      },
      { $sort: { [sortField]: sortOrder } }
    ];

    // Get total count before pagination
    const totalCountPipeline = [...aggregationPipeline, { $count: "total" }];
    const countResult = await Event.aggregate(totalCountPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    aggregationPipeline.push({ $skip: skip }, { $limit: Number(limit) });

    const sessions = await Event.aggregate(aggregationPipeline);

    res.status(200).json({
      data: sessions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const events = await Event.find({ sessionId: id }).sort({ timestamp: 1 });
    
    if (!events.length) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getHeatmap = async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    const query: any = { eventType: 'click', 'coordinates.x': { $exists: true } };
    if (url) {
      query.pageUrl = url;
    }

    const clicks = await Event.find(query, { 'coordinates': 1, pageUrl: 1, _id: 0 });
    res.status(200).json(clicks);
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getTopPages = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 5;
    
    const topPages = await Event.aggregate([
      { $match: { eventType: 'page_view' } },
      {
        $group: {
          _id: "$pageUrl",
          views: { $sum: 1 }
        }
      },
      {
        $project: {
          pageUrl: "$_id",
          views: 1,
          _id: 0
        }
      },
      { $sort: { views: -1 } },
      { $limit: limit }
    ]);

    res.status(200).json(topPages);
  } catch (error) {
    console.error('Error fetching top pages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getRecentActivity = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 20;
    
    const recent = await Event.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('sessionId eventType pageUrl timestamp coordinates metadata -_id');
      
    res.status(200).json(recent);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getFunnelAnalytics = async (req: Request, res: Response) => {
  try {
    // Basic funnel: /home -> /products -> /cart -> /checkout
    const steps = ['/home', '/products', '/cart', '/checkout'];
    
    // For each step, count unique sessions that visited that page
    const results: { step: number; pageUrl: string; count: number }[] = [];
    
    for (let i = 0; i < steps.length; i++) {
      const page = steps[i];
      const uniqueSessions = await Event.distinct('sessionId', { pageUrl: page });
      results.push({
        step: i + 1,
        pageUrl: page,
        count: uniqueSessions.length
      });
    }

    // Calculate drop-offs
    const maxCount = results[0].count || 1;
    const funnelWithPercentages = results.map((step, index) => {
      return {
        ...step,
        percentage: Math.round((step.count / maxCount) * 100),
        dropoff: index > 0 ? results[index - 1].count - step.count : 0
      };
    });

    res.status(200).json(funnelWithPercentages);
  } catch (error) {
    console.error('Error fetching funnel analytics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getInsights = async (req: Request, res: Response) => {
  try {
    const insights: string[] = [];

    // 1. Most dropped-off page
    const steps = ['/home', '/products', '/cart', '/checkout'];
    const funnelCounts: { page: string; count: number }[] = [];
    for (const page of steps) {
      const uniqueSessions = await Event.distinct('sessionId', { pageUrl: page });
      funnelCounts.push({ page, count: uniqueSessions.length });
    }
    
    let highestDropoffPage = null;
    let highestDropoffPercent = 0;
    
    for(let i=0; i<funnelCounts.length - 1; i++) {
        const current = funnelCounts[i].count;
        const next = funnelCounts[i+1].count;
        if(current > 0) {
            const dropoffPercent = ((current - next) / current) * 100;
            if(dropoffPercent > highestDropoffPercent) {
                highestDropoffPercent = dropoffPercent;
                highestDropoffPage = funnelCounts[i].page;
            }
        }
    }
    if (highestDropoffPage) {
      insights.push(`Most users drop off on the ${highestDropoffPage} page (${Math.round(highestDropoffPercent)}% bounce).`);
    }

    // 2. Highest traffic page
    const topPages = await Event.aggregate([
      { $match: { eventType: 'page_view' } },
      { $group: { _id: "$pageUrl", views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 1 }
    ]);
    
    if (topPages.length > 0) {
        const totalPVs = await Event.countDocuments({eventType: 'page_view'});
        const percent = Math.round((topPages[0].views / totalPVs) * 100);
        insights.push(`The ${topPages[0]._id} page receives ${percent}% of all traffic.`);
    }

    // 3. Overall average journey length
    const totalSessions = (await Event.distinct('sessionId')).length;
    const totalEvents = await Event.countDocuments();
    if(totalSessions > 0) {
        insights.push(`Users perform an average of ${Math.round(totalEvents / totalSessions)} actions per session.`);
    }

    res.status(200).json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
