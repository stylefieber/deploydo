const config = {
  default: {
    host: 'yourhost.com',
    port: "22",
    user: "username",
    pass: "goodpassword",
    remotePath: "/public_html",
    ignore: null, //(https://globster.xyz/) null; /myapp/config/* All files inside config directory; **/*.png All .png files in all directories; **/*.{png,ico,md} All .png, .ico or .md files in all directories; /myapp/src/**/*.ts All .ts files inside src directory (and all its subdirectories)
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
    ignore: null, //(https://globster.xyz/) null; /myapp/config/* All files inside config directory; **/*.png All .png files in all directories; **/*.{png,ico,md} All .png, .ico or .md files in all directories; /myapp/src/**/*.ts All .ts files inside src directory (and all its subdirectories)
    sourcePath: "/dist",
    type: "ftp",
    buildCommand: null //'npm run build'
  }
}
module.exports = config