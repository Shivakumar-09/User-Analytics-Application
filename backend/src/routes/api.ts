import { Router } from 'express';
import { trackEvent } from '../controllers/eventsController';
import { getOverview, getSessions, getSessionById, getHeatmap, getTopPages, getRecentActivity, getFunnelAnalytics, getInsights } from '../controllers/analyticsController';

const router = Router();

// Tracking
router.post('/events', trackEvent);

// Analytics Dashboard
router.get('/analytics/overview', getOverview);
router.get('/analytics/top-pages', getTopPages);
router.get('/analytics/recent', getRecentActivity);
router.get('/analytics/funnels', getFunnelAnalytics);
router.get('/analytics/insights', getInsights);
router.get('/sessions', getSessions);
router.get('/sessions/:id', getSessionById);
router.get('/heatmap', getHeatmap);

export default router;
