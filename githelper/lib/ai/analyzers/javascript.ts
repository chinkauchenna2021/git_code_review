import { AIService } from '../openai'
import { codeReviewPrompts } from '../prompts/code-review'
import { performancePrompts } from '../prompts/performance'

export class JavaScriptAnalyzer {
  private ai = new AIService()

  async analyze(files: any[], context: any) {
    const jsFiles = files.filter(f => 
      f.filename.endsWith('.js') || f.filename.endsWith('.jsx')
    )

    if (jsFiles.length === 0) return null

    const codeContent = this.formatFilesForAnalysis(jsFiles)
    const framework = this.detectFramework(jsFiles)
    
    const [generalAnalysis, performanceAnalysis] = await Promise.all([
      this.getGeneralAnalysis(codeContent, framework, context),
      this.getPerformanceAnalysis(codeContent, framework)
    ])

    return this.combineAnalyses(generalAnalysis, performanceAnalysis)
  }

  private async getGeneralAnalysis(code: string, framework: string, context: any) {
    const prompt = codeReviewPrompts.general
      .replace('{code}', code)
      .replace('{language}', 'JavaScript')
      .replace('{framework}', framework)
      .replace('{projectType}', context.projectType || 'Web Application')

    const response = await this.ai.generateCompletion(prompt, 2000)
    return this.parseResponse(response)
  }

  private async getPerformanceAnalysis(code: string, framework: string) {
    const prompt = performancePrompts.comprehensive
      .replace('{code}', code)
      .replace('{language}', 'JavaScript')
      .replace('{framework}', framework)

    const response = await this.ai.generateCompletion(prompt, 1500)
    return this.parseResponse(response)
  }

  private formatFilesForAnalysis(files: any[]): string {
    return files.map(file => `
## File: ${file.filename}
\`\`\`javascript
${file.patch || file.content || ''}
\`\`\`
`).join('\n')
  }

  private detectFramework(files: any[]): string {
    const content = files.map(f => f.filename + (f.patch || '')).join(' ')
    
    if (content.includes('react') || content.includes('React')) return 'React'
    if (content.includes('vue') || content.includes('Vue')) return 'Vue.js'
    if (content.includes('angular') || content.includes('Angular')) return 'Angular'
    if (content.includes('express') || content.includes('Express')) return 'Express.js'
    if (content.includes('node') || content.includes('Node')) return 'Node.js'
    
    return 'JavaScript'
  }

  private parseResponse(response: string) {
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse JS analysis:', error)
      return { error: 'Failed to parse analysis', rawResponse: response }
    }
  }

  private combineAnalyses(general: any, performance: any) {
    return {
      overallScore: Math.round(((general?.overallScore || 5) + (performance?.performanceScore || 5)) / 2 * 10) / 10,
      summary: general?.summary || 'Analysis completed',
      issues: [
        ...(general?.issues || []),
        ...(performance?.issues || [])
      ],
      suggestions: [
        ...(general?.suggestions || []),
        ...(performance?.recommendations || [])
      ],
      performance: performance,
      language: 'JavaScript'
    }
  }
}
