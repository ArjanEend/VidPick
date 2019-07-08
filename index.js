const express = require('express');
const app = express();
const port = 80;
const vlclib = require('node-vlc-http');
const vlc = new vlclib('localhost', 8080, '', 'avcast');
vlc._sendCommand = vlc._command;

const basedir = require('os').homedir();

const { readdirSync, statSync } = require('fs')
const { join } = require('path')

const dirs = p => readdirSync(p).filter(f => statSync(join(p, f)));

app.set('view engine', 'pug');

app.get("/", function(req, res)
{
    let results = dirs(basedir);
    res.render('index', { title: "AVCast", message: "Directories", path: "", links: results });
});

app.get("/stop", function(req, res)
{
    vlc.stop();
    res.redirect('back');
});

app.get(/^(.+)$/, function(req, res){
    if(req.path.toLowerCase().endsWith("/stop"))
    {
        vlc.stop();
        res.redirect('back');
        return;
    }
    if(req.path.toLowerCase().endsWith(".mp4"))
    {
        vlc.addToQueueAndPlay(encodeURI(basedir + req.path));
        console.log(encodeURI(basedir + req.path));

        //http.get('http://user:avcast@localhost:8080/requests/status.json?command=in_play&input=' + encodeURIComponent(basedir + req.path), (success) => {console.log("request done" + success)});
        console.log (basedir + req.path);
        res.redirect("http:" + req.originalUrl.substring(0, req.originalUrl.lastIndexOf("/")));
        return;
    }
    let results = dirs(basedir + req.path);
    let previousLink = req.path.substring(0, req.path.lastIndexOf("/"));

    res.render('index', { title: "AVCast", prev: previousLink, message: "Directories", path: req.path, links: results });
});

app.listen(port, function() {
    console.log("App listening on port " + port);
});