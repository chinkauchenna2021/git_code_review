export const bestPracticesPrompts = {
  comprehensive: `You are a senior software architect reviewing code for best practices and maintainability.

Code to review:
{code}

Language: {language}
Framework: {framework}
Project Type: {projectType}

Evaluate these areas:

1. **Code Quality**:
   - SOLID principles adherence
   - DRY (Don't Repeat Yourself)
   - KISS (Keep It Simple, Stupid)
   - Separation of concerns
   - Single responsibility principle

2. **Architecture Patterns**:
   - Design pattern usage
   - Architectural consistency
   - Modularity and coupling
   - Dependency injection
   - Error handling patterns

3. **Maintainability**:
   - Code readability
   - Documentation quality
   - Naming conventions
   - Code organization
   - Test coverage opportunities

4. **Language-Specific Best Practices**:
   - Idiomatic code usage
   - Framework conventions
   - Performance patterns
   - Security best practices

Return analysis in JSON:
{
  "qualityScore": 1-10,
  "strengths": [
    "Things done well in the code"
  ],
  "improvements": [
    {
      "category": "architecture|patterns|maintainability|idioms",
      "priority": "high|medium|low",
      "file": "filename",
      "description": "What needs improvement",
      "suggestion": "How to improve",
      "example": "Code example if helpful"
    }
  ],
  "recommendations": [
    "Overall architectural recommendations"
  ]
}`,

  typescript: `Focus on TypeScript-specific best practices:

{code}

Evaluate:
- Type safety usage
- Generic type patterns
- Interface vs type usage
- Utility type opportunities
- Error handling with types

Return TypeScript best practices analysis.`,

  react: `Analyze React best practices:

{code}

Focus on:
- Component design patterns
- Hook usage patterns
- State management
- Performance optimizations
- Accessibility considerations

Return React best practices analysis.`
}
