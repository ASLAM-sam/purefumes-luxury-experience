module.exports = {
  apps: [
    {
      name: "purefumes-api",
      script: "server.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "700M",
      kill_timeout: 10000,
      listen_timeout: 10000,
      instance_var: "PM2_INSTANCE_ID",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 5000,
      },
    },
    {
      name: "purefumes-worker",
      script: "worker.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      kill_timeout: 10000,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
