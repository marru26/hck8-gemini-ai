const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Konfigurasi Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Konfigurasi Multer untuk upload file (jika diperlukan)
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Halo dari Gemini API Tester!');
});

// Contoh endpoint untuk berinteraksi dengan Gemini API
app.post('/generate-text', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = req.body.prompt;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ generatedText: text });
  } catch (error) {
    console.error('Error generating text:', error);
    res.status(500).json({ error: 'Failed to generate text' });
  }
});

// Contoh endpoint untuk berinteraksi dengan Gemini Vision API (jika ada gambar)
app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    if (!req.body.prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const image = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([req.body.prompt, image]);
    const response = await result.response;
    const text = response.text();
    res.json({ generatedText: text });
  } catch (error) {
    console.error('Error generating from image:', error);
    res.status(500).json({ error: 'Failed to generate from image' });
  }
});

// Endpoint baru untuk memproses audio
app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }
    if (!req.body.prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); // Sesuaikan model jika ada model khusus audio
    const audio = {
      inlineData: {
        data: req.file.buffer.toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    // Dalam konteks Gemini API, audio biasanya diproses sebagai bagian dari prompt multimodal.
    // Pastikan model yang digunakan mendukung input audio dan prompt teks.
    // Untuk saat ini, kita akan memperlakukannya sebagai input biner bersama prompt.
    const result = await model.generateContent([req.body.prompt, audio]);
    const response = await result.response;
    const text = response.text();
    res.json({ generatedText: text });
  } catch (error) {
    console.error('Error generating from audio:', error);
    res.status(500).json({ error: 'Failed to generate from audio' });
  }
});

// Endpoint baru untuk memproses dokumen (contoh: teks dari dokumen)
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    }
    if (!req.body.prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Asumsi dokumen adalah teks atau dapat dikonversi ke teks
    // Untuk dokumen seperti PDF, Anda mungkin perlu library tambahan untuk mengekstrak teks.
    // Di sini, kita asumsikan konten file bisa langsung diinterpretasikan sebagai teks.
    const documentContent = req.file.buffer.toString('utf8');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `Based on the following document content: \n\n${documentContent}\n\nAnswer the following question: ${req.body.prompt}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ generatedText: text });
  } catch (error) {
    console.error('Error generating from document:', error);
    res.status(500).json({ error: 'Failed to generate from document' });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
  console.log('Pastikan Anda memiliki file .env dengan GEMINI_API_KEY Anda.');
});