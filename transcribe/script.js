import { InferenceClient } from 'https://esm.sh/@huggingface/inference';

// Access the token from Hugging Face Spaces secrets
// const HF_TOKEN = window.huggingface?.variables?.HF_TOKEN;
// Or if you're running locally, you can set it as an environment variable
const HF_TOKEN ='your token';

const show = el => el.style.display = 'block';
const hide = (...els) => els.forEach(el => el.style.display = 'none');
const showError = msg => {
    const error = document.getElementById('error');
    error.innerHTML = msg;
    show(error);
};

document.getElementById('file').onchange = async (e) => {
    if (!e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    show(document.getElementById('loading'));
    hide(document.getElementById('results'), document.getElementById('error'));
    
    try {
        const transcript = await transcribe(file);
        const summary = await summarize(transcript);

        document.getElementById('transcript').textContent = transcript;
        document.getElementById('summary').textContent = summary;
        
        hide(document.getElementById('loading'));
        show(document.getElementById('results'));
    } catch (error) {
        hide(document.getElementById('loading'));
        showError(`Error: ${error.message}`);
    }
};

// import { InferenceClient } from 'https://esm.sh/@huggingface/inference';

async function transcribe(file) {
    const client = new InferenceClient(HF_TOKEN);

    const output = await client.automaticSpeechRecognition({
        data: file,
        model: "openai/whisper-large-v3-turbo",
        provider: "auto"
    });
    
    return output.text || output || 'Transcription completed';
}

async function summarize(transcript) {
    const client = new InferenceClient(HF_TOKEN);

    const prompt = `Analyze this meeting transcript and provide:
    1. A concise summary of key points
    2. Action items with responsible parties
    3. Important decisions made

    Transcript: ${transcript}

    Format with clear sections:
    ## Summary
    ## Action Items  
    ## Decisions Made`;

    const response = await client.chatCompletion({
        model: "deepseek-ai/DeepSeek-R1-0528",
        messages: [
            {
                role: "user", 
                content: prompt
            }
        ],
        max_tokens: 1000
    }, {
        provider: "auto"
    });
    
    return response.choices?.[0]?.message?.content || response || 'No summary available';
}



async function query(data) {
	const response = await fetch(
		"https://router.huggingface.co/fal-ai/fal-ai/flux/schnell",
		{
			headers: {
				Authorization: `Bearer ${HF_TOKEN}`,
				"Content-Type": "application/json"
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
    console.log(response)
	const result = await response.blob();
	return result;
}
const myImage = document.getElementById('image');

// query({sync_mode: true,
//     prompt: "\"Astronaut riding a horse\"", }).then((response) => {
//         console.log(response)
//             const objectURL = URL.createObjectURL(response);
//             console.log(objectURL)
        
//             myImage.src = objectURL;

//     // Revoke the URL once the image has loaded
//     // myImage.onload = () => {
//     //   URL.revokeObjectURL(objectURL);
//     // };
    
// });

// Assuming you have an <img> tag in your HTML with id="myImage"
// const myImage = document.getElementById('myImage');

// fetch('https://media.istockphoto.com/id/2202196797/photo/loving-couple-organizing-their-home-finances.jpg?s=1024x1024&w=is&k=20&c=5K4UPkvCfWDEqeYwNownuq06UDhF7xEqZzH75BuXOZ8=') // Replace with your image URL
//   .then(response => response.blob())
//   .then(imageBlob => {
//     console.log(imageBlob)
//     const objectURL = URL.createObjectURL(imageBlob);
//     console.log(objectURL)
//     myImage.src = objectURL;

//     // Revoke the URL once the image has loaded
//     myImage.onload = () => {
//       URL.revokeObjectURL(objectURL);
//     };
//   })
//   .catch(error => {
//     console.error('There was an error fetching or displaying the image:', error);
//   });