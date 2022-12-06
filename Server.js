/*
    Arduino JS Controller (Server)

    Author: Yusuf Alauddin

    Description:
    This is the server component of the JavaScript application. 
    
*/

// Fetch API (to remove)
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Connection to the Arduino Serial on COM3 9600
const {SerialPort} = require('serialport');
const {ReadlineParser} = require('@serialport/parser-readline');
const port = new SerialPort({path:'COM3', baudRate: 9600 });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

// Socket.io server on port 5500
const express = require('express');
const app = express();
const serverport  = 5500;
const http = require('http');
const cors = require('cors');
const {Server} = require('socket.io');
const server  = http.createServer(app);

app.use(express.json());
app.use(cors());

// Instantiate Socket.io
const io = new Server(server,{
  cors: {
    origin: "http://localhost:3000",
    methods:["GET","POST"]
  }
});

io.on("connection",(socket) => {        // Socket waits to connect to React Application
  console.log("React app connected") 

  /* Asynchronous Event Emitters */

  // Socket receives 'change color' event from React App

  socket.on("change color",(data)=>{
    port.write(data);       // write RGB values to the Arduino
  })

  // Socket receives 'lcd' event from React App

  socket.on("lcd",(data)=>{
    port.write(data);       // update lcd values to the Arduino 
  })

  /* Serial Port */
  let isLoop = false;
  port.on("open", () => {         //turn serial port on
   console.log('serial port open');
  });
  parser.on('data', data =>{      // read incoming arduino data written to port
      console.log(data);

    if (data == "rgbButton*\r") {  // if rgb button is pressed
      socket.emit('rgbButton',data);  // notify the React app to switch to RGB mode
    } 
    else if (data == "lcdButton*\r") { // if lcdButton is pressed 
      socket.emit('lcdButton',data);    // notify the React app to switch to LCD mode
    } 
    else if (data == "photoButton*\r") { 
      socket.emit('photoButton',data);   
    } else if (data.includes("res:")) {
      let str = data.substring(4,data.length-1)
      socket.emit('res',str);
    }
    
  });

port.on('error', function(err) { console.log('Error: ', "Close arduino IDE after uploading code to device"); })
})


server.listen(serverport,() => {
})




