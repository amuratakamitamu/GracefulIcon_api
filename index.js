const express = require('express');
const sharp = require('sharp');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' }); // ファイルを一時的に保存するディレクトリ

const app = express();
const PORT = 3000;

// 画像を処理するエンドポイント
app.post('/process-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // 画像のリサイズと切り取り
    sharp(req.file.path)
        .resize(824, 824, {
            fit: 'cover',
        })
        .composite([{ // 角の丸み
            input: Buffer.from(
                `<svg><rect x="0" y="0" width="824" height="824" rx="188" ry="188"/></svg>`
            ),
            blend: 'dest-in'
        }])
        .toFormat('png') // PNG形式に変換
        .toBuffer()
        .then((outputBuffer) => {
            // 処理された画像をBase64に変換してクライアントに返す
            const base64Image = outputBuffer.toString('base64');
            res.send({ imageData: base64Image });

            // 処理が終わったらファイルを削除
            fs.unlinkSync(req.file.path);
        })
        .catch((err) => {
            console.error('Error processing image:', err);
            res.status(500).send('Internal Server Error');
        });
});

// サーバーを起動
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
