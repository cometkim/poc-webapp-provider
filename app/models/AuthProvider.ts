export type T = (
  | GitHubProvider
);

type GitHubProvider = {
  type: 'github',
  data: {
    accessToken: string,
  },
};
