import { useState, useEffect } from "react";
import "./App.css";
import ReactPlayer from "react-player";
import Confetti from 'react-confetti'

let audioCtx;
let analyser;
let dataArray;
let stream;
let rafId;

function App() {
  let maxVolume = 0;
  const [message, setMessage] = useState(
    "make a wish and blow the candle :D!"
  );
  const [blown, setBlown] = useState(false);
  const [celebrate, setCelebrate] = useState(0);
  const [open, setOpen] = useState(false);

  const VOLUME_THRESHOLD = 35; // sensitivity

  const setupAudio = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      dataArray = new Uint8Array(bufferLength);

      detectVolume();
    } catch (err) {
      console.error("Microphone setup error:", err);
    }
  };

  const detectVolume = () => {
    if (!analyser || !dataArray) return;

    analyser.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += Math.abs(dataArray[i] - 128);
    }
    const avg = sum / dataArray.length;

    console.log("Current volume:", avg.toFixed(2));

    if (avg > VOLUME_THRESHOLD && !blown) {
      //   setTimeout(() => {
      //   setBlown(true);
      // }, 500);
      setBlown(true);
      setTimeout(setOpen(true), 1000);
      // setMessage("You blew out the candle!");
      console.log("Blow detected");
    }

    rafId = requestAnimationFrame(detectVolume);
  };

  useEffect(() => {
    setupAudio();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
      if (audioCtx) audioCtx.close();
    };
  }, []);

  return (
    <div className="App">
      <div className="message-container shadowed-text">
        <h1 className="main-message">{message}</h1>
        <p>(blow into your device microphone)</p>
      </div>
      <div className="cake-container">
        <div className="candle-area">
          <div className={`purple-candle ${blown ? "blown" : ""}`}></div>
        </div>
        <div className="cake"></div>
      </div>
      {blown && open ? <div className="present-screen">
        <div className="celebration-screen"><Confetti className="confetti" opacity={celebrate}/></div>
        <h1 className="bday-message">HAPPY BIRTHDAY, NINA</h1>
        <ReactPlayer src="https://www.youtube.com/watch?v=gPhskAcoTBQ" volume={1} width="100%" className="video" loop={true} onPlaying={()=> setCelebrate(1)} onPause={() => setCelebrate(0)}></ReactPlayer>
        <button onClick={()=> setBlown(false)} className="replay-button">REPLAY</button>

      </div> : <div></div>}
    </div>
  );
}

export default App;
