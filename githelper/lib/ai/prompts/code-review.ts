export const codeReviewPrompts = {
  general: `You are an expert code reviewer. Analyze the following code changes and provide:

1. **Critical Issues**: Security vulnerabilities, bugs, performance problems
2. **Best Practices**: Code style, patterns, maintainability suggestions  
3. **Improvements**: Optimization opportunities and refactoring suggestions
4. **Positive Feedback**: What was done well

Code Changes:
{code}

Repository Context:
- Language: {language}
- Framework: {framework}
- Project Type: {projectType}

Provide your review in this JSON format:
{
  "overallScore": 1-10,
  "summary": "Brief overview",
  "issues": [
    {
      "type": "security|bug|performance|style",
      "severity": "critical|high|medium|low", 
      "file": "filename",
      "line": 0,
      "message": "Description",
      "suggestion": "How to fix"
    }
  ],
  "suggestions": [
    {
      "type": "improvement|optimization|refactor",
      "file": "filename", 
      "message": "Suggestion",
      "example": "Code example if applicable"
    }
  ],
  "positives": ["Things done well"]
}`,

  security: `Focus specifically on security vulnerabilities in this code:

{code}

Look for:
- SQL injection vulnerabilities
- XSS vulnerabilities  
- Authentication/authorization issues
- Data exposure risks
- Input validation problems
- Crypto/encryption issues

Return only security-related findings in JSON format.`,

  performance: `Analyze this code for performance issues:

{code}

Focus on:
- Algorithm efficiency
- Memory usage
- Database query optimization
- Caching opportunities
- Resource management
- Scalability concerns

Return performance analysis in JSON format.`
}

