var Deploy = require('ftp-deploy');
var ftpDeploy = new Deploy();
var config = {
    // Dev ->
    host: "ftp.thewrteam.in",
    user: "u863526903.devegrocer",
    password: "Wrteam@123456",
    //Live ->
    // host: "193.203.162.252",
    // user: "egrocerweb",
    // password: "Wrteam@123",
    port: 21,
    localRoot: __dirname + '/build',
    remoteRoot: '/',
    include: ['*', '.htaccess'],
    deleteRemote: true
};
ftpDeploy.deploy(config, function (err, res) {
    if (err) console.log(err);
    else console.log('finished:', res);
});
ftpDeploy.on("uploading", function (data) {
    data.totalFilesCount;
    data.transferredFileCount;
    data.filename;
});
ftpDeploy.on("uploaded", function (data) {
    console.log(data);
});
ftpDeploy.on("log", function (data) {
    console.log(data);
});
ftpDeploy.on("upload-error", function (data) {
    console.log(data.err);
});