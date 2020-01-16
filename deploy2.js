const EasyFtp = require('easy-ftp')
const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const workingDir = process.cwd()

async function run() {
  try {
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
    "username": config.user,
    "password": config.pass,
    "type": config.type
  }

  console.log(conf)

  fs.readdirSync(workingDir + '' + config.sourcePath).forEach(file => {
    files.push(workingDir + '' + config.sourcePath + '/' + file)
  })
  console.log(files)

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

const options = getArgs()

const configPath = options.deployConfigFile ? workingDir + options.deployConfigFile : workingDir + '/deploy.conf.js'
const configObj = require(configPath)

let files = []

const ftp = new EasyFtp()

ftp.on('open', () => {
  console.log('A');
  ftp.upload(files, config.remotePath, function (err) {
    console.log(err)
    console.log("uploading")
    ftp.close()
  })
})
ftp.on('error', () => {
  console.log('error');
})
ftp.on('upload', () => {
  console.log('upload');
})
ftp.on('uploading', () => {
  console.log('upload');
})
ftp.on('close', () => {
  console.log('close');
})

if (!configObj) {
  console.error("\x1b[31mCouldn't find config. Please read the documentation: https://www.npmjs.com/package/ftp-sftp-deploy \n")
}

let config

if (options.env) {
  if (configObj[options.env]) {
    config = configObj[options.env]
  } else {
    console.error("\x1b[31mCouldn't find config environment '"+configObj[options.env]+"'\n")
    exit()
  }
} else {
  if (configObj.default) {
    config = configObj.default
  } else {
    console.error("\x1b[31mCouldn't find default config environment. Please read the documentation: https://www.npmjs.com/package/ftp-sftp-deploy \n")
    exit()
  }
}

run()

return