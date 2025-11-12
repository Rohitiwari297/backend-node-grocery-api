import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(req.baseUrl);
    console.log(req.url);

    let endPoint = req.baseUrl.split('/api/')[1];

    if (endPoint == 'admin') {
      endPoint = req.url;
    }
    const uploadDir = `./uploads/${endPoint}`;

    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

    // Get file extension from MIME type
    const fileExtension = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`; // fallback to mimetype if no extension

    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
  },
});

export const upload = multer({ storage: storage });
