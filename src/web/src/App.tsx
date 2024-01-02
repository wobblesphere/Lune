import React, { useEffect, useState } from 'react';
import './App.css';
import { getFileBytes, getFiles, handleFile } from './routes';
import classNames from 'classnames';

function App (): JSX.Element {
  const [directory, setDirectory] = useState<string>('');
  const [files, setFiles] = useState<string[]>([]);
  const [getFilesError, setGetFilesError] = useState(false);
  const [failedFiles, setFailFiles] = useState<string[]>([]);
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [currentImgBytes, setCurrentImgBytes] = useState<string>('');

  const [isHandlingFile, setIsHandlingFile] = useState<boolean>(false);

  const [deletedCount, setDeletedCount] = useState<number>(0);
  const [keptCount, setKeptCount] = useState<number>(0);

  function handleNext (): void {
    const currentDisplayingIndex = files.indexOf(currentFilename);
    if (currentDisplayingIndex === files.length - 1) {
      setFiles([]);
      setCurrentImgBytes('');
      setCurrentFilename('');
    } else if (
      currentDisplayingIndex > -1 &&
      currentDisplayingIndex < files.length - 1
    ) {
      const nextFilename = files[currentDisplayingIndex + 1];
      setCurrentFilename(nextFilename);
      setIsHandlingFile(true);
      getFileBytes(nextFilename)
        .then((filebyte) => {
          if (filebyte === undefined || filebyte === '') {
            return;
          }
          setCurrentImgBytes(filebyte);
        })
        .catch((e) => {
          setCurrentImgBytes('error');
          console.error('unable to get next file bytes', nextFilename, e);
        });
    }
  }

  function deleteFile (): void {
    if (currentFilename === '') {
      console.error('attempt to taking action on empty filename');
    }
    setIsHandlingFile(true);
    handleFile('delete', currentFilename)
      .then(() => {
        setDeletedCount(deletedCount + 1);
        setDeletedFiles([...deletedFiles, currentFilename]);
      })
      .catch((e) => {
        console.error('unable to handle file', currentFilename, e);
        setFailFiles([...failedFiles, currentFilename]);
      })
      .finally(() => {
        handleNext();
        setIsHandlingFile(false);
      });
  }

  function keepFile (): void {
    setKeptCount(keptCount + 1);
    handleNext();
    setIsHandlingFile(false);
  }

  const handleKeyPress = (event: KeyboardEvent): void => {
    if (isHandlingFile || files.length === 0 || currentFilename === '') {
      return;
    }
    if (event.key === 'd') {
      deleteFile();
    } else if (event.key === 'k') {
      keepFile();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    getFiles()
      .then((response) => {
        const { files, directory } = response;
        setDirectory(directory);

        if (files === undefined || files.length === 0) {
          return;
        }
        setGetFilesError(false);

        setFiles(files);
        const firstFile = files[0];
        setCurrentFilename(firstFile);

        if (firstFile === '' || firstFile === undefined) {
          console.log('No files found');
          return;
        }

        setIsHandlingFile(true);
        getFileBytes(firstFile)
          .then((filebyte) => {
            if (filebyte === undefined || filebyte === '') {
              return;
            }
            setCurrentImgBytes(filebyte);
          })
          .catch((e) => {
            setCurrentImgBytes('error');
            console.error('unable to get first filebytes', firstFile, e);
          })
          .finally(() => {
            setIsHandlingFile(false);
          });
      })
      .catch((e) => {
        setGetFilesError(true);
        console.error('unable to get files', e);
      });
  }, []);

  if (getFilesError) {
    return (
      <div className="error-msg">
        Unable to load screenshots :( Please try again later.
      </div>
    );
  } else {
    return (
      <div className="App">
        <div id="header">Directory: {directory}</div>
        <div id="body">
          <div id="sidebar">
            <div id="sidebar-file-list">
              {files.length > 0
                ? (
                    files.map((file) => (
                  <div
                    className={classNames('sidebar-file-list-item', {
                      active: currentFilename === file,
                      failed: failedFiles.includes(file),
                      deleted: deletedFiles.includes(file),
                      viewed:
                        files.indexOf(currentFilename) > files.indexOf(file)
                    })}
                    key={file}
                  >
                    {file}
                  </div>
                    ))
                  )
                : (
                <div className="empty-msg">Nothing here :D</div>
                  )}
            </div>
            <div id="sidebar-footer">
              {files.length > 0 &&
                `(${files.indexOf(currentFilename) + 1}/${files.length})`}
            </div>
          </div>
          <div id="content">
            <div className="image-display-container">
              <div className="image-wrapper">
                {currentImgBytes !== ''
                  ? (
                  <img
                    src={`data:image/png;base64,${currentImgBytes}`}
                    alt="local screenshot"
                    className="img"
                  />
                    )
                  : (
                  <div className="empty-msg">No mo :&#41;</div>
                    )}
              </div>
            </div>
            <div className="action-buttons-container">
              <div className="button-container">
                <button
                  onClick={deleteFile}
                  disabled={isHandlingFile || files.length === 0}
                  className="action-button delete-button"
                >
                  Delete (d)
                </button>
                <div className="count">{`Deleted: ${deletedCount}`}</div>
              </div>

              <div className="button-container">
                <button
                  onClick={keepFile}
                  disabled={isHandlingFile || files.length === 0}
                  className="action-button keep-button"
                >
                  Keep (k)
                </button>
                <div className="count">{`Kept: ${keptCount}`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
