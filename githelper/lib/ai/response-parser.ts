export class ResponseParser {
  static parseAIResponse(response: string): any {
    try {
      // Try to parse as JSON first
      return JSON.parse(response)
    } catch (error) {
      // If JSON parsing fails, try to extract JSON from markdown
      return this.extractJSONFromMarkdown(response)
    }
  }

  private static extractJSONFromMarkdown(response: string): any {
    try {
      // Look for JSON code blocks
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/i)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }

      // Look for any JSON-like structure
      const jsonLikeMatch = response.match(/\{[\s\S]*\}/i)
      if (jsonLikeMatch) {
        return JSON.parse(jsonLikeMatch[0])
      }

      // Fallback: create structured response from text
      return this.createStructuredResponse(response)
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      return {
        error: 'Failed to parse AI response',
        rawResponse: response,
        overallScore: 5,
        summary: 'Analysis completed but parsing failed',
        issues: [],
        suggestions: []
      }
    }
  }

  private static createStructuredResponse(response: string): any {
    const lines = response.split('\n').filter(line => line.trim())
    
    return {
      overallScore: this.extractScore(response),
      summary: this.extractSummary(lines),
      issues: this.extractIssues(lines),
      suggestions: this.extractSuggestions(lines),
      rawResponse: response
    }
  }

  private static extractScore(response: string): number {
    const scoreMatch = response.match(/score[:\s]*(\d+(?:\.\d+)?)/i)
    return scoreMatch ? parseFloat(scoreMatch[1]) : 5
  }

  private static extractSummary(lines: string[]): string {
    const summaryLine = lines.find(line => 
      line.toLowerCase().includes('summary') || 
      line.toLowerCase().includes('overview')
    )
    return summaryLine || 'Analysis completed'
  }

  private static extractIssues(lines: string[]): any[] {
    const issues = []
    let inIssuesSection = false

    for (const line of lines) {
      if (line.toLowerCase().includes('issue') || line.toLowerCase().includes('problem')) {
        inIssuesSection = true
        continue
      }
      
      if (inIssuesSection && line.startsWith('-')) {
        issues.push({
          type: 'general',
          severity: 'medium',
          message: line.replace(/^-\s*/, ''),
          file: 'unknown',
          line: 0
        })
      }
    }

    return issues
  }

  private static extractSuggestions(lines: string[]): any[] {
    const suggestions = []
    let inSuggestionsSection = false

    for (const line of lines) {
      if (line.toLowerCase().includes('suggest') || line.toLowerCase().includes('recommend')) {
        inSuggestionsSection = true
        continue
      }
      
      if (inSuggestionsSection && line.startsWith('-')) {
        suggestions.push({
          type: 'improvement',
          message: line.replace(/^-\s*/, ''),
          file: 'general'
        })
      }
    }

    return suggestions
  }
}
