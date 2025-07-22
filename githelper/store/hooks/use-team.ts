import { useAppStore } from "../slices";

export const useTeams = () => useAppStore((state: { teams: any; currentTeam: any; isLoading: any; fetchTeams: any; createTeam: any; updateTeam: any; deleteTeam: any; inviteMember: any; removeMember: any; updateMemberRole: any; setCurrentTeam: any; }) => ({
  teams: state.teams,
  currentTeam: state.currentTeam,
  isLoading: state.isLoading,
  fetchTeams: state.fetchTeams,
  createTeam: state.createTeam,
  updateTeam: state.updateTeam,
  deleteTeam: state.deleteTeam,
  inviteMember: state.inviteMember,
  removeMember: state.removeMember,
  updateMemberRole: state.updateMemberRole,
  setCurrentTeam: state.setCurrentTeam
}))