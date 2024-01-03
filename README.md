# Lune

[![server-tests-and-linter](https://github.com/wobblesphere/Lune/actions/workflows/main.yml/badge.svg)](https://github.com/wobblesphere/Lune/actions/workflows/main.yml)
[![web-linter](https://github.com/wobblesphere/Lune/actions/workflows/webMain.yml/badge.svg)](https://github.com/wobblesphere/Lune/actions/workflows/webMain.yml)

<img src="/src/web/public/chinchilla_lune_cleaner.png" height="80px" width="80px" />

Local Web App for Screenshot Management

Initiated via CLI, this app opens screenshots from a specified directory. Features keyboard shortcuts and UI buttons for quick deletion or retention of screenshots. Streamlines screenshot organization.

## Requirement

- Yarn installed (`npm install --global yarn`)
- Node.js installed ([See instructions](https://nodejs.org/en/download/package-manager))
- Enabled JavaScript in the web browser

## Installation

```
npm install -g @wobblesphere/lune
```

## Usage

```
lune -d ~/Desktop
```

Running this command will open web app in browser displaying all screenshots in the provided directory


https://github.com/wobblesphere/Lune/assets/31394745/f66c4bfa-00e4-406a-a4f9-d657d356b41c


### FAQ

#### How does the app decide what files to display?

The app uses this `/^([a-zA-Z0-9\s_\\.\-\(\):])+\.(png)$/` regext pattern to filter filenames. Currently only works for `png`s.

#### What OS does the app run on?

Mac for now.

## Development

### Running server

- Make sure to set the following environment variables before running yarn start in the root directory

  - `DIRECTORY` : the directory of the screenshots you want to open the web app with
  - `DELETE_DIR` : the directory of the fake trash folder for development mode
  - `NODE_ENV`: 'dev'

    Example command: `export DIRECTORY=~/Desktop/testfolder && export DELETE_DIR=~/Desktop/delete && yarn start`

- Server default runs on port 3000, if taken port number will change

### Running web client

- Run `yarn start` under the src/web directory

- Assume server is listening on port 3000, otherwise, set environment variable `REACT_APP_SERVER_PORT` to the one the server is running on.

### Test production

- Run CLI script with directory as arguement to open local web app in production mode
- Delete files will be moved to trash can
  Example: `./src/cli/index.js -d ~/Desktop`
