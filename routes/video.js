var express = require('express');
const multer = require('multer');
var router = express.Router();
const db = require('../db/db');

const upload = multer(); // Multer 인스턴스 생성

router.post('/upload', upload.single('file'), async function(req, res, next) {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded.' });
    }

    const bucket = await db.connectToGridfs('video');

    // const uploadStream = bucket.openUploadStream(req.file.originalname, {
    //     contentType: req.file.mimetype
    // });
    // 여기서 'test.mp4'로 파일 이름을 고정합니다.
    const uploadStream = bucket.openUploadStream('test.mp4', {
        contentType: req.file.mimetype
    });

    // 파일 업로드를 시작
    uploadStream.end(req.file.buffer);

    // uploadStream.on('finish', () => {
    //     console.log('File uploaded to GridFS successfully:', req.file.originalname);
    //     res.status(200).send({ message: 'File uploaded successfully!' });
    // });

    uploadStream.on('finish', () => {
        console.log('File uploaded to GridFS successfully as test.mp4');
        res.status(200).send({ message: 'File uploaded successfully as test.mp4!' });
    });
    
    uploadStream.on('error', (err) => {
        console.error('Error uploading file:', err);
        res.status(500).send({ message: 'Error uploading file' });
    });
});

// 비디오 스트리밍 API
router.get('/video/:filename', async function(req, res) {
    try {
        const bucket = await db.connectToGridfs('video');
        const videoFile = req.params.filename;

        // GridFS에서 해당 파일 찾기
        const file = await bucket.find({ filename: videoFile }).toArray();

        if (!file || file.length === 0) {
            return res.status(404).send({ message: 'File not found' });
        }

        // 비디오 스트리밍 설정
        const range = req.headers.range;
        if (!range) {
            return res.status(400).send({ message: 'Requires Range header' });
        }

        const videoSize = file[0].length;
        const CHUNK_SIZE = 10 ** 6; // 1MB
        const start = Number(range.replace(/\D/g, ''));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

        const contentLength = end - start + 1;
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': file[0].contentType,
        };

        res.writeHead(206, headers);

        // GridFS에서 비디오 데이터 스트리밍
        const downloadStream = bucket.openDownloadStreamByName(videoFile, {
            start,
            end,
        });

        downloadStream.pipe(res);

        downloadStream.on('error', function (err) {
            console.error('Error streaming video file:', err);
            res.status(500).send({ message: 'Error streaming video file' });
        });

    } catch (error) {
        console.error('Failed to stream video', error);
        res.status(500).send({ message: 'Failed to stream video' });
    }
});


module.exports = router;
