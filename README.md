<h1 align="center">✨ SYNTHIA</h1>
<h3 align="center">AI-Powered Synthetic Dataset Generator</h3>

<p align="center">
Generate realistic <b>tabular</b>, <b>text</b>, and <b>image</b> datasets using AI and smart data generation techniques.
</p>

<p align="center">
Built with React, Express, and AI APIs to help developers, researchers, and students quickly create synthetic datasets.
</p>

<hr>

<h2>🚀 Features</h2>

<h3>📊 Tabular Data Generation</h3>
<ul>
<li>Create custom schemas (columns, types, ranges)</li>
<li>Smart data generation (names, cities, emails, etc.)</li>
<li>Column correlations (example: age → risk score)</li>
<li>Noise injection for realistic datasets</li>
<li>Automatic dataset statistics</li>
</ul>

<h3>📝 Text Data Generation</h3>
<ul>
<li>AI-powered text generation using NVIDIA NIM</li>
<li>Configurable topic, tone, and length</li>
<li>Structured JSON output</li>
<li>Automatic fallback generation if API fails</li>
</ul>

<h3>🖼️ Image Dataset Generation</h3>
<ul>
<li>Fetches real images using the Unsplash API</li>
<li>Query variation for diverse datasets</li>
<li>Automatic placeholder generation fallback</li>
<li>Image metadata and credit information</li>
</ul>

<hr>

<h2>🧠 Tech Stack</h2>

<h3>Frontend</h3>
<ul>
<li>React</li>
<li>Vite</li>
<li>TailwindCSS</li>
<li>Recharts</li>
<li>React Router</li>
</ul>

<h3>Backend</h3>
<ul>
<li>Node.js</li>
<li>Express.js</li>
<li>NVIDIA NIM API</li>
<li>Unsplash API</li>
</ul>

<hr>

<h2>🏗️ Architecture</h2>

<pre>
Frontend (React)
       ↓
   API Requests
       ↓
Backend (Express)
       ↓
 AI APIs (NVIDIA NIM / Unsplash)
</pre>

<p>
This architecture ensures:
</p>

<ul>
<li>Secure API key handling</li>
<li>Clean frontend/backend separation</li>
<li>Scalable dataset generation</li>
</ul>

<hr>

<h2>📦 Installation</h2>

<h3>1. Clone the Repository</h3>

<pre>
git clone https://github.com/yourusername/synthia.git
cd synthia
</pre>

<h3>2. Install Dependencies</h3>

<pre>
npm install
</pre>

<h3>3. Setup Environment Variables</h3>

Create a <b>.env</b> file in the root directory:

<pre>
NVIDIA_API_KEY=your_nvidia_api_key
UNSPLASH_ACCESS_KEY=your_unsplash_key
PORT=4000
</pre>

<h3>4. Run the Application</h3>

Start backend:

<pre>
npm run server
</pre>

Start frontend:

<pre>
npm run dev
</pre>

Open in browser:

<pre>
http://localhost:5173
</pre>

<hr>

<h2>⚙️ API Endpoints</h2>

<h3>Generate Tabular Dataset</h3>

<pre>
POST /api/generate-tabular
</pre>

<h3>Generate Text Dataset</h3>

<pre>
POST /api/generate-text
</pre>

<h3>Generate Image Dataset</h3>

<pre>
POST /api/generate-image
</pre>

<hr>

<h2>📁 Project Structure</h2>

<pre>
synthia/
│
├── backend/
│   └── engine/
│       ├── tabularGenerator.js
│       ├── textGenerator.js
│       └── imageGenerator.js
│
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── context/
│
├── server.js
├── vite.config.js
└── package.json
</pre>

<hr>

<h2>💡 Highlights</h2>

<ul>
<li>Hybrid AI + rule-based dataset generation</li>
<li>Batch LLM requests for performance</li>
<li>Clean SaaS-style UI</li>
<li>Fallback generators when APIs fail</li>
<li>Realistic synthetic datasets</li>
</ul>

<hr>

<h2>📈 Future Improvements</h2>

<ul>
<li>Dataset export (CSV, JSON, Excel)</li>
<li>User authentication & saved datasets</li>
<li>Advanced correlations</li>
<li>Dataset editing interface</li>
<li>Multiple AI model integrations</li>
</ul>

<hr>

<h2>🤝 Contributing</h2>

Contributions are welcome. Feel free to fork the repository and submit a pull request.

<hr>

<h2>📄 License</h2>

This project is licensed under the MIT License.

<hr>

<h3 align="center">Built with ❤️ to simplify synthetic data generation</h3>
