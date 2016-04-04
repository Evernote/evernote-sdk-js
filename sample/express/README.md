# Evernote Sample Usage of API for Express

This is a sample application of Express with a library for accessing the Evernote API from node.

You can find a blog post on how to use it [here](https://medium.com/@heitorburger/2e7184b2a08b).


## Setup

- You need a sandbox account.  If you haven't had a Sandbox account yet, you can create one [here](https://sandbox.evernote.com/Registration.action).
- Create the .env file to set your environment variables:

```sh
$ cp .env.sample .env
```

- Fill your API Consumer Key and Consumer Secret in .env.


## Start application

### Run with Node.js

- Change the environment variables in .env to:

```
APP_URL=http://localhost
PORT=3000
```

You can start the express server with `npm start`.  Once the server starts, you can access `http://localhost:3000` and see the application. It will list the notebooks in your sandbox account after you authenticate. Edit express/routes/index.js to try other parts of the Evernote API.

### Run with azk

- Change the environment variables in .env to:

```
APP_URL=http://express.dev.azk.io
PORT=3000
```

Go to your terminal and run:

```sh
$ azk start
```

And open: http://express.dev.azk.io


## Deploy to Heroku

To deploy to Heroku, just run:

```sh
git subtree push --prefix sample/express heroku master

# or force push
$ git push heroku `git subtree split --prefix sample/express master`:master --force
```
