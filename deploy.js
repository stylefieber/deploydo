#!/usr/bin/env node
const sftp = require('node-sftp-deploy-i')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const workingDir = process.cwd()

const configPath =  process.env.deployConfigFile ? workingDir + process.env.deployConfigFile : workingDir + '/deploy.conf.js'
const configObj = require(configPath)

const config = configObj.default

async function run() {
  console.log('\x1b[32m', '=== deployment script started ===')
  if (config.buildCommand) {
    console.log('\x1b[32m', '\n\nBuilding App for production...')
    var child = await exec(config.buildCommand)
    console.log(child.stdout)
  }
   console.log(config)
   console.log('\n\n\nUploading Files to Server...')
   const conf = {
    "host": config.host,
    "port": config.port,
    "user": config.user,
    "pass": config.pass,
    "remotePath": config.remotePath,
    "sourcePath": workingDir + '/' + config.sourcePath,    // optional
    "cacheFile": workingDir + '/' + config.cacheFile //optional
  }
    
  //Support Promise
  sftp(conf).then(function(){
      console.log("\n\nDeployment successful\n\n")
      console.log('\x1b[0m')
  })
}

run()

return