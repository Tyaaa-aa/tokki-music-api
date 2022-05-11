const stream = require('youtube-audio-stream')

async function handleView(req, res) {
    try {
        for await (const chunk of stream(`${req.query.videoid}`)) {
            res.write(chunk)
        }
        res.end()
    } catch (err) {
        console.error(err)
        if (!res.headersSent) {
            res.writeHead(500)
            res.end('internal system error')
        }
    }
}

const express = require('express')
// import * as express from 'express';

var cors = require('cors')
// import * as cors from 'cors';

const app = express()

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

app.use(cors())
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true)

    // Pass to next layer of middleware
    next()
})

app.get('/api', async function (req, res) {
    // const url = req.query.search
    // // let info = await getData(url)
    // const videos = await yt.search(url); 
    // res.send(videos)
    // console.log(videos)

    handleView(req, res)
})

app.get('/api2', async function (req, res) {
    const url = req.query.videoid
    // console.log(url);
    const ytdl = require('ytdl-core')

    let info = await ytdl(url, {
        filter: 'audioonly'
    })

    info.pipe(res)
})

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
    // console.log(`Example app listening on port ${app}`)
})



// let cors_proxy = require('cors-anywhere').createServer({
//     requireHeader: ['origin', 'x-requested-with'],
//     removeHeaders: [
//         'cookie',
//         'cookie2',
//     ],
//     // See README.md for other options
// });

// app.get('/proxy', function (req, res) {
//     req.url = req.url.replace('/proxy/', '/'); // Strip "/proxy" from the front of the URL.
//     cors_proxy.emit('request', req, res);
// })




let corsAnywhere = require('cors-anywhere')

let proxy = corsAnywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeaders: [], // Do not require any headers.
    removeHeaders: [] // Do not remove any headers.
});

/* Attach our cors proxy to the existing API on the /proxy endpoint. */
app.get('/proxy/:proxyUrl*', (req, res) => {
    req.url = req.url.replace('/proxy/', '/'); // Strip '/proxy' from the front of the URL, else the proxy won't work.
    proxy.emit('request', req, res);
});