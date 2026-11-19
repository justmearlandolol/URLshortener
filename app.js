import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

// nampilin html saat server di hidupin
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// menampilkan script.js
app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

// URL SHORTENING LOGIC
const url = {};

const generateShortUrl = (originalUrl) => {
    const shortUrl = Math.random().toString(36).substring(2, 8);
    url[shortUrl] = originalUrl;
    return shortUrl;
}; //untuk generate url pendek

app.post('/shorten', (req, res) => {
    const { originalUrl } = req.body;
    if (!originalUrl) {
        return res.status(400).json({ error: 'Original URL is required' });
    }

    // ngecek apakah apakah url sudah ada di database
    const existurl = Object.keys(url).find(key => url[key] === originalUrl);
    if (existurl) {
        return res.status(200).json({ shortUrl: existurl });
    }

    // generate url yg pendek
    const urlpendek = generateShortUrl(originalUrl);
    res.status(200).json({ shortUrl: urlpendek });
});

// untuk menampilkan semua url yg sudah di generate
app.get('/urls', (req, res) => {
    res.status(200).json(url);
});

// redirect url pendek ke url asli
app.get('/:shortUrl', (req, res) => {
    const originalUrl = url[req.params.shortUrl];
    if (!originalUrl) {
        return res.status(404).json({ error: 'Short URL not found' });
    }
    res.redirect(originalUrl);
});

//secure url pendek
const secureUrl = (shortUrl) => {
    const originalUrl = url[shortUrl];
    if (!originalUrl) {
        return null;
    }
    const secureShortUrl = `https://myapp.com/${shortUrl}`;
    return secureShortUrl;
};

app.listen(port, () => {
    console.log(`server is running on localhost:${port}`);
});