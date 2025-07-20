import { AIService } from '../openai'
import { codeReviewPrompts } from '../prompts/code-review'
import { securityPrompts } from '../prompts/security-scan'

export class PythonAnalyzer {
  private ai = new AIService()

  async analyze(files: any[], context: any) {
    const pyFiles = files.filter(f => f.filename.endsWith('.py'))
    if (pyFiles.length === 0) return null

    const codeContent = this.formatFilesForAnalysis(pyFiles)
    const framework = this.detectFramework(pyFiles)
    
    const [generalAnalysis, securityAnalysis] = await Promise.all([
      this.getGeneralAnalysis(codeContent, framework, context),
      this.getSecurityAnalysis(codeContent)
    ])

    return this.combineAnalyses(generalAnalysis, securityAnalysis)
  }

  private async getGeneralAnalysis(code: string, framework: string, context: any) {
    const prompt = codeReviewPrompts.general
      .replace('{code}', code)
      .replace('{language}', 'Python')
      .replace('{framework}', framework)
      .replace('{projectType}', context.projectType || 'Application')

    return this.parseResponse(await this.ai.generateCompletion(prompt, 2000))
  }

  private async getSecurityAnalysis(code: string) {
    const prompt = securityPrompts.comprehensive.replace('{code}', code)
    return this.parseResponse(await this.ai.generateCompletion(prompt, 1500))
  }

  private formatFilesForAnalysis(files: any[]): string {
    return files.map(file => `
## File: ${file.filename}
\`\`\`python
${file.patch || file.content || ''}
\`\`\`
`).join('\n')
  }

  private detectFramework(files: any[]): string {
    const content = files.map(f => f.filename + (f.patch || '')).join(' ')
    
    if (content.includes('django') || content.includes('Django')) return 'Django'
    if (content.includes('flask') || content.includes('Flask')) return 'Flask'
    if (content.includes('fastapi') || content.includes('FastAPI')) return 'FastAPI'
    if (content.includes('pandas') || content.includes('numpy')) return 'Data Science'
    
    return 'Python'
  }

  private parseResponse(response: string) {
    try {
      return JSON.parse(response)
    } catch (error) {
      console.error('Failed to parse Python analysis:', error)
      return { error: 'Failed to parse analysis', rawResponse: response }
    }
  }

  private combineAnalyses(general: any, security: any) {
    return {
      overallScore: Math.round(((general?.overallScore || 5) + (security?.securityScore || 5)) / 2 * 10) / 10,
      summary: general?.summary || 'Python analysis completed',
      issues: [
        ...(general?.issues || []),
        ...(security?.criticalVulnerabilities || [])
      ],
      suggestions: [
        ...(general?.suggestions || []),
        ...(security?.recommendations || [])
      ],
      security: security,
      language: 'Python'
    }
  }
}