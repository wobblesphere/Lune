import express, { Request, Response } from 'express';
import { Query } from 'express-serve-static-core';
import path from 'node:path';
import fs from 'fs';
import trash from 'trash';

const router = express.Router();

// pattern for files with file extension as .png
/* eslint-disable-next-line no-useless-escape */
const regex = new RegExp(/^([a-zA-Z0-9\s_\\.\-\(\):])+\.(png)$/);

export type TypedRequestQuery<T extends Query> = {
  query: T;
} & Request;

export type ActionType = {
  DELETE: 'delete';
};

function getDirectory() {
  return process.env.NODE_ENV === 'dev'
    ? process.env.DIRECTORY.replace('~', process.env.HOME)
    : process.argv[2];
}

router.post(
  '/api/files/action',
  async (req: TypedRequestQuery<{ filename: string; action: string }>, res) => {
    const filename = req.body.filename;
    const action = req.body.action;

    if (!filename || !action) {
      res.status(404).send('invalid filepath or action');
    }

    const dir = getDirectory();

    const oldPath = path.join(dir, filename);

    if (action === 'delete') {
      try {
        if (process.env.NODE_ENV === 'dev') {
          fs.renameSync(oldPath, path.join(process.env.DELETE_DIR, filename));
        } else {
          await trash(path.join(dir, filename));
        }
      } catch (e) {
        res
          .status(400)
          .send('unable to satisfy request, please check request payload');
        console.error(e);
        return;
      }
    } else {
      res.status(400).send('invalid action');
      return;
    }

    res.sendStatus(200);
  },
);

router.get(
  '/api/files/file-bytes',
  (req: TypedRequestQuery<{ filename: string }>, res: Response) => {
    const filename = req.query.filename;

    if (!filename.trim()) {
      res.status(404).send('Please send a valid filepath');
      console.error('get file bytes called without valid filepath');
      return;
    }

    const dir = getDirectory();
    const filepath = path.join(dir, '/', filename);
    const fileByteContent = fs.readFileSync(filepath, { encoding: 'base64' });
    res.set('Content-type', 'application/json');
    res.send(JSON.stringify(fileByteContent));
  },
);

router.get('/api/files', (req: Request, res: Response) => {
  const dir = getDirectory();
  const filesFound = fs.readdirSync(dir);
  // only look for PNG for now
  const pngFiles = filesFound.filter((filename) => regex.test(filename));
  res.send({ files: pngFiles, directory: dir });
});

router.get('*', (req: Request, res: Response) => {
  res.sendFile(req.originalUrl, {
    root: path.join(__dirname, '../../../../src/web/build'),
  });
});

export default router;
