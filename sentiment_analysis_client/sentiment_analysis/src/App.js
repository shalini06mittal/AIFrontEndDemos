import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {

  const [input, setinput] = useState('happy')
  const [response, setresponse] = useState('Waiting to process...')
    
  const process1 = ()=>{
    //alert('hi');
    console.log(input)
    fetch('/api', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ text: input })
                }).then(res => res.json())
                    .then(res => {
                        const resp = res[0].label === 'POSITIVE' ? 'Pushing P!' : 'Negative vibesdetected';
                        setresponse(resp);
                        setinput('');
                    })
  }
  console.log(process.env.REACT_APP_DATABASE_URL);
  return (
    <div>
     <div className="col-lg-6 col-10 mx-auto py-2 my-2">
        <div className="card p-4">
            <p>Sentiment Analysis</p>
            {/* <form id="form"> */}
                <input type="text" name="input" id="input" className="form-control"
                placeholder='Enter your sentiment' value={input}  onChange={(event)=>setinput(event.target.value)}/>
                <p className="mt-2" id="response">{response}</p>
                <input type="button" value="Process" className="btn btn-primary" onClick={process1}/>
            {/* </form> */}
        </div>
    </div>
    <div className="col-lg-6 col-10 mx-auto py-2 my-2">
        <div className="card p-4">
            <p>Summarization</p>
            <textarea id="long-text-input" placeholder="Enter your copy here..." className="form-control mb-3"></textarea>
            <button id="generate-button" disabled>
                <span id="spinner">🔄</span> Generate Summary
            </button>
            <div id="output-div"></div>
        </div>
    </div>
    </div>
  );
}

export default App;
