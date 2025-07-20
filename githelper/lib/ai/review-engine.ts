import { TypeScriptAnalyzer } from './analyzers/typescript'
import { SecurityAnalyzer } from './analyzers/security'
import { GitHubAPI } from '../github/api'

export interface ReviewContext {
  files: any[]
  prData: any
  repository: {
    language: string | null
    name: string
  }
}

export interface ReviewResult {
  overallScore: number
  summary: string
  issues: any[]
  suggestions: any[]
  security: any
  language?: string
  confidence: number
}

export async function analyzePullRequest(context: ReviewContext): Promise<ReviewResult> {
  const { files, repository } = context
  
  // Initialize analyzers
  const tsAnalyzer = new TypeScriptAnalyzer()
  const securityAnalyzer = new SecurityAnalyzer()
  
  // Run analyses in parallel
  const [tsAnalysis, securityAnalysis] = await Promise.all([
    tsAnalyzer.analyze(files, { projectType: 'Web Application' }),
    securityAnalyzer.analyze(files)
  ])

  // Combine results
  const result: ReviewResult = {
    overallScore: calculateOverallScore(tsAnalysis, securityAnalysis),
    summary: generateSummary(tsAnalysis, securityAnalysis),
    issues: combineIssues(tsAnalysis, securityAnalysis),
    suggestions: combineSuggestions(tsAnalysis, securityAnalysis),
    security: securityAnalysis,
    language: repository.language || 'Unknown',
    confidence: calculateConfidence(files.length, repository.language)
  }

  return result
}

function calculateOverallScore(tsAnalysis: any, securityAnalysis: any): number {
  const tsScore = tsAnalysis?.overallScore || 5
  const securityScore = securityAnalysis?.securityScore || 5
  
  // Weighted average: 60% general analysis, 40% security
  return Math.round((tsScore * 0.6 + securityScore * 0.4) * 10) / 10
}

function generateSummary(tsAnalysis: any, securityAnalysis: any): string {
  const issues = (tsAnalysis?.issues || []).length + (securityAnalysis?.issues || []).length
  const criticalIssues = [...(tsAnalysis?.issues || []), ...(securityAnalysis?.issues || [])]
    .filter(issue => issue.severity === 'critical').length

  if (criticalIssues > 0) {
    return `⚠️ Found ${criticalIssues} critical issue(s) that need immediate attention. Total: ${issues} issues found.`
  } else if (issues > 5) {
    return `📋 Code review completed. Found ${issues} issues to address for better code quality.`
  } else if (issues > 0) {
    return `✅ Good code overall! Found ${issues} minor issue(s) for improvement.`
  } else {
    return `🎉 Excellent code! No significant issues found.`
  }
}

function combineIssues(tsAnalysis: any, securityAnalysis: any): any[] {
  const issues = [
    ...(tsAnalysis?.issues || []),
    ...(securityAnalysis?.issues || [])
  ]
  
  // Sort by severity: critical, high, medium, low
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  return issues.sort((a, b) => 
    (severityOrder[a.severity as keyof typeof severityOrder] || 4) - 
    (severityOrder[b.severity as keyof typeof severityOrder] || 4)
  )
}

function combineSuggestions(tsAnalysis: any, securityAnalysis: any): any[] {
  return [
    ...(tsAnalysis?.suggestions || []),
    ...(securityAnalysis?.suggestions || [])
  ]
}

function calculateConfidence(fileCount: number, language: string | null): number {
  let confidence = 70 // Base confidence
  
  // More files = higher confidence
  if (fileCount > 10) confidence += 20
  else if (fileCount > 5) confidence += 10
  else if (fileCount < 2) confidence -= 20
  
  // Known languages = higher confidence
  if (['TypeScript', 'JavaScript', 'Python', 'Java'].includes(language || '')) {
    confidence += 10
  }
  
  return Math.min(100, Math.max(30, confidence))
}
