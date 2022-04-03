export type AuthProvider = (
  | GitHubAuthProvider
);

export type GitHubAuthProvider = {
  type: 'github',
  data: {
    accessToken: string,
  },
};
