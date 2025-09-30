import "./App.css";
import { useEffect, useState } from "react";
import AutoCompletion from "./AutoCompletion";

function App() {
  const [userInput, setUserInput] = useState("");
  const [suggestion, setSuggestion] = useState("");

  //https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp
  async function query(data) {
    console.log('query ', data)
    const input = {
        messages: [
          {
            role: "user",
            content: data,
          },
        ],
        model: "deepseek-ai/DeepSeek-V3.2-Exp:novita",
    }
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(input),
      }
    );
    const result = await response.json();
    return result;
  }

  // query({
  //   messages: [
  //     {
  //       role: "user",
  //       content: "What is the capital of France?",
  //     },
  //   ],
  //   model: "deepseek-ai/DeepSeek-V3.2-Exp:novita",
  // }).then((response) => {
  //  // console.log('1',JSON.stringify(response));
  // });

  const getSuggestion = async () => {
    console.log('get suggestion')
    const huggingFaceresponse = await query(userInput);
    const aiSuggestion = huggingFaceresponse['choices'][0]['message']['content'];
    console.log(aiSuggestion);
    setSuggestion(aiSuggestion);
    setUserInput('');
  };

  const handleInputChange = (e) => {
    const inputText = e.target.value;
    setUserInput(inputText);
  };
  const handleEnterKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      getSuggestion();
    }
  };
  return (
    <div className="App">
      {/* <AutoCompletion/> */}
      <div className="col-lg-6 col-10 mx-auto py-2 my-2">
        <div className="card p-4">
          <h3 className="text-primary-emphasis">AI Suggestion</h3>

          <textarea
            id="long-text-input"
            placeholder="Enter text"
            className="form-control mb-3"
            value={userInput}
            rows={5}
            onChange={handleInputChange}
           onKeyDown={handleEnterKeyPress}
          />
          <p className="mt-2" id="response">
            {suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
