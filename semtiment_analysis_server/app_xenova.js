

    // Or, for the default model:
// const summarizer = await pipeline('summarization');

/**
 * Personally, I found `Xenova/bart-large-cnn` and `Xenova/distilbart-cnn-6–6` produced the best results, 
 * but were the slowest and required downloading over a GB of data. 
 * This is something to keep in mind when selecting a model. You’ll want to balance accuracy with speed and size.



// or

const summarization = await pipeline('summarization', 'Xenova/bart-large-cnn');
 */
// const summarization = await pipeline(
//     'summarization', // task
//     'Xenova/t5-small' // model
// );

import {pipeline} from '@xenova/transformers';

import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';
import cors from 'cors';

const filename = fileURLToPath(import.meta.url);
console.log(filename)
const dirname = path.dirname(filename);
console.log(dirname);

const pipe =await pipeline('sentiment-analysis'); // xenova

// const summarization = await pipeline('summarization');

// const result = await summarization("As a fourth-year ophthalmology resident at Emory University School of Medicine, Riley Lyons' biggest responsibilities include triage: When a patient comes in with an eye-related complaint, Lyons must make an immediate assessment of its urgency. He often finds patients have already turned to Dr. Google. Online, Lyons said, they are likely to find that any number of terrible things could be going on based on the symptoms that they're experiencing. So, when two of Lyons' fellow ophthalmologists at Emory came to him and suggested evaluating the accuracy of the AI chatbot ChatGPT in diagnosing eye-related complaints, he jumped at the chance.", 
//     {
//         min_length: 50, max_length: 250,
//     });
// console.log(result[0].summary_text);
console.log('gettong response')
console.log(await pipe('I am sad'));
console.log(await pipe('I am happy'));

const app = express();

app.use(express.json());
app.use('/public', express.static('./public'))
app.use(cors());

app.post('/api', async (req, res)=>{
    console.log('post request')
    const result = await pipe(req.body.text);
    res.json(result);
});

app.get('/', (req, resp)=>{
    resp.sendFile(path.join(dirname, 'index.html'));
});

app.listen(3002, ()=>{
    console.log("Server listening on port : 3002");
    
})
