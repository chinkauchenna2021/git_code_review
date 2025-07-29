'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { 
  GitBranch, 
  GitPullRequest, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Play, 
  Settings, 
  Plus, 
  RefreshCw, 
  Download, 
  ExternalLink,
  Terminal,
  Database,
  Activity,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  TrendingUp,
  BarChart3,
  Code2,
  Bug,
  Zap,
  Target,
  Users,
  Star,
  Lock,
  Unlock,
  ChevronRight,
  ChevronDown,
  Copy,
  X,
  Check,
  Info,
  Webhook
} from 'lucide-react';

// Type Definitions based on your existing schema
interface Repository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  private: boolean;
  language: string | null;
  defaultBranch: string;
  isActive: boolean;
  webhookId: string | null;
  createdAt: string;
  updatedAt: string;
  reviewCount?: number;
  averageScore?: number;
}

interface Review {
  id: string;
  repositoryId: string;
  pullRequestNumber: number;
  pullRequestId: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  aiAnalysis: AIAnalysis | null;
  createdAt: string;
  updatedAt: string;
  repository: {
    name: string;
    fullName: string;
    language: string | null;
  };
}

interface AIAnalysis {
  overallScore: number;
  summary: string;
  issues: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    message: string;
    file: string;
    line: number;
    suggestion?: string;
    cweId?: string;
  }>;
  suggestions: Array<{
    type: string;
    message: string;
    file: string;
  }>;
  confidence: number;
  language: string;
  processingTime?: number;
  tokensUsed?: number;
}

// UI Components with professional styling
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  onClick,
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
      )}
      {children}
    </button>
  );
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}> = ({ children, variant = 'default', size = 'md' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800', 
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-violet-100 text-violet-800'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs'
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizes[size]}`} />
  );
};

// Repository Management Interface
const RepositoryManager: React.FC = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [addingRepo, setAddingRepo] = useState(false);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/repositories');
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      setRepositories(data.repositories || []);
    } catch (error) {
      console.error('Repository fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addRepository = async () => {
    if (!newRepoUrl.trim()) return;
    
    setAddingRepo(true);
    try {
      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          githubUrl: newRepoUrl,
          isActive: true,
          reviewSettings: {
            autoReview: true,
            requireApproval: false,
            minScore: 7,
            blockOnCritical: true,
            reviewOnPush: true,
            excludePatterns: ['*.md', '*.txt', 'docs/*']
          }
        })
      });

      if (!response.ok) throw new Error('Failed to add repository');
      
      setNewRepoUrl('');
      setShowAddModal(false);
      fetchRepositories();
    } catch (error) {
      console.error('Add repository error:', error);
    } finally {
      setAddingRepo(false);
    }
  };

  const toggleRepository = async (repoId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/repositories/${repoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        setRepositories(prev => 
          prev.map(repo => 
            repo.id === repoId ? { ...repo, isActive: !isActive } : repo
          )
        );
      }
    } catch (error) {
      console.error('Toggle repository error:', error);
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Repository Management</h2>
          <p className="text-sm text-gray-600 mt-1">Connect and manage your code repositories</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Repository
        </Button>
      </div>

      {showAddModal && (
        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center space-x-3">
            <input
              type="url"
              placeholder="https://github.com/username/repository"
              value={newRepoUrl}
              onChange={(e) => setNewRepoUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            />
            <Button onClick={addRepository} loading={addingRepo} disabled={!newRepoUrl.trim()}>
              Add Repository
            </Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {repositories.map((repo) => (
          <Card key={repo.id} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{repo.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">{repo.fullName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {repo.private && <Lock className="h-4 w-4 text-gray-400" />}
                <button
                  onClick={() => toggleRepository(repo.id, repo.isActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    repo.isActive ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    repo.isActive ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <Badge variant={repo.isActive ? 'success' : 'default'}>
                  {repo.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Reviews</span>
                <span className="font-medium text-gray-900">{repo.reviewCount || 0}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Score</span>
                <span className="font-medium text-gray-900">
                  {repo.averageScore ? `${repo.averageScore.toFixed(1)}/10` : 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Language</span>
                <span className="font-medium text-gray-900">{repo.language || 'Multiple'}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Webhook</span>
                <Badge variant={repo.webhookId ? 'success' : 'danger'}>
                  {repo.webhookId ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>

            <div className="mt-4 flex space-x-2">
              <Button variant="outline" size="sm" className="flex-1">
                <Terminal className="h-3 w-3 mr-1" />
                Analyze
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </Card>
        ))}
        
        {repositories.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Database className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No repositories connected</h3>
            <p className="text-gray-600 mb-4">Connect your first repository to start AI-powered code reviews</p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Repository
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// AI PR Analysis Component
const AIAnalysisPanel: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    setupWebSocketConnection();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews');
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Reviews fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocketConnection = () => {
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/ws`
      : 'ws://localhost:3001/ws';
    
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'review_progress':
          updateReviewProgress(data.reviewId, data.progress);
          break;
        case 'review_completed':
          fetchReviews();
          break;
      }
    };

    return () => ws.close();
  };

  const updateReviewProgress = (reviewId: string, progress: any) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === reviewId 
          ? { ...review, progress: progress.progress, currentStep: progress.currentStep }
          : review
      )
    );
  };

  const startAnalysis = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/ai/analyze/${reviewId}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to start analysis');
      
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { ...review, status: 'IN_PROGRESS' as const }
            : review
        )
      );
    } catch (error) {
      console.error('Analysis start error:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'FAILED': return 'danger';
      case 'PENDING': return 'info';
      default: return 'default';
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true;
    if (filter === 'pending') return review.status === 'PENDING' || review.status === 'IN_PROGRESS';
    if (filter === 'completed') return review.status === 'COMPLETED';
    if (filter === 'failed') return review.status === 'FAILED';
    return true;
  });

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">AI Code Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Monitor and analyze pull requests with AI</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <Button variant="outline" onClick={fetchReviews}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="p-6 border border-gray-200">
            <div 
              className="cursor-pointer"
              onClick={() => setExpandedReview(
                expandedReview === review.id ? null : review.id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <GitPullRequest className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      PR #{review.pullRequestNumber}
                    </h3>
                    <p className="text-sm text-gray-600">{review.repository.fullName}</p>
                  </div>
                  <Badge variant={getStatusColor(review.status)}>
                    {review.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-3">
                  {review.aiAnalysis && (
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{review.aiAnalysis.overallScore}/10</span>
                      </div>
                      {review.aiAnalysis.issues?.filter(i => i.severity === 'critical').length > 0 && (
                        <div className="flex items-center space-x-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>{review.aiAnalysis.issues.filter(i => i.severity === 'critical').length}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {review.status === 'PENDING' && (
                    <Button 
                      size="sm"
                      onClick={() => {
                        startAnalysis(review.id);
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Analyze
                    </Button>
                  )}
                  
                  {expandedReview === review.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {review.status === 'IN_PROGRESS' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Analyzing code...</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {expandedReview === review.id && review.aiAnalysis && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Analysis Summary</h4>
                    <p className="text-sm text-gray-600 mb-4">{review.aiAnalysis.summary}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Overall Score</span>
                        <span className="font-medium">{review.aiAnalysis.overallScore}/10</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Confidence</span>
                        <span className="font-medium">{review.aiAnalysis.confidence}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Language</span>
                        <span className="font-medium">{review.aiAnalysis.language}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Issues Found</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {review.aiAnalysis.issues.slice(0, 8).map((issue, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Badge variant={getSeverityColor(issue.severity)} size="sm">
                            {issue.severity}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{issue.message}</p>
                            <p className="text-xs text-gray-500 font-mono mt-1">
                              {issue.file}:{issue.line}
                            </p>
                            {issue.suggestion && (
                              <p className="text-xs text-blue-600 mt-2">
                                💡 {issue.suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {review.aiAnalysis.issues.length > 8 && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          +{review.aiAnalysis.issues.length - 8} more issues
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {review.aiAnalysis.suggestions.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Improvement Suggestions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {review.aiAnalysis.suggestions.slice(0, 4).map((suggestion, idx) => (
                        <div key={idx} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-900">{suggestion.message}</p>
                            <p className="text-xs text-gray-500 font-mono mt-1">{suggestion.file}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Analyzed {new Date(review.updatedAt).toLocaleString()}</span>
                    {review.aiAnalysis.processingTime && (
                      <span>Processed in {review.aiAnalysis.processingTime}ms</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-3 w-3 mr-1" />
                    Export Report
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <Code2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">Pull requests will appear here for AI analysis</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Activity Visualization Component
const ActivityDashboard: React.FC = () => {
  const [activityData, setActivityData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState('24h');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
    setupRealtimeUpdates();
  }, [timeRange]);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dashboard/overview?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setActivityData(data);
      }
    } catch (error) {
      console.error('Activity data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? `wss://${window.location.host}/ws`
      : 'ws://localhost:3001/ws';
    
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'activity_update') {
        setActivityData((prev: any) => prev ? {
          ...prev,
          recentActivity: [data.activity, ...prev.recentActivity.slice(0, 9)]
        } : null);
      }
    };

    return () => ws.close();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review_completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'critical_issue': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'repository_connected': return <GitBranch className="h-4 w-4 text-blue-600" />;
      case 'team_update': return <Users className="h-4 w-4 text-violet-600" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Activity Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Activity Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Real-time development activity and metrics</p>
          </div>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {activityData?.stats?.totalReviews || 0}
            </div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              {activityData?.stats?.completedReviews || 0}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-3xl font-bold text-red-600 mb-1">
            {activityData?.stats?.criticalIssues || 0}
          </div>
          <div className="text-sm text-gray-600">Critical Issues</div>
          <div className="text-center">
            <div className="text-3xl font-bold text-violet-600 mb-1">
              {activityData?.stats?.averageScore ? `${activityData.stats.averageScore.toFixed(1)}` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
        </div>

        {/* Activity Chart Placeholder */}
        <div className="h-64 bg-gradient-to-br from-blue-50 to-violet-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Activity Visualization</p>
            <p className="text-sm text-gray-500">Real-time charts and graphs will be rendered here</p>
          </div>
        </div>
      </Card>

      {/* Live Activity Feed */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500">Live</span>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {(activityData?.recentActivity || [
            {
              type: 'review_completed',
              title: 'PR #123 analysis completed',
              description: 'Found 2 critical issues and 5 suggestions',
              timestamp: new Date(Date.now() - 120000).toISOString(),
              repository: 'main-app'
            },
            {
              type: 'critical_issue',
              title: 'Critical vulnerability detected',
              description: 'SQL injection vulnerability in user authentication',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              repository: 'api-service',
              severity: 'critical'
            },
            {
              type: 'repository_connected',
              title: 'New repository connected',
              description: 'Successfully connected and configured webhooks',
              timestamp: new Date(Date.now() - 600000).toISOString(),
              repository: 'frontend-v2'
            },
            {
              type: 'team_update',
              title: 'Team member added',
              description: 'New developer joined the code review team',
              timestamp: new Date(Date.now() - 900000).toISOString()
            }
          ]).map((activity: any, index: number) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                    )}
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(activity.timestamp)}
                      </span>
                      {activity.repository && (
                        <Badge variant="info" size="sm">
                          {activity.repository}
                        </Badge>
                      )}
                      {activity.severity && (
                        <Badge variant={activity.severity === 'critical' ? 'danger' : 'warning'} size="sm">
                          {activity.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {activity.actionUrl && (
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// Notification System Component
const NotificationSystem: React.FC = () => {
  const [settings, setSettings] = useState({
    email: {
      reviewCompleted: true,
      criticalIssues: true,
      weeklyReports: true,
      teamUpdates: true
    },
    slack: {
      enabled: false,
      webhookUrl: '',
      channelId: ''
    },
    discord: {
      enabled: false,
      webhookUrl: ''
    },
    whatsapp: {
      enabled: false,
      phoneNumber: ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | null>>({});

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Notification settings fetch error:', error);
    }
  };

  const updateSettings = async (updates: any) => {
    setSaving(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        setSettings(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Update settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  const testNotification = async (type: string) => {
    setTesting(prev => ({ ...prev, [type]: true }));
    try {
      const response = await fetch(`/api/notifications/test/${type}`, {
        method: 'POST'
      });
      
      setTestResults(prev => ({ 
        ...prev, 
        [type]: response.ok ? 'success' : 'error' 
      }));
      
      setTimeout(() => {
        setTestResults(prev => ({ ...prev, [type]: null }));
      }, 3000);
    } catch (error) {
      console.error('Test notification error:', error);
      setTestResults(prev => ({ ...prev, [type]: 'error' }));
    } finally {
      setTesting(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
        <p className="text-sm text-gray-600 mt-1">Configure how you receive updates about your code reviews</p>
      </div>
      
      <div className="space-y-8">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
          </div>
          <div className="space-y-3 ml-8">
            {Object.entries(settings.email).map(([key, enabled]) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => updateSettings({
                    email: { ...settings.email, [key]: e.target.checked }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-sm text-gray-700">
                  {key === 'reviewCompleted' && 'Pull request review completed'}
                  {key === 'criticalIssues' && 'Critical security issues detected'}
                  {key === 'weeklyReports' && 'Weekly summary reports'}
                  {key === 'teamUpdates' && 'Team activity updates'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Slack Integration */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Slack Integration</h3>
            </div>
            <div className="flex items-center space-x-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.slack.enabled}
                  onChange={(e) => updateSettings({
                    slack: { ...settings.slack, enabled: e.target.checked }
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              {settings.slack.enabled && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testNotification('slack')}
                    loading={testing.slack}
                  >
                    Test
                  </Button>
                  {testResults.slack === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {testResults.slack === 'error' && (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                </div>
              )}
            </div>
          </div>
          {settings.slack.enabled && (
            <div className="ml-8 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.slack.webhookUrl}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    slack: { ...prev.slack, webhookUrl: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Channel ID (optional)
                </label>
                <input
                  type="text"
                  placeholder="#code-reviews"
                  value={settings.slack.channelId}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    slack: { ...prev.slack, channelId: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Integration */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-gray-900">WhatsApp Notifications</h3>
              <Badge variant="purple" size="sm">Premium</Badge>
            </div>
            <label className="relative inline-flex items-center cursor-pointer opacity-50">
              <input
                type="checkbox"
                checked={settings.whatsapp?.enabled || false}
                disabled
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          <div className="ml-8">
            <p className="text-sm text-gray-500">
              WhatsApp notifications are available in our Premium plan with advanced business messaging features.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <Button onClick={() => updateSettings(settings)} loading={saving}>
            Save All Settings
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Main Dashboard Component
const Playground: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'repositories', label: 'Repositories', icon: GitBranch },
    { id: 'analysis', label: 'AI Analysis', icon: Code2 },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter']">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">CodeGuard AI</h1>
                  <p className="text-xs text-gray-500">Code Review Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email || 'User'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            Monitor your repositories, analyze pull requests, and maintain code quality with AI-powered insights.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RepositoryManager />
                <AIAnalysisPanel />
              </div>
              <ActivityDashboard />
            </div>
          )}
          {activeTab === 'repositories' && <RepositoryManager />}
          {activeTab === 'analysis' && <AIAnalysisPanel />}
          {activeTab === 'activity' && <ActivityDashboard />}
          {activeTab === 'notifications' && <NotificationSystem />}
        </div>
      </div>
    </div>
  );
};

export default Playground;