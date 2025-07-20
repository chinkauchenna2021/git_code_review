export const securityPrompts = {
  comprehensive: `You are a security expert conducting a thorough security audit of this code.

Analyze for these critical security issues:

1. **Injection Vulnerabilities**:
   - SQL injection (direct queries, ORM misuse)
   - NoSQL injection
   - Command injection
   - LDAP injection

2. **Authentication & Authorization**:
   - Weak authentication mechanisms
   - Missing authorization checks
   - Privilege escalation vulnerabilities
   - Session management issues

3. **Data Security**:
   - Sensitive data exposure
   - Improper encryption/hashing
   - Data leakage in logs/errors
   - PII handling violations

4. **Input Validation**:
   - Unvalidated user input
   - Buffer overflows
   - Path traversal
   - File upload vulnerabilities

5. **Cryptographic Issues**:
   - Weak algorithms (MD5, SHA1)
   - Hard-coded secrets
   - Poor random number generation
   - Certificate validation issues

Code to analyze:
{code}

Return detailed security findings in JSON:
{
  "securityScore": 1-10,
  "criticalVulnerabilities": [
    {
      "type": "sql_injection|xss|csrf|auth|crypto|data_exposure",
      "severity": "critical|high|medium|low",
      "file": "filename",
      "line": 0,
      "description": "Detailed vulnerability description",
      "impact": "Potential security impact",
      "remediation": "How to fix this issue",
      "cwe": "CWE-XXX if applicable"
    }
  ],
  "recommendations": [
    "Security best practice recommendations"
  ]
}`,

  webSecurity: `Focus on web application security vulnerabilities:

{code}

Check specifically for:
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Clickjacking vulnerabilities
- CORS misconfigurations
- Content Security Policy issues
- HTTP security headers

Return web security analysis in JSON format.`,

  apiSecurity: `Analyze API security vulnerabilities:

{code}

Focus on:
- API authentication bypass
- Rate limiting issues
- Input validation failures
- Information disclosure
- Business logic flaws
- OWASP API Top 10 issues

Return API security findings in JSON format.`
}
