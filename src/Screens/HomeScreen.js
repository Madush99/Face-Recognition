import React from 'react'
import '../getStarted.css';
import { Link } from "react-router-dom";

export default function GetStarted() {
    return (
        // <div className='get-centered'>
        //     <Button
        //         variant='contained'
        //         style={{ padding: '30px 50px', borderRadius: '25px' }}
        //         onClick={() => window.location.href = '/signup'}>
        //         Get Started
        //     </Button>
        // </div>
        <div className="">
        <div className="landing row justify-content-center text-right bg-image">
              <div className="col-md-9 my-auto" style={{ borderRight: '8px solid white' }}>
                    <h2 style={{ color: "white", fontSize: "110px" }}>BioMetric</h2>
                    <Link to="/authscreen">
                          <button className='btn btn-outline-warning'>Get Started</button>
                    </Link>
              </div>



        </div>

  </div>
    )
}