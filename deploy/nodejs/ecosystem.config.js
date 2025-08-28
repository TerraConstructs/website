module.exports = {
  apps: [
    {
      name: 'terraconstructs-landing',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 80
      },
      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Process management
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5,
      
      // Monitoring
      watch: false,
      ignore_watch: ['logs', 'node_modules'],
      
      // Advanced features
      kill_timeout: 5000,
      listen_timeout: 8000,
      shutdown_with_message: true
    }
  ]
};