Evernote Sample Usage of API for Express
==============================================
This is a sample application of Express with a library for accessing the Evernote API from node.

Setup
-----
- You need a sandbox account.  If you haven't had a Sandbox account yet, you can create one [here](https://sandbox.evernote.com/Registration.action).
- Fill your API Consumer Key and Consumer Secret in config.json.
- npm install
  - If you don't use npm, you can simply create node_modules directory and copy dependencies in package.json.

Start application
-----------------
You can start express server with `node app.js`.  Once the express server starts, you can access `http://localhost:3000` and see the application. It will list the notebooks in your sandbox account. Edit express/routes/index.js to try other parts of the Evernote API.
