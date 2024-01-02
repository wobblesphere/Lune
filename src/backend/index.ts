import app from './app';
import http from 'http';

const PORT = process.env.PORT || 3000;

app.listen(PORT, (): void => {
  const server = http.createServer(this);

  if (process.env.NODE_ENV === 'dev') {
    const dir = process.env.DIRECTORY?.trim();
    if (dir === undefined) {
      server.close(() =>
        console.error(
          'Shutting server -- Please set DIRECTORY environment variable',
        ),
      );
      process.exit(1);
    } else {
      if (dir.includes('~') && process.env.HOME === undefined) {
        console.error(
          'Please set HOME environment variable in order to use tilde ~ syntax for directory',
        );
        process.exit(1);
      }
    }
  }

  console.log(`Server running here: http://localhost:${PORT}`);

  if (process.env.NODE_ENV === 'prod') {
    if (process.send) {
      process.send('init done');
    } else {
      console.error('unable to send message to child process in cli');
    }
  }
});
