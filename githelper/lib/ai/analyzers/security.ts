import { AIService } from '../openai'
import { codeReviewPrompts } from '../prompts/code-review'

export class SecurityAnalyzer {
  private ai = new AIService()

  async analyze(files: any[]) {
    const securityPatterns = this.detectSecurityPatterns(files)
    
    if (securityPatterns.length === 0) {
      return { securityScore: 10, issues: [], suggestions: [] }
    }

    const codeContent = this.formatSecurityConcerns(files, securityPatterns)
    const prompt = codeReviewPrompts.security.replace('{code}', codeContent)
    
    const analysis = await this.ai.generateCompletion(prompt, 1500)
    
    try {
      const parsed = JSON.parse(analysis)
      return {
        securityScore: this.calculateSecurityScore(parsed.issues || []),
        issues: parsed.issues || [],
        suggestions: parsed.suggestions || []
      }
    } catch (error) {
      console.error('Failed to parse security analysis:', error)
      return { securityScore: 5, issues: [], suggestions: [], error: 'Parse failed' }
    }
  }

  private detectSecurityPatterns(files: any[]): string[] {
    const patterns: string[] = []
    const content = files.map(f => f.patch || f.content || '').join('\n')

    // SQL patterns
    if (content.match(/\$\{.*\}.*SELECT|INSERT|UPDATE|DELETE/i)) {
      patterns.push('potential-sql-injection')
    }

    // XSS patterns  
    if (content.match(/innerHTML|dangerouslySetInnerHTML|document\.write/i)) {
      patterns.push('potential-xss')
    }

    // Auth patterns
    if (content.match(/password|token|secret|key/i) && content.match(/=|:|console\.log/i)) {
      patterns.push('potential-credential-exposure')
    }

    // File upload patterns
    if (content.match(/multer|upload|file/i)) {
      patterns.push('file-upload-security')
    }

    return patterns
  }

  private formatSecurityConcerns(files: any[], patterns: string[]): string {
    return `
Security Patterns Detected: ${patterns.join(', ')}

Code to Review:
${files.map(file => `
## ${file.filename}
\`\`\`
${file.patch || file.content || ''}
\`\`\`
`).join('\n')}
`
  }

  private calculateSecurityScore(issues: any[]): number {
    if (issues.length === 0) return 10
    
    const severityWeights = { critical: -4, high: -2, medium: -1, low: -0.5 }
    const deduction = issues.reduce((sum, issue) => 
      sum + (severityWeights[issue.severity as keyof typeof severityWeights] || -1), 0
    )
    
    return Math.max(1, 10 + deduction)
  }
}
