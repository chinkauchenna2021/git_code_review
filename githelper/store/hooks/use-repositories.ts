import { useAppStore } from '../slices'

export const useRepositories = () => useAppStore((state: { repositories: any; selectedRepository: any; isLoading: any; error: any; fetchRepositories: any; toggleRepository: any; selectRepository: any; syncGitHubRepos: any }) => ({
  repositories: state.repositories,
  selectedRepository: state.selectedRepository,
  isLoading: state.isLoading,
  error: state.error,
  fetchRepositories: state.fetchRepositories,
  toggleRepository: state.toggleRepository,
  selectRepository: state.selectRepository,
  syncGitHubRepos: state.syncGitHubRepos
}))
