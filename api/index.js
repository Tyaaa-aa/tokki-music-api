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
    // res.setHeader('Access-Control-Allow-Origin', '*')

    // Request methods you wish to allow
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

    // Request headers you wish to allow
    // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true)

    // Pass to next layer of middleware
    next()
})

app.get('/stream', async function (req, res) {
    // handleView(req, res)
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

                    let info = await ytdl(url, {
                        filter: 'audioonly'
                    })
                    // ytdl get only the audio from the video
                    got.stream(url).pipe(res)

                    // info.pipe(res)

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

app.get('/music', async function (req, res) {
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

                    let info = await ytdl.getInfo(url, {
                        filter: 'audioonly',
                        downloadURL: true,
                    })

                    let format = ytdl.chooseFormat(info.formats, 'audioonly')
                    let track_url = format.url
                    res.redirect(`/proxy/${track_url}`);

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

const yt = require('youtube-search-without-api-key')
app.get('/search', async function (req, res) {
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
app.get('/proxy/:proxyUrl*', (req, res) => {
    req.url = req.url.replace('/proxy/', '/'); // Strip '/proxy' from the front of the URL, else the proxy won't work.
    proxy.emit('request', req, res);
});

let Jimp = require('jimp');
app.get('/thumbnail/:thumbnailUrl*', (req, res) => {
    req.url = req.url.replace('/thumbnail/', ''); // Strip '/proxy' from the front of the URL, else the proxy won't work.
    // proxy.emit('request', req, res);
    let imageUrl = req.url
    Jimp.read(imageUrl)
        .then(image => {
            // Do stuff with the image.
            image
                // .resize(512, 288)
                .cover(512, 288, Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE)
            // res.send(image.getBase64(image.getMIME()))
            console.log(imageUrl);

            let newimage = image.getBase64(image.getMIME(), (final) => {
                console.log(newimage);
                console.log(final);
            })
            console.log(newimage);

            // image.write(res)
            // image.pipe(res)

        })
        .catch(err => {
            // Handle an exception.
        });
});


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    // log the server url and port to the console
    console.log(`Example app listening on port ${PORT}`)
    // console.log(`Example app listening on port ${app}`)
})