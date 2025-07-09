module.exports = {
  apps: [
    {
      name: "euronova-banking",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log"
    }
  ]
};