import prisma  from '../client';

// =======================================
// TYPE DEFINITIONS
// =======================================

export type Timeframe = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

export interface AnalyticsOverview {
  totalUsers: number;
  activeUsers: number;
  totalRepositories: number;
  activeRepositories: number;
  totalReviews: number;
  averageScore: number;
  totalIssuesFound: number;
  criticalIssues: number;
  subscriptionRevenue: number;
  growthRate: number;
}

export interface ReviewTrend {
  date: string;
  reviewCount: number;
  averageScore: number;
  totalIssues: number;
  criticalIssues: number;
  processingTime: number;
}

export interface LanguageUsage {
  language: string;
  repositoryCount: number;
  reviewCount: number;
  averageScore: number;
  issueCount: number;
  popularityRank: number;
}

export interface UserEngagement {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  averageSessionLength: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  churnRate: number;
}

export interface RepositoryActivity {
  totalRepositories: number;
  activeRepositories: number;
  newRepositories: number;
  archivedRepositories: number;
  averageReviewsPerRepo: number;
  mostActiveRepositories: Array<{
    id: string;
    name: string;
    fullName: string;
    reviewCount: number;
    language: string;
  }>;
}

export interface FinancialAnalytics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  newSubscriptions: number;
  cancelledSubscriptions: number;
  churnRate: number;
  subscriptionsByPlan: Array<{
    plan: string;
    count: number;
    revenue: number;
  }>;
}

export interface PerformanceMetrics {
  averageReviewTime: number;
  successRate: number;
  errorRate: number;
  apiLatency: number;
  systemUptime: number;
  tokensUsed: number;
  costPerReview: number;
}

// =======================================
// UTILITY FUNCTIONS
// =======================================

/**
 * Converts timeframe to date range
 */
function getDateRange(timeframe: Timeframe): { startDate: Date; endDate: Date } {
  const now = new Date();
  const endDate = new Date(now);
  let startDate: Date;

  switch (timeframe) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    case 'all':
    default:
      startDate = new Date('2020-01-01'); // App launch date
      break;
  }

  return { startDate, endDate };
}

/**
 * Extracts numeric value from AI analysis JSON
 */
function extractNumericValue(jsonPath: string, defaultValue: number = 0): any {
  return prisma.sql`COALESCE(CAST(JSON_EXTRACT(aiAnalysis, ${jsonPath}) AS DECIMAL(10,2)), ${defaultValue})`;
}
/**
 * Gets previous period for comparison
 */
function getPreviousPeriod(timeframe: Timeframe): { startDate: Date; endDate: Date } {
  const current = getDateRange(timeframe);
  const duration = current.endDate.getTime() - current.startDate.getTime();
  
  return {
    startDate: new Date(current.startDate.getTime() - duration),
    endDate: current.startDate
  };
}

// =======================================
// ANALYTICS QUERY FUNCTIONS
// =======================================

/**
 * Gets comprehensive analytics overview
 */
export async function getAnalyticsOverview(timeframe: Timeframe): Promise<AnalyticsOverview> {
  const { startDate, endDate } = getDateRange(timeframe);
  const { startDate: prevStartDate, endDate: prevEndDate } = getPreviousPeriod(timeframe);

  const [
    userStats,
    repoStats,
    reviewStats,
    subscriptionStats,
    prevReviewStats
  ] = await Promise.all([
    // User statistics
    prisma.$queryRaw<Array<{ total: number; active: number }>>`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN lastReviewAt >= ${startDate} THEN 1 END) as active
      FROM users
      WHERE createdAt <= ${endDate}
    `,
    
    // Repository statistics
    prisma.$queryRaw<Array<{ total: number; active: number }>>`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN isActive = true THEN 1 END) as active
      FROM repositories
      WHERE createdAt <= ${endDate}
    `,
    
    // Review statistics
    prisma.$queryRaw<Array<{
      total: number;
      avgScore: number;
      totalIssues: number;
      criticalIssues: number;
    }>>`
      SELECT 
        COUNT(*) as total,
        AVG(${extractNumericValue('$.overallScore', 0)}) as avgScore,
        SUM(JSON_LENGTH(JSON_EXTRACT(aiAnalysis, '$.issues'))) as totalIssues,
        COUNT(CASE WHEN JSON_EXTRACT(aiAnalysis, '$.severity') = 'critical' THEN 1 END) as criticalIssues
      FROM reviews
      WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
        AND aiAnalysis IS NOT NULL
    `,
    
    // Subscription revenue
    prisma.$queryRaw<Array<{ revenue: number }>>`
      SELECT 
        SUM(CASE 
          WHEN plan = 'PRO' THEN 29.00
          WHEN plan = 'ENTERPRISE' THEN 99.00
          ELSE 0
        END) as revenue
      FROM subscriptions s
      JOIN users u ON s.userId = u.id
      WHERE s.status = 'ACTIVE' 
        AND s.currentPeriodStart >= ${startDate}
        AND s.currentPeriodStart <= ${endDate}
    `,
    
    // Previous period reviews for growth calculation
    prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COUNT(*) as total
      FROM reviews
      WHERE createdAt >= ${prevStartDate} AND createdAt <= ${prevEndDate}
    `
  ]);

  const currentReviews = reviewStats[0]?.total || 0;
  const previousReviews = prevReviewStats[0]?.total || 0;
  const growthRate = previousReviews > 0 
    ? ((currentReviews - previousReviews) / previousReviews) * 100 
    : 0;

  return {
    totalUsers: userStats[0]?.total || 0,
    activeUsers: userStats[0]?.active || 0,
    totalRepositories: repoStats[0]?.total || 0,
    activeRepositories: repoStats[0]?.active || 0,
    totalReviews: currentReviews,
    averageScore: Number(reviewStats[0]?.avgScore || 0),
    totalIssuesFound: Number(reviewStats[0]?.totalIssues || 0),
    criticalIssues: reviewStats[0]?.criticalIssues || 0,
    subscriptionRevenue: Number(subscriptionStats[0]?.revenue || 0),
    growthRate: Number(growthRate.toFixed(2))
  };
}

/**
 * Gets review trends over time
 */
export async function getReviewTrends(timeframe: Timeframe): Promise<ReviewTrend[]> {
  const { startDate, endDate } = getDateRange(timeframe);
  
  const dateFormat = timeframe === '24h' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d';
  
  const trends = await prisma.$queryRaw<ReviewTrend[]>`
    SELECT 
      DATE_FORMAT(createdAt, ${dateFormat}) as date,
      COUNT(*) as reviewCount,
      AVG(${extractNumericValue('$.overallScore', 0)}) as averageScore,
      SUM(JSON_LENGTH(JSON_EXTRACT(aiAnalysis, '$.issues'))) as totalIssues,
      COUNT(CASE WHEN JSON_EXTRACT(aiAnalysis, '$.severity') = 'critical' THEN 1 END) as criticalIssues,
      AVG(${extractNumericValue('$.processingTimeMs', 0)}) as processingTime
    FROM reviews
    WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
      AND aiAnalysis IS NOT NULL
    GROUP BY DATE_FORMAT(createdAt, ${dateFormat})
    ORDER BY date ASC
  `;

  return trends.map((trend: { averageScore: any; totalIssues: any; criticalIssues: any; processingTime: any; }) => ({
    ...trend,
    averageScore: Number(trend.averageScore || 0),
    totalIssues: Number(trend.totalIssues || 0),
    criticalIssues: Number(trend.criticalIssues || 0),
    processingTime: Number(trend.processingTime || 0)
  }));
}

/**
 * Gets programming language usage statistics
 */
export async function getLanguageUsage(timeframe: Timeframe): Promise<LanguageUsage[]> {
  const { startDate, endDate } = getDateRange(timeframe);

  const languages = await prisma.$queryRaw<Array<{
    language: string;
    repositoryCount: number;
    reviewCount: number;
    averageScore: number;
    issueCount: number;
  }>>`
    SELECT 
      r.language,
      COUNT(DISTINCT r.id) as repositoryCount,
      COUNT(rev.id) as reviewCount,
      AVG(${extractNumericValue('$.overallScore', 0)}) as averageScore,
      SUM(JSON_LENGTH(JSON_EXTRACT(rev.aiAnalysis, '$.issues'))) as issueCount
    FROM repositories r
    LEFT JOIN reviews rev ON r.id = rev.repositoryId 
      AND rev.createdAt >= ${startDate} AND rev.createdAt <= ${endDate}
      AND rev.aiAnalysis IS NOT NULL
    WHERE r.language IS NOT NULL
      AND r.createdAt <= ${endDate}
    GROUP BY r.language
    HAVING reviewCount > 0
    ORDER BY reviewCount DESC
  `;

  return languages.map((lang: { language: any; repositoryCount: any; reviewCount: any; averageScore: any; issueCount: any; }, index: number) => ({
    language: lang.language,
    repositoryCount: Number(lang.repositoryCount || 0),
    reviewCount: Number(lang.reviewCount || 0),
    averageScore: Number(lang.averageScore || 0),
    issueCount: Number(lang.issueCount || 0),
    popularityRank: index + 1
  }));
}

/**
 * Gets user engagement metrics
 */
export async function getUserEngagement(timeframe: Timeframe): Promise<UserEngagement> {
  const { startDate, endDate } = getDateRange(timeframe);
  const { startDate: prevStartDate } = getPreviousPeriod(timeframe);

  const [engagement, churnData] = await Promise.all([
    prisma.$queryRaw<Array<{
      totalUsers: number;
      activeUsers: number;
      newUsers: number;
      returningUsers: number;
      dailyActiveUsers: number;
      weeklyActiveUsers: number;
      monthlyActiveUsers: number;
    }>>`
      SELECT 
        COUNT(DISTINCT u.id) as totalUsers,
        COUNT(DISTINCT CASE WHEN u.lastReviewAt >= ${startDate} THEN u.id END) as activeUsers,
        COUNT(DISTINCT CASE WHEN u.createdAt >= ${startDate} THEN u.id END) as newUsers,
        COUNT(DISTINCT CASE WHEN u.createdAt < ${startDate} AND u.lastReviewAt >= ${startDate} THEN u.id END) as returningUsers,
        COUNT(DISTINCT CASE WHEN u.lastReviewAt >= DATE_SUB(${endDate}, INTERVAL 1 DAY) THEN u.id END) as dailyActiveUsers,
        COUNT(DISTINCT CASE WHEN u.lastReviewAt >= DATE_SUB(${endDate}, INTERVAL 7 DAY) THEN u.id END) as weeklyActiveUsers,
        COUNT(DISTINCT CASE WHEN u.lastReviewAt >= DATE_SUB(${endDate}, INTERVAL 30 DAY) THEN u.id END) as monthlyActiveUsers
      FROM users u
      WHERE u.createdAt <= ${endDate}
    `,
    
    prisma.$queryRaw<Array<{ churned: number; total: number }>>`
      SELECT 
        COUNT(CASE WHEN s.status = 'CANCELLED' AND s.cancelledAt >= ${startDate} THEN 1 END) as churned,
        COUNT(*) as total
      FROM subscriptions s
      WHERE s.createdAt <= ${endDate}
    `
  ]);

  const stats = engagement[0];
  const churn = churnData[0];
  const churnRate = churn?.total > 0 ? (churn.churned / churn.total) * 100 : 0;

  return {
    totalUsers: stats?.totalUsers || 0,
    activeUsers: stats?.activeUsers || 0,
    newUsers: stats?.newUsers || 0,
    returningUsers: stats?.returningUsers || 0,
    averageSessionLength: 0, // Would need session tracking
    dailyActiveUsers: stats?.dailyActiveUsers || 0,
    weeklyActiveUsers: stats?.weeklyActiveUsers || 0,
    monthlyActiveUsers: stats?.monthlyActiveUsers || 0,
    churnRate: Number(churnRate.toFixed(2))
  };
}

/**
 * Gets repository activity metrics
 */
export async function getRepositoryActivity(timeframe: Timeframe): Promise<RepositoryActivity> {
  const { startDate, endDate } = getDateRange(timeframe);

  const [repoStats, mostActive] = await Promise.all([
    prisma.$queryRaw<Array<{
      totalRepositories: number;
      activeRepositories: number;
      newRepositories: number;
      archivedRepositories: number;
      averageReviewsPerRepo: number;
    }>>`
      SELECT 
        COUNT(*) as totalRepositories,
        COUNT(CASE WHEN isActive = true THEN 1 END) as activeRepositories,
        COUNT(CASE WHEN createdAt >= ${startDate} THEN 1 END) as newRepositories,
        COUNT(CASE WHEN isActive = false THEN 1 END) as archivedRepositories,
        AVG(reviewCount.count) as averageReviewsPerRepo
      FROM repositories r
      LEFT JOIN (
        SELECT repositoryId, COUNT(*) as count
        FROM reviews
        WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
        GROUP BY repositoryId
      ) reviewCount ON r.id = reviewCount.repositoryId
      WHERE r.createdAt <= ${endDate}
    `,
    
    prisma.$queryRaw<Array<{
      id: string;
      name: string;
      fullName: string;
      reviewCount: number;
      language: string;
    }>>`
      SELECT 
        r.id,
        r.name,
        r.fullName,
        COUNT(rev.id) as reviewCount,
        r.language
      FROM repositories r
      LEFT JOIN reviews rev ON r.id = rev.repositoryId 
        AND rev.createdAt >= ${startDate} AND rev.createdAt <= ${endDate}
      WHERE r.isActive = true
      GROUP BY r.id, r.name, r.fullName, r.language
      ORDER BY reviewCount DESC
      LIMIT 10
    `
  ]);

  const stats = repoStats[0];

  return {
    totalRepositories: stats?.totalRepositories || 0,
    activeRepositories: stats?.activeRepositories || 0,
    newRepositories: stats?.newRepositories || 0,
    archivedRepositories: stats?.archivedRepositories || 0,
    averageReviewsPerRepo: Number(stats?.averageReviewsPerRepo || 0),
    mostActiveRepositories: mostActive.map((repo: { reviewCount: any; }) => ({
      ...repo,
      reviewCount: Number(repo.reviewCount || 0)
    }))
  };
}

/**
 * Gets financial analytics
 */
export async function getFinancialAnalytics(timeframe: Timeframe): Promise<FinancialAnalytics> {
  const { startDate, endDate } = getDateRange(timeframe);

  const [financialStats, subscriptionStats] = await Promise.all([
    prisma.$queryRaw<Array<{
      totalRevenue: number;
      monthlyRecurringRevenue: number;
      averageRevenuePerUser: number;
      newSubscriptions: number;
      cancelledSubscriptions: number;
      activeSubscriptions: number;
    }>>`
      SELECT 
        SUM(CASE 
          WHEN s.plan = 'PRO' THEN 29.00
          WHEN s.plan = 'ENTERPRISE' THEN 99.00
          ELSE 0
        END) as totalRevenue,
        SUM(CASE 
          WHEN s.status = 'ACTIVE' AND s.plan = 'PRO' THEN 29.00
          WHEN s.status = 'ACTIVE' AND s.plan = 'ENTERPRISE' THEN 99.00
          ELSE 0
        END) as monthlyRecurringRevenue,
        AVG(CASE 
          WHEN s.plan = 'PRO' THEN 29.00
          WHEN s.plan = 'ENTERPRISE' THEN 99.00
          ELSE 0
        END) as averageRevenuePerUser,
        COUNT(CASE WHEN s.createdAt >= ${startDate} THEN 1 END) as newSubscriptions,
        COUNT(CASE WHEN s.status = 'CANCELLED' AND s.cancelledAt >= ${startDate} THEN 1 END) as cancelledSubscriptions,
        COUNT(CASE WHEN s.status = 'ACTIVE' THEN 1 END) as activeSubscriptions
      FROM subscriptions s
      WHERE s.createdAt <= ${endDate}
    `,
    
    prisma.$queryRaw<Array<{
      plan: string;
      count: number;
      revenue: number;
    }>>`
      SELECT 
        s.plan,
        COUNT(*) as count,
        SUM(CASE 
          WHEN s.plan = 'PRO' THEN 29.00
          WHEN s.plan = 'ENTERPRISE' THEN 99.00
          ELSE 0
        END) as revenue
      FROM subscriptions s
      WHERE s.status = 'ACTIVE'
        AND s.createdAt <= ${endDate}
      GROUP BY s.plan
    `
  ]);

  const stats = financialStats[0];
  const churnRate = stats?.activeSubscriptions > 0 
    ? (stats.cancelledSubscriptions / stats.activeSubscriptions) * 100 
    : 0;

  return {
    totalRevenue: Number(stats?.totalRevenue || 0),
    monthlyRecurringRevenue: Number(stats?.monthlyRecurringRevenue || 0),
    averageRevenuePerUser: Number(stats?.averageRevenuePerUser || 0),
    newSubscriptions: stats?.newSubscriptions || 0,
    cancelledSubscriptions: stats?.cancelledSubscriptions || 0,
    churnRate: Number(churnRate.toFixed(2)),
    subscriptionsByPlan: subscriptionStats.map((sub: { count: any; revenue: any; }) => ({
      ...sub,
      count: Number(sub.count || 0),
      revenue: Number(sub.revenue || 0)
    }))
  };
}

/**
 * Gets system performance metrics
 */
export async function getPerformanceMetrics(timeframe: Timeframe): Promise<PerformanceMetrics> {
  const { startDate, endDate } = getDateRange(timeframe);

  const [performanceStats, errorStats] = await Promise.all([
    prisma.$queryRaw<Array<{
      averageReviewTime: number;
      successfulReviews: number;
      totalReviews: number;
      totalTokens: number;
    }>>`
      SELECT 
        AVG(${extractNumericValue('$.processingTimeMs', 0)}) as averageReviewTime,
        COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as successfulReviews,
        COUNT(*) as totalReviews,
        SUM(${extractNumericValue('$.tokensUsed', 0)}) as totalTokens
      FROM reviews
      WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
    `,
    
    prisma.$queryRaw<Array<{ errorCount: number }>>`
      SELECT COUNT(*) as errorCount
      FROM audit_logs
      WHERE action = 'CREATE'
        AND entity = 'ERROR'
        AND createdAt >= ${startDate} AND createdAt <= ${endDate}
    `
  ]);

  const stats = performanceStats[0];
  const errors = errorStats[0];
  
  const successRate = stats?.totalReviews > 0 
    ? (stats.successfulReviews / stats.totalReviews) * 100 
    : 0;
  
  const errorRate = stats?.totalReviews > 0 
    ? (errors?.errorCount || 0) / stats.totalReviews * 100 
    : 0;

  const costPerReview = stats?.totalTokens > 0 
    ? (stats.totalTokens * 0.00001) / stats.successfulReviews // Estimated token cost
    : 0;

  return {
    averageReviewTime: Number(stats?.averageReviewTime || 0),
    successRate: Number(successRate.toFixed(2)),
    errorRate: Number(errorRate.toFixed(2)),
    apiLatency: 0, // Would need API monitoring
    systemUptime: 99.9, // Would need system monitoring
    tokensUsed: Number(stats?.totalTokens || 0),
    costPerReview: Number(costPerReview.toFixed(4))
  };
}


// Export as queries object for dynamic access
export const queries = {
  getAnalyticsOverview,
  getReviewTrends,
  getLanguageUsage,
  getUserEngagement,
  getRepositoryActivity,
  getFinancialAnalytics,
  getPerformanceMetrics
} as const;

export default queries;