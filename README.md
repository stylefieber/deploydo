# deploydo

Deploydo was created because we have a lot of projects which are simply deployed by uploading files via ftp. This process is now automated by using deploydo.

### installation 
<code>npm install -g deploydo</code>

**warning** add deploy.conf.js to your .gitignore **!**

### configuration
Create <code>deploy.conf.js</code> file in your project directory.
Use this as template:
```
const config = {
  default: {
    host: 'yourhost.com',
    port: "22",
    user: "username",
    pass: "goodpassword",
    remotePath: "/public_html",
    sourcePath: "/dist",
    ignore: ["**/*.zip", "**/*.txt"],
    type: "sftp",
    buildCommand: 'npm run build' //set to null or remove property for no build
  },
  production: {
    host: 'yourhost.com',
    port: "21",
    user: "username",
    pass: "good password",
    remotePath: "/public_html",
    sourcePath: "/dist",
    ignore: "**/*.png", //ignores all .png files in all directories
    type: "ftp",
    buildCommand: null //'npm run build'
  }
}
module.exports = config
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
$ deploydo --deployConfigFile=configFilename.js
```

### Config options
**host**: hostname or ip the script should connect to.

**port**: 21 for ftp 22 for sftp. Might depend on your server setting.

**user**: ftp/sftp username.

**pass**: password.

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
