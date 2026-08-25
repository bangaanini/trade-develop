module.exports = {
  apps: [
    {
      name: "trade-freedom",
      script: "node_modules/.bin/next",
      args: "start -p 3008",
      cwd: "/home/aan/Downloads/trade-develop",
      env: {
        NODE_ENV: "production",
        PORT: 3008,
      },
    },
    {
      name: "trade-worker",
      script: "node_modules/.bin/tsx",
      args: "worker/index.ts",
      cwd: "/home/aan/Downloads/trade-develop",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
