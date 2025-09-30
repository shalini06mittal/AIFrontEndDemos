
npm i init -y

Dependencies
npm i express @xenova/transformers
npm i @huggingface/transformers express

//https://medium.com/@govindarajpriyanthan/text-summarization-with-hugging-face-transformers-2e9abf29c52f 
//https://github.com/huggingface/transformers.js/blob/main/examples/node/esm/app.js
//https://huggingface.co/docs/transformers.js/pipelines#tasks
// https://huggingface.co/docs/transformers.js/en/index#examples


// https://bootswatch.com/

Environment configuration

install dotenv.
npm i dotenv

Create a .env file: In the root of your project, create a file named .env and define your environment variables within it.

    PORT=3000
    DATABASE_URL=mongodb://localhost:27017/mydb
    API_KEY=your_secret_api_key

Load the .env file in your application: At the very beginning of your main application file (e.g., index.js or app.js), 
require and configure dotenv.

ES Modules (Node.js versions supporting ES Modules, typically with type: "module" in package.json):

    import dotenv from 'dotenv';
    dotenv.config();
    // Your other imports and application logic
    const port = process.env.PORT || 3000;
    console.log(`Application running on port ${port}`);

CommonJS (older Node.js versions or if type: "module" is not set in package.json):

    require('dotenv').config();

    const port = process.env.PORT || 8080;
    const dbUrl = process.env.DATABASE_URL;

    console.log(`Server running on port ${port}`);
    console.log(`Connecting to database: ${dbUrl}`);