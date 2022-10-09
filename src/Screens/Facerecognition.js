import React from 'react'
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { unstable_HistoryRouter, redirect, useNavigate } from 'react-router-dom'
import { render } from '@testing-library/react';
import PersonDetail from './PersonDetail';
import AuthDetails from './AuthDetails';
const Facerecognition = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [captureVideo, setCaptureVideo] = useState(false);

  
  const videoRef = useRef();
  const videoHeight = 480;
  const videoWidth = 640;
  const canvasRef = useRef();
  let navigate = useNavigate();
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';

      Promise.all([
        //faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL)
      ]).then(setModelsLoaded(true));
    }
    loadModels();

  }, []);

  const startVideo = () => {
    setCaptureVideo(true);
    navigator.mediaDevices
      .getUserMedia({ video: { width: 300 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch(err => {
        console.error("error:", err);
      });
  }

  const handleVideoOnPlay = async () => {

    const labeledDescriptors = await loadLabeledImages()
    console.log(labeledDescriptors)
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.7)


    setInterval(async () => {
      if (canvasRef && canvasRef.current) {
        canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
        const displaySize = {
          width: videoWidth,
          height: videoHeight
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();

        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
        canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
        // canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);

        //   const results = resizedDetections.map((fd) => {
        //     return faceMatcher.findBestMatch(fd.descriptor)
        // })
        // results.forEach( (result, i) => {
        //     const box = resizedDetections[i].detection.box
        //     const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        //     drawBox.draw(canvasRef.current)

        // })
        const bestMatch = faceMatcher.findBestMatch(resizedDetections.descriptor)
        console.log("Best Match", bestMatch._label)
        if (resizedDetections) {

          const box = resizedDetections.detection.box
          const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.toString() } )
          drawBox.draw(canvasRef.current)
          console.log("Matching", bestMatch.toString())
        }


        if (bestMatch) {
          // handleOnClick();
          // <PersonDetail
          //   details={bestMatch.string()}
          // />  
          // setTimeout(() => {
            
          // }, 1000);
          if(bestMatch._label === "unknown"){
           // start()
          }else{
            start()
            closeWebcam()
            //window.location.reload();
           // handleOnClick()
          }
         
         
          return (
            render(
              <div>
                <h1>
                  {/* <PersonDetail
                    details={bestMatch._label}
                  /> */}
                  {
                    <AuthDetails 
                      details={bestMatch._label}
                    />
                  }
                  {bestMatch._label}
                </h1>
              </div>
            )
 
          )

        }

      }
    }, 100)
  }


  const handleOnClick = () => {

    //  <Navigate to ="/personScreen"></Navigate>
    return navigate("/personScreen")
  }
  let audio = new Audio(process.env.PUBLIC_URL+ `Authenticated.mp3`);

  const start = () => {
    audio.play()
  }
  function loadLabeledImages() {
    const labels = ['Madusanka Gajadeera', 'Helitha', 'Shamila', 'Avindika', 'Sayuru', 'Shehara', 'Agasthi', 'Isira'] // for WebCam
    return Promise.all(
      labels.map(async (label) => {
        const descriptions = []
        for (let i = 1; i <= 10; i++) {
          const imgUrl = process.env.PUBLIC_URL + `/labeled_images/${label}/${i}.jpg`;
          //  console.log(imgUrl)
          //let file = await fetch(url).then(r => r.blob()).then(blobFile => new File([blobFile], "fileNameGoesHere", { type: "image/png" }))
          const img = await faceapi.fetchImage(imgUrl)
          //console.log(img)
          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          console.log(label + i + JSON.stringify(detections))
          descriptions.push(detections.descriptor)
        }
        // document.body.append(label+' Faces Loaded | ')
        console.log(label + 'fcaes loadedm |')
        console.log("Detect", new faceapi.LabeledFaceDescriptors(label, descriptions))

        return new faceapi.LabeledFaceDescriptors(label, descriptions)

      })
    )
  }

  const closeWebcam = () => {
    videoRef.current.pause();
    videoRef.current.srcObject.getTracks()[0].stop();
    setCaptureVideo(false);
    
  }

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '10px' }}>
        {
          captureVideo && modelsLoaded ?
            <button onClick={closeWebcam} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '25px', border: 'none', borderRadius: '10px' }}>
              Close Webcam
            </button>
            :
            <button onClick={startVideo} style={{ cursor: 'pointer', backgroundColor: 'green', color: 'white', padding: '15px', fontSize: '25px', border: 'none', borderRadius: '10px' }}>
              Open Webcam
            </button>
        }
      </div>
      {
        captureVideo ?
          modelsLoaded ?
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
                <video ref={videoRef} height={videoHeight} width={videoWidth} onPlay={handleVideoOnPlay} style={{ borderRadius: '10px' }} />
                <canvas ref={canvasRef} style={{ position: 'absolute' }} />

              </div>
            </div>
            :
            <div>loading...</div>
          :
          <>
          </>
      }
      <button onClick={handleOnClick}>Redirect</button>
    </div>
  )
}

export default Facerecognition