module.exports = {
  apps : [{
    name: "server",
    script: './server.js',
    watch: true,
    ignore_watch: [
        "dump",
        "backups",
        "node_modules"
      ]
  }]
};
