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

## Tour
### Client
The frontend is built using React, Redux, and Bootstrap. The app folder contains all the React templates while the data folder contains all of Redux. To maintain organization all data logic is 