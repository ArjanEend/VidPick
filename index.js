var express = require('express');
var app = express();
var port = 8080;
var VLC = require('vlc-simple-player')

const { readdirSync, statSync } = require('fs')
const { join } = require('path')

const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)));

app.set('view engine', 'pug');

var player = null;

const basedir = "C:/Users/Arjan/Downloads";

player = new VLC(basedir, {port: 9090, password: "Hello"});
player.on('statuschange', (error, status) => {
    if (error) return console.error(error)
    });

console.log(player.getPassword());


app.get("/", function(req, res)
{
    let results = dirs(basedir);
    res.render('index', { title: "AVCast", message: "Directories", path: "", links: results });
});

app.get("/stop", function(req, res)
{
    player.request('/requests/status.json?command=pl_stop', () => {});
});

app.get(/^(.+)$/, function(req, res){
    if(req.path.toLowerCase().endsWith(".mp4"))
    {
        player.request('/requests/status.json?command=in_play&input=' + encodeURIComponent(basedir + req.path), (error, data) => {console.log("request done" + error + " " + data)})
        console.log (basedir + req.path);
        res.redirect("http:" + req.originalUrl.substring(0, req.originalUrl.lastIndexOf("/") + 1));
        return;
    }
    let results = dirs(basedir + req.path);

    res.render('index', { title: "AVCast", message: "Directories", path: req.path, links: results });
});

app.listen(port, function() {
    console.log("App listening on port " + port);
});