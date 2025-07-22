import { useAppStore } from "../slices";

export const useIntegrations = () => useAppStore((state: { githubInstallations: any; webhookStatus: any; apiKeys: any; fetchGitHubInstallations: any; installGitHubApp: any; removeGitHubInstallation: any; createAPIKey: any; revokeAPIKey: any; testWebhook: any; }) => ({
  githubInstallations: state.githubInstallations,
  webhookStatus: state.webhookStatus,
  apiKeys: state.apiKeys,
  fetchGitHubInstallations: state.fetchGitHubInstallations,
  installGitHubApp: state.installGitHubApp,
  removeGitHubInstallation: state.removeGitHubInstallation,
  createAPIKey: state.createAPIKey,
  revokeAPIKey: state.revokeAPIKey,
  testWebhook: state.testWebhook
}))
