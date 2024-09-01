import path from 'path';
import multer from 'multer';

import config from '../config.js';
import moment from 'moment';


const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const subFolder = path.basename(req.path);
        cb(null, `${config.UPLOAD_DOCUMENTS_DIR}/${subFolder}`);
    },  

    filename: (req, file, cb) => {
        const date = Date.now()
        cb(null, date+file.originalname.split(".")[0].toUpperCase()+"."+file.originalname.split(".")[1] );
    }
});

export const uploader = multer({ storage: localStorage });
