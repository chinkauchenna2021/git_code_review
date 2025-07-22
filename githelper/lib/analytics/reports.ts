
import { redis } from '../cache/redis';
import { logger } from '../utils/logger';
import * as queries from '@/lib/db/queries/analytics';
import { 
  getAnalyticsOverview,
  getReviewTrends,
  getLanguageUsage,
  getUserEngagement,
  getRepositoryActivity,
  getFinancialAnalytics,
  getPerformanceMetrics,
  Timeframe
} from '@/lib/db/queries/analytics';


// =======================================
// REPORT TYPE DEFINITIONS
// =======================================

export interface ReportMetadata {
  generatedAt: Date;
  timeframe: Timeframe;
  source: 'cache' | 'live';
}

export interface OverviewReport {
  metadata: ReportMetadata;
  data: Awaited<ReturnType<typeof getAnalyticsOverview>>;
}

export interface ReviewTrendsReport {
  metadata: ReportMetadata;
  data: Awaited<ReturnType<typeof getReviewTrends>>;
}

export interface LanguageUsageReport {
  metadata: ReportMetadata;
  data: Awaited<ReturnType<typeof getLanguageUsage>>;
}

export interface UserEngagementReport {
  metadata: ReportMetadata;
  data: Awaited<ReturnType<typeof getUserEngagement>>;
}

export interface RepositoryActivityReport {
  metadata: ReportMetadata;
  data: Awaited<ReturnType<typeof getRepositoryActivity>>;
}

export interface FinancialReport {
  metadata: ReportMetadata;
  data: Awaited<ReturnType<typeof getFinancialAnalytics>>;
}

export interface PerformanceReport {
  metadata: ReportMetadata;
  data: Awaited<ReturnType<typeof getPerformanceMetrics>>;
}

export interface CombinedReport {
  overview: OverviewReport;
  reviews: ReviewTrendsReport;
  languages: LanguageUsageReport;
  users: UserEngagementReport;
  repositories: RepositoryActivityReport;
  financials: FinancialReport;
  performance: PerformanceReport;
}

// =======================================
// REPORT GENERATOR CLASS
// =======================================

/**
 * Handles the generation, caching, and retrieval of analytics reports.
 */
export class ReportGenerator {
  private static CACHE_TTL_SECONDS = 3600; // 1 hour

  /**
   * Generates a specific type of report, utilizing cache if available.
   * @param reportType The type of report to generate.
   * @param timeframe The timeframe for the report data.
   * @param forceFresh Skips cache and generates a fresh report if true.
   * @returns The generated report.
   */
  private static async generate<T>(
    reportType: keyof typeof queries,
    timeframe: Timeframe,
    forceFresh: boolean = false
  ): Promise<T> {
    const cacheKey = `report:${reportType.toString()}:${timeframe}`;

    if (!forceFresh) {
      try {
        const cachedReport = await redis.get(cacheKey);
        if (cachedReport) {
          logger.info(`Serving report from cache: ${cacheKey}`);
          const report = JSON.parse(cachedReport);
          report.metadata.source = 'cache';
          return report as T;
        }
      } catch (error) {
        logger.error('Error fetching report from cache', error as Error, { cacheKey });
      }
    }

    logger.info(`Generating fresh report: ${reportType.toString()}:${timeframe}`);
    
    const queryFunction = queries[reportType];
    if (typeof queryFunction !== 'function') {
      throw new Error(`Invalid report type specified: ${reportType.toString()}`);
    }

    const data = await queryFunction(timeframe);

    const report = {
      metadata: {
        generatedAt: new Date(),
        timeframe,
        source: 'live',
      },
      data,
    };

    try {
      await redis.set(cacheKey, JSON.stringify(report), this.CACHE_TTL_SECONDS);
    } catch (error) {
      logger.error('Error saving report to cache', error as Error, { cacheKey });
    }

    return report as T;
  }

  // =======================================
  // PUBLIC REPORTING METHODS
  // =======================================

  static getOverviewReport(timeframe: Timeframe, forceFresh?: boolean): Promise<OverviewReport> {
    return this.generate<OverviewReport>('getAnalyticsOverview', timeframe, forceFresh);
  }

  static getReviewTrendsReport(timeframe: Timeframe, forceFresh?: boolean): Promise<ReviewTrendsReport> {
    return this.generate<ReviewTrendsReport>('getReviewTrends', timeframe, forceFresh);
  }

  static getLanguageUsageReport(timeframe: Timeframe, forceFresh?: boolean): Promise<LanguageUsageReport> {
    return this.generate<LanguageUsageReport>('getLanguageUsage', timeframe, forceFresh);
  }

  static getUserEngagementReport(timeframe: Timeframe, forceFresh?: boolean): Promise<UserEngagementReport> {
    return this.generate<UserEngagementReport>('getUserEngagement', timeframe, forceFresh);
  }

  static getRepositoryActivityReport(timeframe: Timeframe, forceFresh?: boolean): Promise<RepositoryActivityReport> {
    return this.generate<RepositoryActivityReport>('getRepositoryActivity', timeframe, forceFresh);
  }

  static getFinancialReport(timeframe: Timeframe, forceFresh?: boolean): Promise<FinancialReport> {
    return this.generate<FinancialReport>('getFinancialAnalytics', timeframe, forceFresh);
  }

  static getPerformanceReport(timeframe: Timeframe, forceFresh?: boolean): Promise<PerformanceReport> {
    return this.generate<PerformanceReport>('getPerformanceMetrics', timeframe, forceFresh);
  }

  /**
   * Generates a comprehensive report including all major analytics sections.
   * @param timeframe The timeframe for the report data.
   * @param forceFresh Skips cache for all sub-reports if true.
   * @returns A combined report object.
   */
  static async getCombinedReport(timeframe: Timeframe, forceFresh: boolean = false): Promise<CombinedReport> {
    logger.info(`Generating combined report for timeframe: ${timeframe}`);
    
    const [
      overview,
      reviews,
      languages,
      users,
      repositories,
      financials,
      performance,
    ] = await Promise.all([
      this.getOverviewReport(timeframe, forceFresh),
      this.getReviewTrendsReport(timeframe, forceFresh),
      this.getLanguageUsageReport(timeframe, forceFresh),
      this.getUserEngagementReport(timeframe, forceFresh),
      this.getRepositoryActivityReport(timeframe, forceFresh),
      this.getFinancialReport(timeframe, forceFresh),
      this.getPerformanceReport(timeframe, forceFresh),
    ]);

    return {
      overview,
      reviews,
      languages,
      users,
      repositories,
      financials,
      performance,
    };
  }

  // =======================================
  // UTILITY & EXPORT METHODS
  // =======================================

  /**
   * Invalidates the cache for a specific report or all reports.
   * @param reportType Optional. The specific report to invalidate.
   * @param timeframe Optional. The specific timeframe to invalidate.
   */
  static async invalidateCache(reportType?: keyof typeof queries, timeframe?: Timeframe): Promise<void> {
    try {
      if (reportType && timeframe) {
        const cacheKey = `report:${reportType.toString()}:${timeframe}`;
        logger.warn(`Invalidating cache for: ${cacheKey}`);
        await redis.del(cacheKey);
      } else {
        logger.warn('Invalidating all report caches.');
        // Since your Redis client doesn't expose keys method, we'll invalidate known patterns
        const reportTypes = ['getAnalyticsOverview', 'getReviewTrends', 'getLanguageUsage', 
                            'getUserEngagement', 'getRepositoryActivity', 'getFinancialAnalytics', 'getPerformanceMetrics'];
        const timeframes: Timeframe[] = ['24h', '7d', '30d', '90d', '1y'];
        
        for (const type of reportTypes) {
          for (const tf of timeframes) {
            const cacheKey = `report:${type}:${tf}`;
            try {
              await redis.del(cacheKey);
            } catch (error) {
              // Continue with other keys if one fails
              logger.debug(`Failed to delete cache key: ${cacheKey}`, error as Error);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error invalidating cache', error as Error, { reportType, timeframe });
      throw error;
    }
  }

  /**
   * Exports a report to a specified format.
   * @param report The report object to export.
   * @param format The desired format ('json' or 'csv').
   * @returns The report formatted as a string.
   */
  static async exportReport(
    report: any,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    if (format === 'csv') {
      if (!report.data || !Array.isArray(report.data) || report.data.length === 0) {
        logger.warn('Cannot export to CSV: report data is empty or not an array.');
        return '';
      }
      const headers = Object.keys(report.data[0]).join(',');
      const rows = report.data.map((row: { [s: string]: unknown; } | ArrayLike<unknown>) =>
        Object.values(row)
          .map(value => (typeof value === 'string' ? `"${value}"` : value))
          .join(',')
      );
      return `${headers}\n${rows.join('\n')}`;
    }

    throw new Error(`Unsupported export format: ${format}`);
  }
}

// Example of how to schedule report generation (e.g., using a cron job library like node-cron)
/*
import cron from 'node-cron';

// Schedule a daily combined report generation to warm the cache
cron.schedule('0 1 * * *', () => {
  logger.info('Running scheduled daily report generation...');
  ReportGenerator.getCombinedReport('24h', true)
    .then(() => logger.info('Daily report cache warmed successfully.'))
    .catch(error => logger.error('Scheduled report generation failed.', error));
});
*/
