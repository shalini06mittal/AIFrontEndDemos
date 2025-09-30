import { GoogleGenerativeAI } from "@google/generative-ai";
import { useState, useEffect } from "react";
import Loader from './Loader'

function Summary({file}) {

  const genAI = new GoogleGenerativeAI("REPLACE YOUR API KEY");
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const [summary,setSummary] = useState("");
  const [status, setStatus] = useState("idle");

  async function getSummary(){
    setStatus('loading');

    try {
      const result = await model.generateContent([
        {
            inlineData: {
                data: file.file,
                mimeType: file.type,
            },
        },
        `
          Summarize the document
          in one short paragraph (less than 100 words).
          Use just plain text with no markdowns or html tags
        `,
      ]);
      setStatus('success');
      setSummary(result.response.text());
    } catch (error) {
      console.log(error)
      setStatus('error');
    }
  }

  useEffect(()=>{
    if(status === 'idle'){
      getSummary();
    }
  },[status]);


    return (
      <section className="summary">

        <img src={file.imageUrl} alt="Preview Image" />
        <h2>Summary!!</h2>
        {
          status === 'loading' ?
          <Loader /> :
          status === 'success' ?
          <p>{summary}</p> :
          status === 'error' ?
          <p>Error getting the summary</p> :
          ''
        }
      </section>
    )
  }
  
  export default Summary
  