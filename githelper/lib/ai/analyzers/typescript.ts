import { AIService } from '../openai'
import { codeReviewPrompts } from '../prompts/code-review'

export class TypeScriptAnalyzer {
  private ai = new AIService()

  async analyze(files: any[], context: any) {
    const tsFiles = files.filter(f => 
      f.filename.endsWith('.ts') || f.filename.endsWith('.tsx')
    )

    if (tsFiles.length === 0) return null

    const codeContent = this.formatFilesForAnalysis(tsFiles)
    
    const prompt = codeReviewPrompts.general
      .replace('{code}', codeContent)
      .replace('{language}', 'TypeScript')
      .replace('{framework}', this.detectFramework(tsFiles))
      .replace('{projectType}', context.projectType || 'Web Application')

    const analysis = await this.ai.generateCompletion(prompt, 2000)
    
    try {
      return JSON.parse(analysis)
    } catch (error) {
      console.error('Failed to parse TS analysis:', error)
      return { error: 'Failed to parse analysis', rawResponse: analysis }
    }
  }

  private formatFilesForAnalysis(files: any[]): string {
    return files.map(file => `
## File: ${file.filename}
\`\`\`typescript
${file.patch || file.content || ''}
\`\`\`
`).join('\n')
  }

  private detectFramework(files: any[]): string {
    const content = files.map(f => f.filename + (f.patch || '')).join(' ')
    
    if (content.includes('next') || content.includes('Next')) return 'Next.js'
    if (content.includes('react') || content.includes('React')) return 'React'
    if (content.includes('vue') || content.includes('Vue')) return 'Vue.js'
    if (content.includes('angular') || content.includes('Angular')) return 'Angular'
    if (content.includes('express') || content.includes('Express')) return 'Express.js'
    
    return 'TypeScript'
  }
}