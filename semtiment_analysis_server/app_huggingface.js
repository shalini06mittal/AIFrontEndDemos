import {pipeline} from '@huggingface/transformers';

import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3000;
console.log(`Application running on port ${port}`);
console.log(process.env.DATABASE_URL)
console.log(process.env.API_KEY)

import express from 'express';
import {fileURLToPath} from 'url';
import path from 'path';
import cors from 'cors';

const filename = fileURLToPath(import.meta.url);
console.log(filename)
const dirname = path.dirname(filename);
console.log(dirname);

const pipe =await pipeline('sentiment-analysis'); // huggingface

console.log('gettong response')
console.log(await pipe('I am sad'));
console.log(await pipe('I am happy'));

// const classifier = await pipeline('summarization');
// console.log(await classifier("Paris is the capital and most populous city of France, with an estimated population of 2,175,601 residents as of 2018, in an area of more than 105 square kilometres (41 square miles). The City of Paris is the centre and seat of government of the region and province of Île-de-France, or Paris Region, which has an estimated population of 12,174,880, or about 18 percent of the population of France as of 2017."))

// [{ "summary_text": " Paris is the capital and most populous city of France..." }]


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

app.listen(port, ()=>{
    console.log(`Server listening on port : ${port}`);
    
})
