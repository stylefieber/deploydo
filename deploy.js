const EasyFtp = require('easy-ftp')
const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const workingDir = process.cwd()
const branchNameF = require('current-git-branch')
const repoNameF = require('git-repo-name')
const readlineSync = require('readline-sync')

const branchName = branchNameF()
let repoName
if (branchName) {
  repoName = repoNameF.sync()
}

const options = getArgs()

const configPath = options.deployConfigFile ? workingDir + options.deployConfigFile : workingDir + '/deploy.conf.js'
const configObj = require(configPath)

let files = []

const ftp = new EasyFtp()

ftp.on('open', () => {
  console.log('\nConnection to server established\n');
  console.log("\n\x1b[32mUploading...\n")
  ftp.upload(files, config.remotePath, function (err) {
    if (err) {
      console.error(err)
      exit()
    }
    console.log("\n\x1b[32mDeployment Done!\n")
    ftp.close()
  })
})
ftp.on('error', (err) => {
  if (err) console.log(err)
})
ftp.on('upload', () => {
  //console.log('upload')
})
ftp.on('uploading', () => {
  //console.log('upload')
})
ftp.on('close', () => {
  //console.log('close')
})

if (!configObj) {
  console.error("\n\x1b[31mCouldn't find config. Please read the documentation: https://www.npmjs.com/package/ftp-sftp-deploy \n")
}

let config

if (options.env) {
  if (configObj[options.env]) {
    config = configObj[options.env]
  } else {
    console.error("\n\n\x1b[31mCouldn't find config environment '"+configObj[options.env]+"'\n\n")
    exit()
  }
} else {
  if (configObj.default) {
    config = configObj.default
  } else {
    console.error("\n\n\x1b[31mCouldn't find default config environment. Please read the documentation: https://www.npmjs.com/package/ftp-sftp-deploy \n\n")
    exit()
  }
}



async function run() {
  try {
    let really
    if (branchName) {
      really = readlineSync.question('\n\n\x1b[36mPlease check if everything is correct:\n\nRepository: ' + repoName + '\ncurrent branch: ' + branchName + '\nlocal Folder: ' + config.sourcePath + '\nremote Folder: ' + config.remotePath + '\n\nShould I start the deployment? (y/n)')
    } else {
      really = readlineSync.question('\n\n\x1b[36mPlease check if everything is correct:\n\nlocal Folder: ' + config.sourcePath + '\nremote Folder: ' + config.remotePath + '\n\nShould I start the deployment? (y/n)')
    }
    if (really !== 'y' && really !== 'Y') {
      console.log("\x1b[36mDeployment cancelled by user")
      exit()
    }
    console.log('\n\x1b[32m', '=== deployment script started ===\n')
    if (config.buildCommand) {
      console.log('\n\x1b[32m', '\nBuilding App for production...\n')
      var child = await exec(config.buildCommand)
      console.log(child.stdout)
      console.log('\n\x1b[32m', '\nBuilding done!\n')
    }
    console.log('\nConnecting to server...\n')
    const conf = {
      "host": config.host,
      "port": config.port,
      "username": config.user,
      "password": config.pass,
      "type": config.type
    }

    fs.readdirSync(workingDir + '' + config.sourcePath).forEach(file => {
      files.push(workingDir + '' + config.sourcePath + '/' + file)
    })

    ftp.connect(conf)

    return

  } catch(err) {
    console.log(err)
    return
  }
}

function getArgs() {
  const args = {}
  process.argv
    .slice(2, process.argv.length)
    .forEach(arg => {
      // long arg
      if (arg.slice(0, 2) === '--') {
        const longArg = arg.split('=')
        const longArgFlag = longArg[0].slice(2, longArg[0].length)
        const longArgValue = longArg.length > 1 ? longArg[1] : true
        args[longArgFlag] = longArgValue
      }
      // flags
      else if (arg[0] === '-') {
        const flags = arg.slice(1, arg.length).split('')
        flags.forEach(flag => {
          args[flag] = true
        })
      }
    })
  return args
}

function exit() {
  console.log('\x1b[0m')
  process.exit()
}

run()

return