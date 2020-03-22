import Router from 'express-promise-router';
import fileUpload from 'express-fileupload';
import config from '../../config';
import logger from '../../utils/logger';
import { validateAuthentication } from '../middlewares/validateAuthentication';

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

router.post('/upload-data', validateAuthentication, (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.boom.badRequest('No files were uploaded.');
  }

  const data = req.files.data;

  logger.debug({
    md5: data.md5,
    name: data.name,
    size: data.size
  });

  // Use the mv() method to place the file somewhere on your server
  data.mv(`${config.get('upload.path')}/${data.name}`, function(err) {
    if (err) return res.boom.badImplementation(err.message);

    res.json({ message: 'File uploaded!' });
  });
});

export default router;