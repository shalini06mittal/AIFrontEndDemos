import "./App.css";
import { useEffect, useState } from "react";
//https://github.com/Thabish-Kader/Ai-input-suggester/blob/main/app/page.tsx
function AutoCompletion() {
  const [userInput, setUserInput] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);

  // Model from : https://huggingface.co/mistralai/Mistral-7B-v0.1?text=My+name+is+Thomas+and+my+main+goal+is+to+help+you%2C+the+home+cook+or+baker.++I+have+a+passion+for+cooking+this+is+so+natural+for+me%2C+I+don%E2%80%99t+have+to+really+think+about+it.++Some+people+can+sing+thua+s
  async function query(data){
  	try {
  		const response = await fetch(
  			"https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1",
  			{
  				headers: {
  					Authorization: `Bearer ${process.env.REACT_APP_HF_TOKEN}`,
  					"Content-Type": "application/json",
  				},
  				method: "POST",
  				body: JSON.stringify(data),
  			}
  		);
  		const result = await response.json();
  		return result;
  	} catch (error) {
  		return "";
  	}
  }

  const getSuggestion = async () => {
		const huggingFaceresponse = await query({
			inputs: userInput,
		});
		const aiSuggestion = huggingFaceresponse[0]?.generated_text;
		console.log(aiSuggestion);
		const newAiSuggestion = aiSuggestion?.replace(/\n/g, "");

		setSuggestion(newAiSuggestion);
	};

	const handleInputChange = (e) => {
		const inputText = e.target.value;
		setUserInput(inputText);
		setSuggestion("");
		if (typingTimeout) {
			clearTimeout(typingTimeout);
		}

		if (inputText.length > 0) {
			const newTypingTimeout = setTimeout(() => {
				getSuggestion();
			}, 3000);

			setTypingTimeout(newTypingTimeout);
		}
	};

	const handleTabKeyPress = (e) => {
		if (e.key === "Tab") {
			e.preventDefault();
			setUserInput(suggestion);
			setSuggestion("");
		}
	};
  useEffect(() => {
		return () => {
			if (typingTimeout) {
				clearTimeout(typingTimeout);
			}
		};
	}, []);
  return (
    <div className="App">
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
           onKeyDown={handleTabKeyPress}
          />
          <p className="mt-2" id="response">
            {suggestion}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AutoCompletion;
