import Router from 'express-promise-router';
import fileUpload from 'express-fileupload';
import config from '../../../config';
import { users } from '../../../db/stores';
import s3 from '../../../utils/s3';
import { storeLocationHistory } from '../../../operations/locationHistory';

const router = Router();
router.use(
  fileUpload({
    debug: config.get('upload.debug'),
    abortOnLimit: true,
    limitHandler: (_req, res) => {
      res.boom.entityTooLarge();
    },
    limits: {
      fileSize: config.get('upload.limits.fileSize')
    }
  })
);

router.post('/', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.boom.badRequest('No files were uploaded.');
  }

  const promises = Object.values(req.files).map(async (file) => {
    const checksum = Buffer.from(file.md5, 'hex').toString('base64');
    const splittedName = file.name.split('.');
    const ext = splittedName[splittedName.length - 1];
    await s3.putObject(`${file.md5}.${ext}`, { ContentMD5: checksum }, file.data);
    await users.appendValue(req.currentUser.id, 'dataHashes', file.md5);
    if (ext === 'kml') {
      await storeLocationHistory(req.currentUser.id, file.data.toString());
    }
  });
  await Promise.all(promises);

  res.json({ message: 'File(s) uploaded!' });
});

export default router;
