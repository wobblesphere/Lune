import axios from 'axios';

const serverPort = process.env.REACT_APP_SERVER_PORT ?? 3000;
const host =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${serverPort}`
    : '';

type FileActionType = 'delete';

interface FilesResponse {
  files: string[]
  directory: string
}

async function getFiles (): Promise<FilesResponse> {
  const response = await axios.get(`${host}/api/files`);
  const fileResponse: FilesResponse = response.data;
  return fileResponse;
}

async function getFileBytes (filename: string): Promise<string> {
  const response = await axios.get(`${host}/api/files/file-bytes`, {
    params: { filename }
  });
  const filebytes: string = response.data;
  return filebytes;
}

async function handleFile (
  action: FileActionType,
  filename: string
): Promise<void> {
  await axios.post(`${host}/api/files/action`, {
    filename,
    action
  });
}

export { type FileActionType, getFiles, getFileBytes, handleFile };
