# MERN (Mongo Express React Nodejs)
This is a personal project to try and create a fullstack appliation using only Typescript. Its main purpose is to investigate and create best practices around scalable code. I am doing this because when a code base reaches a certain size there is complexity explosion. My hope is to create a component pattern that is easily repeatable and leaves enough flexibility to handle most cases.

## Installation
Node.js, NPM, and MongoDB are required.
```
npm install
npm start
```  
* Note: MongoDB must be running before npm start is called.

## Data Flow
* User enters data into a form rendered by React.
* User clicks save, a REST call is made to Express.
* The REST call is caught by Passport.js and authenticated with a jwt (JSON Web Token)
* The request goes to an Express controller and the data in the request is validated against a Mongoose schema.
* Mongoose then sends a query to MongoDB.
* The item that was affected is then passed to SocketIO and broadcast on its parent's channel.
* All clients listening to the parrent channel using SocketIO Client receive the broadcast.
* SocketIO Client sends a dispatch to Redux with the delta.
* Redux runs a reducer and updates its store.
* React is linked into Redux and sees things have changed.
* React rerenders all affected templates.
* Express then sends and empty response or the _id of a created document as a REST response back to the client.
* Client can then execute logic on the response.

## Client
The frontend is built using React, Redux, and Bootstrap. The app folder contains all the React templates while the data folder contains all of Redux. To maintain organization all data logic is handled via Action classes.

## Client/App
This is holds all the application specific templates. Most of the React templates are dumb, only handling rendering. Any React template directly connected to Redux must be stateless. There should be as little logic in templates as possible. 

## Client/Data
Modules in data have three files:
* Actions
    * A wrapper of dispatches to Redux, REST calls, and connections to the SocketIO Client
    * Publicly available actions can be used by React or other actions
* Model
    * The data structure to be put into Redux
* Reducer
    * The handler of reducers for the module

Note: All reducers are combined and need to have logic to check their own unique namespace.

### Client/Store.ts
This file adds the reducers to Redux and aggregates the models into the store.

## Server
The server is built using Node.js, Express, and Mongoose. The API folder contains everything to handle REST calls. Auth is module to handle authentication using Passport. Sockets is a module with base classes for SocketIO. DbModels is a list of all the model interfaces for MongoDB.

## Server/Routes.ts
Sets top level routing for the application. 

## Server/Api
Modules have 4 files:
* Model
    * Mongoose schema used to validate data before MongoDB CRUD operaitons.
* Index
    * The express sub routes that call middleware to do authentication and controller logic.
* Controller
    * CRUD logic is here using the exports from Model and Socket.
* Socket
    * Implementation of generic socket or socket with ACL to be used to keep data updated in real time.

## Testing (Mocha, Chai, Sinon)
Unit and integration testing is handled with Mocha and Chai. Sinon is being used as a mocking library. There are three major way to mock imports:
* Spy
    * Best used to see if function was called and what arguments were passed.
* Stub
    * Like a spy but replaces the target function.
    * Used to replace problematic pieces of code.
* Mock
    * Has both aspects of spies and stubs but can be overly specific.
    * Used when a funtion needs to verify multiple specific behaviors.

To test must have already have the server running:
```
npm start
```
To start testing use another command prompt:
```
npm test
```