# deploydo

Deploydo was created because we have a lot of projects which are simply deployed by uploading files via ftp / sftp. This process is now automated by using deploydo.

### Version 2
Breaking changes
* config files are json files and no js files anymore. 
* password is not saved in standart config file anymore. You can now commit the config file (if it's okay for you). The password is saved in a separated file, which should not be commited.

### installation 
<code>npm install -g deploydo</code>

**warning** add deploy.conf.json to your .gitignore if you don't want to commit your deployment data **!**

### configuration
Create <code>deploy.conf.json</code> file in your project directory.
Use this as template:
```
const config = {
  default: {
    host: 'yourhost.com',
    port: "22",
    user: "username",
    remotePath: "/public_html",
    sourcePath: "/dist",
    ignore: ["**/*.zip", "**/*.txt"], //ignores all zip and all txt files in all directories
    type: "sftp",
    buildCommand: 'npm run build' //set to null or remove property for no build
  },
  production: {
    host: 'yourhost.com',
    port: "21",
    user: "username",
    remotePath: "/public_html",
    sourcePath: "/dist",
    ignore: "**/*.png", //ignores all .png files in all directories
    type: "ftp",
    buildCommand: null //'npm run build'
  }
}
```

To create a config sample file inside your current directory:
```shell
$ deploydo --sample
```


### Example commands
Start deployment for production config
```shell
$ deploydo --env=production
```


Start deployment for default config
```shell
$ deploydo
```


If you want to use another config file use
```shell
$ deploydo --deployConfigFile=configFilename.json
```

### Config options
**host**: hostname or ip the script should connect to.

**port**: 21 for ftp 22 for sftp. Might depend on your server setting.

**user**: ftp/sftp username.

**remotePath**: path on your server. When you connect through sftp, you might be in the root folder, even if your ftp client sends you to another one when connecting.

**sourcePath**: path relative to your working directory.

**ignore**: Glob pattern or an Array of glob patterns. Which files you want not to be uploaded. Check https://globster.xyz/ for examples.

| glob pattern  | Means   
| ------------- |:-------------:|
| /myapp/config/*     | All files inside config directory |
| \*\*/\*.png    | All .png files in all directories      | 
| \*\*/\*.{png,ico,md} | All .png, .ico or .md files in all directories      |
| /myapp/src/\*\*/\*.ts | All .ts files inside src directory (and all its subdirectories) |

**type**: ftp or sftp. sftp is basically ftp over ssh.

**buildCommand**: If you want to execute a build command before uploading, you can type it here. For example <code>npm run build</code>


### Passwords

You will be asked to enter your password. You can then save it automatically in a separated password file. The password is **not** encrypted when saved. After that you will be asked if the script should add this file to your .gitignore (what you should do).

Only use this option when this is no problem for you.
