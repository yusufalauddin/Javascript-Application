/*
    Arduino JS Controller (Client)

    Author: Yusuf Alauddin

    Description:
    This is the client component of the JavaScript application. 
    
*/
import React from 'react';
import {useState,useEffect} from 'react';
import Wheel from '@uiw/react-color-wheel';   // import Wheel UI
import io from 'socket.io-client'       // import WebSocket
import './App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

const socket = io.connect('http://localhost:5500')  // connect to server on port 5500
const color = require('color-convert')              // color converter for HSV --> RGB

/*
convertHSVToStr(hsva)

  Description: 
  - Converts HSV color values to RGB
  - Utilizes color-convert to turn hsva into rgb array
  - Appends each value to String separated by ' '
  - String terminates with '*' delimiter 

return String
*/
const convertHSVToStr = (hsva) => {
  var arr = color.hsv.rgb(hsva.h,hsva.s,hsva.v)
  let str = arr[0] + " " + arr[1] + " " + arr[2] + "*";
  return str;
}

// Main Component Rendered by Application

 function App() {
  const [hsva, setHsva] = useState({ h: 0, s: 0, v: 100, a: 1 });   // holds HSV values from color wheel
  const [text,setText] = useState("");  // holds String value to output onto RGB LCD
  const [mode,setMode] = useState("RGB");   // determines what mode (rgb,lcd,lum)
  const [light,setLight] = useState("");
  const [arr,setArr] = useState([0,0,0,0,0,0,0])

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );
  
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Circuit Photoresistor Reader',
      },
    },
  };
  
  const labels = ['0', '1', '2', '3', '4', '5', '6'];
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Value of Light Sensor',
        data: arr,
        backgroundColor: 'rgba(155, 99, 132, 0.5)',
      },
      
    ],
  };
  

  const update = (light) => {
    let temp = arr.slice(1);
    temp.push(parseInt(light));
    setArr(temp);
  }


useEffect(()=>{
  update(light);
  data.datasets[0].data = arr;
},[light])

  // On every change of the hsva array, the socket will send an event to the server 
  //  to change colors on the Arduino

  useEffect(()=>{
      socket.emit("change color",convertHSVToStr(hsva));
    },[hsva]) 

    useEffect(()=>{
      console.log(mode);
    },[mode])

  // On the event that the app receives an "rgbButton" event,
  //  set the mode = RGB
  socket.on("rgbButton",(data)=>{
    setMode("RGB")
    setHsva({ h: 0, s: 0, v: 100, a: 1 });    
  })

  // On the event that the app receives an "lcdButton" event,
    //  set the mode = LCD
  socket.on("lcdButton",(data)=>{
    setMode("LCD")
  })

  socket.on("photoButton",(data)=>{
    setMode("PHOTO")
  })

  socket.on("res",(data)=>{
    if (data.substring(0,data.length-1) != data) {
      setLight(data.substring(0,data.length-1));
    }
  })
  
  // 'Send' button event handler
  const handleSubmit = () => {
    socket.emit("lcd","LCD:"+text+"*"); // send the value in the LCD text box
  }

  return (
    <div className='App-header'>
    <div>
      <h1 className='App' style={{"font-weight":"100", color:"black","font-family": "montserrat", "text-transform": "uppercase;"}}>Arduino Application Controller</h1>
      <h2 className='App' style={{"font-weight":"100",color:"black","font-size":"20px","font-family": "montserrat","text-transform": "uppercase;"}}>Mode: {mode} </h2>

      {mode == 'RGB' && 
      <div className='rgbDiv'>
      <Wheel
       height={500}
       width={500} 
       color={hsva}
       onChange={(color) => {
        setHsva({ ...hsva, ...color.hsva });
      }}
      />
      </div>
      }
      {mode == 'LCD' &&
      <div className='horizontalDiv'>
      <form  onSubmit={(e)=>{e.preventDefault()}}>
        <div>
         <input size='40' style={{fontSize:20}}placeholder='Enter Text' onChange={(e)=>setText(e.target.value)}></input>
         <button className='btn btn1' size='40' style={{fontSize:20}} onClick={handleSubmit} >Send</button>
        </div>
      </form>
      </div>
      }

    {mode == 'PHOTO' &&
      <div>
         <Bar options={options} data={data} />
      <div className='horizontalDiv'>
        
      <form  onSubmit={(e)=>{e.preventDefault()}}>
        <div>
          <p style={{"font-weight":"100", color:"black","font-family": "montserrat", "text-transform": "uppercase;"}}>Last Value: {light}</p>
        </div>
      </form>
      </div>
      </div>
    }
      
    </div>  
    </div>
  );
}

export default App;
