const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = 3000;

app.post('/process-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    sharp(req.file.path)
        .resize(824, 824, {
            fit: 'cover',
        })
        .composite([{
            input: Buffer.from(
                `<svg><rect x="0" y="0" width="824" height="824" rx="188" ry="188"/></svg>`
            ),
            blend: 'dest-in'
        }])
        .toFormat('png')
        .toBuffer()
        .then((outputBuffer) => {
            const base64Image = outputBuffer.toString('base64');
            res.send({ imageData: base64Image });

            fs.unlinkSync(req.file.path);
        })
        .catch((err) => {
            console.error('Error processing image:', err);
            res.status(500).send('Internal Server Error');
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
