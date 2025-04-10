const plugins = [
  "@semantic-release/commit-analyzer",
  "@semantic-release/release-notes-generator",
  "@semantic-release/npm",
  [
    "@semantic-release/github",
    {
      assets: [
        {
          path: "dist/**",
        },
      ],
    },
  ],
];

module.exports = {
  plugins,
  preset: "angular",

  branches: [
    "+([0-9])?(.{+([0-9]),x}).x",
    "main",
    "next",
    "next-major",
    { name: "beta", prerelease: true },
    { name: "alpha", prerelease: true },
  ],
};
