import GitHubProvider from "next-auth/providers/github";

export default GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    authorization: {
        params: {
          scope: "read:user user:email repo admin:repo_hook read:org"
        }
      },
      profile(profile: any) {
        return {
          id: profile.id!,
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubId: profile.id,
          githubUsername: profile.login,
        }
      }
});