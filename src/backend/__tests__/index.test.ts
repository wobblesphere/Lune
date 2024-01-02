import app from '../app';
import request from 'supertest';
import fs from 'fs';
import path from 'node:path';

const testFileBasePath = '../__fixtures__/';
const OLD_ENV = process.env;

describe('GET /api/files', () => {
  beforeEach(() => {
    jest.resetModules(); // clears cache
    process.env = { ...OLD_ENV }; // make a copy
    process.env.NODE_ENV = 'dev';
    process.env.DIRECTORY = path.join(__dirname, testFileBasePath);
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore old environment
  });

  it('should have the expected amount of pngs', async () => {
    process.env.DIRECTORY = path.join(
      __dirname,
      testFileBasePath,
      'with-image-test-directory',
    );
    const response = await request(app).get(`/api/files`);
    expect(response.body.files.length).toBe(3);
  });

  it('should not have any pngs', async () => {
    process.env.DIRECTORY = path.join(
      __dirname,
      testFileBasePath,
      'without-image-test-directory',
    );
    const response = await request(app).get(`/api/files`);
    expect(response.body.files.length).toBe(0);
  });

  it('should work on empty directory', async () => {
    process.env.DIRECTORY = path.join(
      __dirname,
      testFileBasePath,
      'with-image-test-directory/empty-directory',
    );
    const response = await request(app).get(`/api/files`);
    expect(response.body.files.length).toBe(0);
  });
});

describe('GET /api/files/file-bytes', () => {
  beforeEach(() => {
    jest.resetModules(); // clears cache
    process.env = { ...OLD_ENV }; // make a copy
    process.env.NODE_ENV = 'dev';
    process.env.DIRECTORY = path.join(__dirname, testFileBasePath);
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore old environment
  });

  it('should response with status code 404 if filename is empty', async () => {
    process.env.DIRECTORY = path.join(
      __dirname,
      testFileBasePath,
      'with-image-test-directory',
    );
    const filename = ' ';

    const response = await request(app).get(
      `/api/files/file-bytes?filename=${encodeURIComponent(filename)}`,
    );
    expect(response.statusCode).toBe(404);
  });

  it('should return the expected bytes of given file', async () => {
    process.env.DIRECTORY = path.join(
      __dirname,
      testFileBasePath,
      'with-image-test-directory',
    );

    const filename = 'Screen Shot 2023-11-02 at 5.01.03 PM.png';

    const fileByteContent = fs.readFileSync(
      path.join(process.env.DIRECTORY, filename),
      {
        encoding: 'base64',
      },
    );
    const response = await request(app).get(
      `/api/files/file-bytes?filename=${encodeURIComponent(filename)}`,
    );

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(fileByteContent);
  });

  describe('POST /api/files/action', () => {
    beforeEach(() => {
      jest.resetModules(); // clears cache
      process.env = { ...OLD_ENV }; // make a copy
      process.env.NODE_ENV = 'dev';
      process.env.DIRECTORY = path.join(__dirname, testActionFilePath);
      process.env.DELETE_DIR = path.join(
        __dirname,
        testActionFilePath,
        'delete/',
      );
    });

    afterAll(() => {
      process.env = OLD_ENV; // restore old environment
    });

    const testActionFilePath = 'testaction/';
    /* eslint-disable-next-line no-useless-escape */
    const regex = new RegExp(/^([a-zA-Z0-9\s_\\.\-\(\):])+\.(png)$/);

    it('should move file to delete folder', async () => {
      const filename = 'delete.png';

      const response = await request(app)
        .post(`/api/files/action`)
        .send({ filename: filename, action: 'delete' });

      expect(response.statusCode).toEqual(200);

      let deletedFiles = fs
        .readdirSync(
          path.resolve(__dirname, path.join(testActionFilePath, 'delete')),
        )
        .filter((filename) => regex.test(filename));
      expect(deletedFiles).toHaveLength(1);

      // restore to original
      try {
        const fromPath = path.resolve(
          __dirname,
          path.join(testActionFilePath, 'delete.png'),
        );
        const toPath = path.resolve(
          __dirname,
          path.join(testActionFilePath, 'delete/', filename),
        );
        fs.renameSync(toPath, fromPath);
        deletedFiles = fs
          .readdirSync(
            path.resolve(__dirname, path.join(testActionFilePath, 'delete')),
          )
          .filter((filename) => regex.test(filename));

        expect(deletedFiles).toHaveLength(0);
      } catch (e) {
        console.error(
          `Test: unable to restore delete image to original directory`,
        );
      }
    }, 10000);

    it('should throw error if action is not valid', async () => {
      const filename = `delete.png`;
      const response = await request(app)
        .post(`/api/files/action`)
        .send({ filename: filename, action: 'test' });

      expect(response.statusCode).toEqual(400);
    });

    it('should throw error if filename is not valid for delete action', async () => {
      const filename = ` `;
      const response = await request(app)
        .post(`/api/files/action`)
        .send({ filename: filename, action: 'delete' });

      expect(response.statusCode).toEqual(400);
    });
  });
});
