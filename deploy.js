#!/usr/bin/env node
'use strict';

const EasyFtp = require('easy-ftp')
const fs = require('fs')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const workingDir = process.cwd()
const branchNameF = require('current-git-branch')
const repoNameF = require('git-repo-name')
const readlineSync = require('readline-sync')
const jsonfile = require('jsonfile')
const glob = require("glob")

//console.log(__dirname)
//return

let branchName
try {
  branchName = branchNameF()
} catch(err) {

}
let repoName
if (branchName) {
  try {
    repoName = repoNameF.sync()
  } catch(err) {
  }
}

const options = getArgs()

if (options.sample) {
  fs.copyFileSync(__dirname + '/deploy.sample.conf.json', workingDir + '/deploy.sample.conf.json')
  console.log("\n\nSample file copied. Rename it to deploy.conf.json to use it.\n")
  exit()
}

const configPath = options.deployConfigFile ? workingDir + '/' + options.deployConfigFile : workingDir + '/deploy.conf.json'
const configPathPw = workingDir + '/deploy.pw.conf.json'
let configObj
let configPwObj
try {
  //configObj = require(configPath)
  configObj = jsonfile.readFileSync(configPath)
} catch(err) {
  console.error("\n\n\x1b[31mCannot find '"+configPath+"'. Please visit https://www.npmjs.com/package/deploydo and read the documentation. Type 'deploydo sample' to get a sample file.")
  exit()
}

let files = []

let uploadFiles = []

const ftp = new EasyFtp()

ftp.on('open', () => {
  console.log('\nConnection to server established\n')
  console.log("\n\x1b[32mUploading...\n")
  ftp.upload(uploadFiles, function (err) {
    if (err) {
      console.error(err)
      exit()
    }
    console.log("\n\x1b[32mDeployment Done!\n")
    console.log('\x1b[0m')
    ftp.close()
  })
  /*
  ftp.upload(files, config.remotePath, function (err) {
    if (err) {
      console.error(err)
      exit()
    }
    console.log("\n\x1b[32mDeployment Done!\n")
    console.log('\x1b[0m')
    ftp.close()
  })
  */
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
  console.error("\n\x1b[31mCouldn't find config. Please read the documentation: https://www.npmjs.com/package/deploydo \n")
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
    console.error("\n\n\x1b[31mCouldn't find default config environment. Please read the documentation: https://www.npmjs.com/package/deploydo \n\n")
    exit()
  }
}


handlePassword()
handleGitignore()


async function run() {
  try {
    let really
    if (branchName && repoName) {
      really = readlineSync.question('\n\n\x1b[36mPlease check if everything is correct:\n\nRepository: ' + repoName + '\ncurrent branch: ' + branchName + '\nHost: ' + config.host + '\nlocal Folder: ' + config.sourcePath + '\nremote Folder: ' + config.remotePath + '\n\nShould I start the deployment? (y/n) ')
    } else {
      really = readlineSync.question('\n\n\x1b[36mPlease check if everything is correct:\n\nHost: ' + config.host + 'local Folder: ' + config.sourcePath + '\nremote Folder: ' + config.remotePath + '\n\nShould I start the deployment? (y/n) ')
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

    let f = glob.sync('**', {cwd: workingDir + config.sourcePath, ignore: config.ignore || []})
    //console.log(f)

    for (let file of f) {
      uploadFiles.push({
        local: '.' + config.sourcePath + '/' + file,
        remote: config.remotePath + '/' + file
      })
    }

    //console.log(uploadFiles)

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

function handlePassword() {
  //check if pw file exists
  let fileExists = false
  let envPasswordExists = false
  try {
    configPwObj = jsonfile.readFileSync(configPathPw)
    fileExists = true
  } catch(err) {
    fileExists = false
  }
  if (!configPwObj) configPwObj = {}
  //if yes, check if pw for environment has been set
  if (fileExists) {
    if (configPwObj[options.env]) {
      envPasswordExists = true
      config.pass = configPwObj[options.env]
    }
    else envPasswordExists = false
  }
  //if not, ask user for pw and if the pw should be saved
  if (!envPasswordExists) {
    let pass = readlineSync.question('\n\n\x1b[36mPlease enter password: ', {hideEchoBack: true, mask: '*'})
    config.pass = pass
    let savePass = readlineSync.question('\n\n\x1b[36mShall I save the password for you in an extra file (deploy.pw.conf.json) (y/n) ')
    //if yes, save it
    if (savePass == 'y' || savePass == 'Y') {
      if (!fileExists) {
        fs.writeFileSync(configPathPw, '{}')
      }
      configPwObj[options.env] = config.pass
      jsonfile.writeFileSync(configPathPw, configPwObj)
    }
  }
}

function handleGitignore() {
  let gitignoreExists = false
  let foundEntry = false
  let gitignoreFilePath = workingDir + '/.gitignore'
  if (fs.existsSync(gitignoreFilePath)) {
    gitignoreExists = true
  }
  let ignoreContent = ''
  if (!gitignoreExists) {
    fs.writeFileSync(gitignoreFilePath, 'deploy.pw.conf.json')
  } else {
    ignoreContent = fs.readFileSync(workingDir + '/.gitignore', 'utf8')
    foundEntry = ignoreContent.indexOf('deploy.pw.conf.json')
    if (foundEntry === -1) foundEntry = false
    else foundEntry = true
  }
  if (!foundEntry) {
    let shallWrite = readlineSync.question('\n\n\x1b[36mThere is a deploy.pw.conf.json in your working directory which is currently not in your .gitignore or there is no .gitignore file. Should I take care and add this file to .gitignore (y/n) ')
    if (shallWrite == 'y' || shallWrite == 'Y') {
      let content = 'deploy.pw.conf.json\n' + ignoreContent
      fs.writeFileSync(workingDir + '/.gitignore', content, 'utf8')
    }
  }
}


function exit() {
  console.log('\x1b[0m')
  process.exit()
}

run()
