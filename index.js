const stream = require('youtube-audio-stream')

async function handleView(req, res) {
    try {
        for await (const chunk of stream(`${req.query.q}`)) {
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

const fs = require('fs');

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

app.get('/api/stream', async function (req, res) {
    handleView(req, res)
})
const https = require('https');
const http = require('http');

let ufs = url => {
    return new Promise((res, rej) => {
        let req = url.startsWith('https://') ? https.get(url) : http.get(url);
        req.once("response", r => {
            req.abort();
            let c = parseInt(r.headers['content-length']);
            if (!isNaN(c)) res(c);
            else rej("Couldn't get file size");
        });
        req.once("error", e => rej(e));
    });
};
const ytdl = require('ytdl-core')
// const got = require('got')

app.get('/api/music', async function (req, res) {
    const url = req.query.q
    try {

        https.get(`https://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch?v=${url}&format=json`, async (resp) => {
            let data = ''

            // A chunk of data has been received.
            resp.on('data', (chunk) => {
                data += chunk
            })

            // The whole response has been received. Print out the result.
            resp.on('end', async () => {
                // console.log(data)
                // return
                if (data != "Bad Request") {

                    // let info = await ytdl(url, {
                    //     filter: 'audioonly'
                    // })

                    let info = await ytdl(url, {
                        filter: 'audioonly'
                    })

                    info.pipe(res)
                    return
                    let info2 = await ytdl.getInfo(url, {
                        filter: 'audioonly'
                    })
                    // let audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
                    let format = ytdl.chooseFormat(info2.formats, 'audioonly')
                    let track_url = format.url
                    // console.log('Formats with only audio: ' + audioFormats.length)

                    // var file = fs.createWriteStream("file.wav")
                    // var request = https.get(format.url, function (response) {
                    //     res.pipe(file)
                    // })

                    const https = require('https'); // or 'https' for https:// URLs
                    const fs = require('fs');

                    // const file = fs.createWriteStream("file.mp3");
                    // const request = https.get(track_url, function (response) {
                    //     res.header('Content-Disposition', 'attachment; filename="track.mp3"');
                    //     response.pipe(res);
                    //     // res.send(response)

                    //     // after download completed close filestream
                    //     file.on("finish", () => {
                    //         file.close();
                    //         console.log("Download Completed");
                    //     });
                    // });

                    // got.stream(format.url)
                    //     .pipe(fs.createWriteStream('file.wav'))
                    //     .on('close', function () {
                    //         console.log('File written!');
                    //     });
                    // console.log(info)
                    // info.pipe(res)

                    // ufs(format.url)
                    //     .then((response) => {
                    //         var filePath = format.url;

                    //         var total = response

                    //         res.writeHead(206, {
                    //             'Accept-Ranges': 'bytes',
                    //             'Content-Type': 'audio/mpeg'
                    //         });

                    res.header('Content-Disposition', 'attachment; filename="track.mpeg"');

                    // res.header(
                    //     'Content-Type', 'audio/mpeg'
                    // );
                    
                    // res.header({
                    //     // 'Content-Length': total,
                    //     'Content-Type': 'audio/mpeg'
                    // });

                    res.send(`<audio><source src="${track_url}" type="audio/mpeg"></audio>`)
                    //     }) // 1416


                } else {
                    res.send("Error, invalid video id provided.")
                }
            })

        }).on("error", (err) => {
            console.log("Error: " + err.message)
        })

    } catch (error) {
        console.log(error)
    }
})


// Search API 

// // const api = require('./search')
// const api = require('./api/search')

// // app.use('/search', api) 
// app.use('/api/search', api) 

const yt = require('youtube-search-without-api-key')
app.get('/api/search', async function (req, res) {
    const url = req.query.q
    // let info = await getData(url)
    const videos = await yt.search(url);
    res.send(videos)
    console.log(videos)
})


let corsAnywhere = require('cors-anywhere')
const {
    log
} = require('console')

let proxy = corsAnywhere.createServer({
    originWhitelist: [], // Allow all origins
    requireHeaders: [], // Do not require any headers.
    removeHeaders: [] // Do not remove any headers.
});

/* Attach our cors proxy to the existing API on the /proxy endpoint. */
app.get('/api/proxy/:proxyUrl*', (req, res) => {
    req.url = req.url.replace('/api/proxy/', '/'); // Strip '/proxy' from the front of the URL, else the proxy won't work.
    proxy.emit('request', req, res);
});


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
    // console.log(`Example app listening on port ${app}`)
})