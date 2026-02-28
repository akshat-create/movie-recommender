🎬 CineMatch — AI Movie Recommendation System
An AI-powered movie recommendation web app that suggests personalized films based on your taste profile. Built with React and powered by LLaMA 3.3 via the Groq API, CineMatch replicates the core concept of a content-based filtering recommender system in an interactive, shareable format.

🚀 Live Demo
[Click here to view the live app](https://movie-recommender-two-peach.vercel.app/)

✨ Features
Preference-based recommendations — Input movies you've enjoyed, select favorite genres, set a mood, and filter by era.
AI-powered engine — Uses LLaMA 3.3 (via Groq) to analyze preferences and return tailored recommendations with similarity reasoning.
Match reasoning — Each recommendation explains why it suits your taste profile, mirroring content-based filtering logic.
Refinement controls — Exclude genres, adjust era preference, and choose how many results to return.
Regenerate — Instantly fetch a fresh set of recommendations with the same preferences.
🛠️ Tech Stack
Layer	Technology
Frontend	React 18, Vite
AI Model	LLaMA 3.3 70B (Versatile)
API Provider	Groq API
Styling	Inline CSS with custom dark theme
Deployment	Vercel
📦 Getting Started
Prerequisites
Node.js v18 or higher
A free Groq API key
Installation
bash
# Clone the repository
git clone https://github.com/your-username/movie-recommender.git
cd movie-recommender

# Install dependencies
npm install

# Create environment file
touch .env
Add your Groq API key to the .env file:

VITE_GROQ_API_KEY=your_groq_api_key_here
bash
# Start the development server
npm run dev
Visit http://localhost:5173 in your browser.

🔐 Environment Variables
Variable	Description
VITE_GROQ_API_KEY	Your Groq API key from console.groq.com
Note: Never commit your .env file. It is excluded from version control via .gitignore.

📁 Project Structure
movie-recommender/
├── public/
├── src/
│   ├── App.jsx        # Main application component
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles
├── .env               # Environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
└── README.md
🌐 Deployment
This project is deployed on Vercel. To deploy your own instance, connect your GitHub repository to Vercel and add VITE_GROQ_API_KEY as an environment variable in the Vercel project settings.

📌 Related Projects
This project is the interactive web implementation of an earlier Python-based recommender system built using Pandas, NumPy, and Scikit-Learn similarity metrics.

📄 License
MIT License. Feel free to use, modify, and distribute this project.

