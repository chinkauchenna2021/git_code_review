import { AIService } from '../openai'
import { bestPracticesPrompts } from '../prompts/best-practices'
import { performancePrompts } from '../prompts/performance'

export class ReactAnalyzer {
  private ai = new AIService()

  async analyze(files: any[], context: any) {
    const reactFiles = files.filter(f => 
      f.filename.endsWith('.jsx') || 
      f.filename.endsWith('.tsx') ||
      this.containsReactCode(f.patch || f.content || '')
    )

    if (reactFiles.length === 0) return null

    const codeContent = this.formatFilesForAnalysis(reactFiles)
    
    const [bestPracticesAnalysis, performanceAnalysis] = await Promise.all([
      this.getBestPracticesAnalysis(codeContent),
      this.getPerformanceAnalysis(codeContent)
    ])

    return this.combineAnalyses(bestPracticesAnalysis, performanceAnalysis)
  }

  private containsReactCode(content: string): boolean {
    return /import.*react|from ['"]react['"]|jsx|tsx|useState|useEffect/i.test(content)
  }

  private async getBestPracticesAnalysis(code: string) {
    const prompt = bestPracticesPrompts.react.replace('{code}', code)
    return this.parseResponse(await this.ai.generateCompletion(prompt, 1500))
  }

  private async getPerformanceAnalysis(code: string) {
    const prompt = performancePrompts.frontend.replace('{code}', code)
    return this.parseResponse(await this.ai.generateCompletion(prompt, 1500))
  }

  private formatFilesForAnalysis(files: any[]): string {
    return files.map(file => `
## File: ${file.filename}
\`\`\`tsx
${file.patch || file.content || ''}
\`\`\`
`).join('\n')
  }

  private parseResponse(response: string) {
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse React analysis:', error)
      return { error: 'Failed to parse analysis', rawResponse: response }
    }
  }

  private combineAnalyses(bestPractices: any, performance: any) {
    return {
      overallScore: Math.round(((bestPractices?.qualityScore || 5) + (performance?.performanceScore || 5)) / 2 * 10) / 10,
      summary: 'React component analysis completed',
      issues: [
        ...(bestPractices?.improvements || []),
        ...(performance?.issues || [])
      ],
      suggestions: [
        ...(bestPractices?.recommendations || []),
        ...(performance?.recommendations || [])
      ],
      strengths: bestPractices?.strengths || [],
      performance: performance,
      language: 'React'
    }
  }
}
