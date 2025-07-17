const express = require('express');
const performanceMonitor = require('../services/performanceMonitor');
const router = express.Router();

// Get overall performance metrics
router.get('/metrics', async (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get detailed query metrics
router.get('/query-metrics', async (req, res) => {
  try {
    const metrics = performanceMonitor.getQueryMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get slow queries
router.get('/slow-queries', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const slowQueries = performanceMonitor.getSlowQueries(parseInt(limit));
    res.json({
      success: true,
      data: slowQueries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get database statistics
router.get('/database-stats', async (req, res) => {
  try {
    const stats = await performanceMonitor.getDatabaseStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get Redis statistics
router.get('/redis-stats', async (req, res) => {
  try {
    const stats = await performanceMonitor.getRedisStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get query execution plan
router.post('/query-plan', async (req, res) => {
  try {
    const { collection, query, options = {} } = req.body;
    
    if (!collection || !query) {
      return res.status(400).json({
        success: false,
        error: 'Collection and query are required'
      });
    }

    const plan = await performanceMonitor.getQueryPlans(collection, query, options);
    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get comprehensive health check
router.get('/health', async (req, res) => {
  try {
    const health = await performanceMonitor.getHealthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reset performance metrics
router.post('/reset', async (req, res) => {
  try {
    performanceMonitor.resetMetrics();
    res.json({
      success: true,
      message: 'Performance metrics reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get memory usage
router.get('/memory', async (req, res) => {
  try {
    const memory = performanceMonitor.getMemoryUsage();
    res.json({
      success: true,
      data: memory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;