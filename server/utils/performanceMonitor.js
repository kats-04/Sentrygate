import os from 'os';
// import { performance } from 'perf_hooks';

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      memory: [],
      cpu: [],
      requests: [],
      database: [],
      errors: [],
    };
    this.startTime = Date.now();
  }

  recordMemoryUsage() {
    const usage = process.memoryUsage();
    const metric = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed / 1024 / 1024, // MB
      heapTotal: usage.heapTotal / 1024 / 1024, // MB
      external: usage.external / 1024 / 1024, // MB
      rss: usage.rss / 1024 / 1024, // MB
    };
    this.metrics.memory.push(metric);
    return metric;
  }

  recordCpuUsage() {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((sum, cpu) => sum + cpu.times.idle, 0);
    const totalTick = cpus.reduce((sum, cpu) => sum + Object.values(cpu.times).reduce((s, t) => s + t), 0);

    const metric = {
      timestamp: Date.now(),
      cpuCount: cpus.length,
      idle: totalIdle,
      total: totalTick,
      usage: `${((totalTick - totalIdle) / totalTick * 100).toFixed(2)}%`,
    };
    this.metrics.cpu.push(metric);
    return metric;
  }

  recordRequest(method, path, statusCode, duration) {
    const metric = {
      timestamp: Date.now(),
      method,
      path,
      statusCode,
      duration,
    };
    this.metrics.requests.push(metric);
  }

  recordDatabaseQuery(query, duration, success) {
    const metric = {
      timestamp: Date.now(),
      query: query.substring(0, 100),
      duration,
      success,
    };
    this.metrics.database.push(metric);
  }

  recordError(error, path, method) {
    const metric = {
      timestamp: Date.now(),
      error: error.message,
      path,
      method,
      stack: error.stack,
    };
    this.metrics.errors.push(metric);
  }

  getSystemHealth() {
    const uptime = (Date.now() - this.startTime) / 1000; // seconds
    const latestMemory = this.metrics.memory[this.metrics.memory.length - 1] || {};
    const latestCpu = this.metrics.cpu[this.metrics.cpu.length - 1] || {};

    return {
      uptime: Math.floor(uptime),
      memory: latestMemory,
      cpu: latestCpu,
      totalRequests: this.metrics.requests.length,
      totalErrors: this.metrics.errors.length,
      errorRate: `${(this.metrics.errors.length / this.metrics.requests.length * 100).toFixed(2)}%`,
    };
  }

  getAverageResponseTime() {
    if (this.metrics.requests.length === 0) return 0;
    const total = this.metrics.requests.reduce((sum, req) => sum + req.duration, 0);
    return (total / this.metrics.requests.length).toFixed(2);
  }

  getAverageDatabaseQueryTime() {
    if (this.metrics.database.length === 0) return 0;
    const total = this.metrics.database.reduce((sum, query) => sum + query.duration, 0);
    return (total / this.metrics.database.length).toFixed(2);
  }

  getTopSlowRequests(limit = 10) {
    return this.metrics.requests
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
      .map(req => ({
        ...req,
        duration: `${req.duration.toFixed(2)}ms`,
      }));
  }

  getErrorBreakdown() {
    const breakdown = {};
    this.metrics.errors.forEach(error => {
      const key = error.error;
      breakdown[key] = (breakdown[key] || 0) + 1;
    });
    return breakdown;
  }

  getRequestBreakdown() {
    const breakdown = {};
    this.metrics.requests.forEach(req => {
      const key = `${req.method} ${req.path}`;
      if (!breakdown[key]) {
        breakdown[key] = { count: 0, totalDuration: 0, errors: 0 };
      }
      breakdown[key].count += 1;
      breakdown[key].totalDuration += req.duration;
      if (req.statusCode >= 400) {
        breakdown[key].errors += 1;
      }
    });

    return Object.entries(breakdown).map(([path, stats]) => ({
      path,
      count: stats.count,
      avgDuration: `${(stats.totalDuration / stats.count).toFixed(2)}ms`,
      errorRate: `${((stats.errors / stats.count) * 100).toFixed(2)}%`,
    }));
  }

  generateReport() {
    return {
      timestamp: new Date().toISOString(),
      systemHealth: this.getSystemHealth(),
      performance: {
        avgResponseTime: `${this.getAverageResponseTime()}ms`,
        avgDatabaseQueryTime: `${this.getAverageDatabaseQueryTime()}ms`,
        slowRequests: this.getTopSlowRequests(5),
      },
      errors: {
        breakdown: this.getErrorBreakdown(),
        total: this.metrics.errors.length,
      },
      requests: {
        breakdown: this.getRequestBreakdown(),
        total: this.metrics.requests.length,
      },
    };
  }

  pruneOldMetrics(olderThanMs = 60 * 60 * 1000) {
    const cutoff = Date.now() - olderThanMs;
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = this.metrics[key].filter(m => m.timestamp > cutoff);
    });
  }

  reset() {
    this.metrics = {
      memory: [],
      cpu: [],
      requests: [],
      database: [],
      errors: [],
    };
    this.startTime = Date.now();
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Periodic cleanup (every hour)
setInterval(() => {
  performanceMonitor.pruneOldMetrics(24 * 60 * 60 * 1000); // Keep 24 hours
}, 60 * 60 * 1000);

// Periodic system health logging (every 5 minutes)
setInterval(() => {
  const health = performanceMonitor.getSystemHealth();
  console.log(`[Performance] Memory: ${health.memory.heapUsed?.toFixed(2)}MB / ${health.memory.heapTotal?.toFixed(2)}MB, Requests: ${health.totalRequests}, Errors: ${health.totalErrors}`);
}, 5 * 60 * 1000);

export default performanceMonitor;
