import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_PATH || './uploads';

// Criar diretórios se não existirem
const dirs = [
  uploadDir,
  path.join(uploadDir, 'checklist'),
  path.join(uploadDir, 'occurrences'),
  path.join(uploadDir, 'tires'),
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'checklist';

    const routeContext = `${req.baseUrl || ""}${req.path || ""}`.toLowerCase();

    if (routeContext.includes('/occurrences')) {
      folder = 'occurrences';
    } else if (routeContext.includes('/tires')) {
      folder = 'tires';
    }

    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use: JPEG, JPG, PNG ou WEBP'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB padrão
  },
});
