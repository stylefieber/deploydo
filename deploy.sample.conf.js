const config = {
  default: {
    host: 'yourhost.com',
    port: "22",
    user: "username",
    pass: "goodpassword",
    remotePath: "/public_html",
    sourcePath: "/dist",
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
    type: "ftp",
    buildCommand: null //'npm run build'
  }
}
module.exports = config