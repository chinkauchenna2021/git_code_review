export const APP_CONFIG = {
  name: 'DevTeams Copilot',
  description: 'AI-powered code review for development teams',
  version: '1.0.0',
  supportEmail: 'support@devteamscopilot.com',
  github: {
    appName: process.env.GITHUB_APP_NAME || 'devteams-copilot',
    scopes: ['repo', 'read:user', 'user:email', 'admin:repo_hook']
  },
  ai: {
    maxTokens: 2000,
    temperature: 0.3,
    model: 'gpt-4'
  },
  limits: {
    free: { reviews: 50, repos: 1 },
    pro: { reviews: 500, repos: 10 },
    team: { reviews: -1, repos: -1 }
  }
}

export const WEBHOOK_EVENTS = [
  'pull_request',
  'pull_request_review', 
  'push',
  'installation',
  'installation_repositories'
]

export const SUPPORTED_LANGUAGES = [
  'TypeScript',
  'JavaScript', 
  'Python',
  'Java',
  'Go',
  'Rust',
  'C++',
  'C#',
  'Ruby',
  'PHP'
]