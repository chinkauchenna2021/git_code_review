export const performancePrompts = {
  comprehensive: `You are a performance optimization expert. Analyze this code for performance issues:

{code}

Language: {language}
Framework: {framework}

Analyze for:

1. **Algorithm Efficiency**:
   - Time complexity issues (O(n²) vs O(n log n))
   - Space complexity problems
   - Inefficient loops and iterations
   - Unnecessary computations

2. **Database Performance**:
   - N+1 query problems
   - Missing indexes
   - Inefficient queries
   - Connection pooling issues

3. **Memory Management**:
   - Memory leaks
   - Unnecessary object creation
   - Large object allocations
   - Garbage collection pressure

4. **Network Optimization**:
   - API call efficiency
   - Caching opportunities
   - Payload size optimization
   - Connection reuse

5. **Frontend Performance** (if applicable):
   - Bundle size issues
   - Render blocking resources
   - Unnecessary re-renders
   - Image optimization

Return performance analysis in JSON:
{
  "performanceScore": 1-10,
  "issues": [
    {
      "type": "algorithm|database|memory|network|frontend",
      "severity": "critical|high|medium|low",
      "file": "filename",
      "line": 0,
      "issue": "Description of performance issue",
      "impact": "Performance impact description",
      "optimization": "How to optimize",
      "estimatedImprovement": "Expected performance gain"
    }
  ],
  "recommendations": [
    "General performance recommendations"
  ]
}`,

  database: `Analyze database performance issues in this code:

{code}

Focus on:
- Query optimization opportunities
- Index usage analysis
- Connection management
- Transaction efficiency
- ORM performance patterns

Return database performance analysis.`,

  frontend: `Analyze frontend performance issues:

{code}

Focus on:
- Component rendering efficiency
- State management performance
- Bundle optimization
- Asset loading strategies
- Core Web Vitals impact

Return frontend performance analysis.`
}
