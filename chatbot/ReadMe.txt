npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
Modify the content array in tailwind.config.js to include all files where you will be using Tailwind classes. 
This allows Tailwind to scan these files and generate only the necessary CSS.

Open your src/index.css (or equivalent main CSS file) and add the following Tailwind directives 
at the very top:

/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
6. Start your development server:
Code

npm start