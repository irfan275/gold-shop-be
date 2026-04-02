module.exports = {
  apps : [{
    script: './server.js',
    watch: '.',
    ignore_watch: [
        "dump",
        "backups",
        "node_modules"
      ]
  }]
};
