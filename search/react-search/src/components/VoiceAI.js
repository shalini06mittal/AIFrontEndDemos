import React, { useState, useEffect } from "react";
const VoiceAI = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  
  // Speech Recognition Setup
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = async (event) => {
        const spokenText = event.results[0][0].transcript;
        setTranscript(spokenText);
        
        
        // Send to AI
        const response = await processWithAI(spokenText);
        setAiResponse(response);
        
        // Convert AI response to speech
        speakText(response);
      };
      
      recognition.start();
    }
  };
  async function handleFileUpload(event){
        const fileUpload = await event.target.files[0]//.arrayBuffer();
        console.log(fileUpload)
        console.log(fileUpload.name)
         const response = await processWithAI(fileUpload.name)
         setAiResponse(response);
        
        // Convert AI response to speech
        speakText(response);
      }
  
  const processWithAI = async (text) => {
    console.log(text)
    console.log(process.env.REACT_APP_OPENAI_API_KEY);
    
    const form = new FormData();
      form.append('model', 'Whisper-Large-v3');
      // form.append('language', 'spanish');
      // form.append('response_format', 'json');
      form.append('file',  text);
      // form.append('stream', 'true');
      console.log(form)
    
    const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },

      // body: JSON.stringify({
      //   model: 'gpt-3.5-turbo',
      //   messages: [{ role: 'user', content: text }],
      //   max_tokens: 150
      // })
       body: JSON.stringify({
        "model": "Llama-4-Maverick-17B-128E-Instruct",
        messages: [{ role: 'user', content: text }],
        
      })
        });
    
    console.log('get response', response)
    const data = await response.json();
    console.log(data)
    return data.choices[0].message.content;
  };
  
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

const stopSpeaking = ()=>{
  speechSynthesis.cancel();
  console.log("Speech synthesis stopped.");
  setIsSpeaking(false);
}
  
  return (
    <div className="voice-ai">
      <button 
        onClick={startListening} 
        disabled={isListening || isSpeaking}
        className={`voice-button ${isListening ? 'listening' : ''}`}
      >
        {isListening ? 'Listening...' : 'Start Voice Chat'}
      </button>
       <div>
         <input 
            type="file" 
            accept=".wav, .mp3, .ogg"
            onChange={handleFileUpload}
            />
        </div>
        <div> <button 
        onClick={stopSpeaking} >Stop</button>
        <button 
        onClick={()=>speakText(aiResponse)} >Start</button></div>
      {transcript && (
        <div className="transcript">
          <strong>You said:</strong> {transcript}
        </div>
      )}
      
      {aiResponse && (
        <div className="ai-response">
          <strong>AI Response:</strong> {aiResponse}
        </div>
      )}
      
      {isSpeaking && <div className="speaking">AI is speaking...</div>}
    </div>
  );
};

export default VoiceAI;