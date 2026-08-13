// PM2 process definition for running this app on a shared server alongside
// other sites. See DEPLOYMENT.md for the full setup.
module.exports = {
  apps: [
    {
      name: "caringtouchreno",
      cwd: __dirname,
      script: "npm",
      args: "start",
      // Distinct port so it doesn't collide with other apps on this box —
      // change if 3011 is already taken (check with: sudo ss -tlnp).
      env: {
        NODE_ENV: "production",
        PORT: 3011,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
};
