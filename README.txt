WHERE YOUR CHART LANDS: SETUP WITH THE ASTROLOGY GUIDE

The map, readings and cities work anywhere, including Netlify Drop.
The "Ask about your chart" guide needs a small server function, and Netlify
only runs functions for sites deployed from GitHub (not drag-and-drop).

1. Get a Claude API key
   - Sign in at platform.claude.com, add a payment method, create an API key.
   - Set a monthly spend limit there. Anyone who visits your site can ask
     questions, and each answer is billed to your key.

2. Put this folder on GitHub (no coding needed)
   - Make a free GitHub account, click New repository, give it a name.
   - Click "uploading an existing file" and drag in everything in this folder:
     index.html, netlify.toml, README.txt and the netlify folder.
   - Click Commit changes.

3. Connect it to Netlify
   - In Netlify: Add new project > Import an existing project > GitHub.
   - Pick the repository. Leave the build command empty. Click Deploy.

4. Add the key
   - In the project: Project configuration > Environment variables > Add a variable.
   - Key: ANTHROPIC_API_KEY   Value: your key
   - Optional: CLAUDE_MODEL to choose a different Claude model.
   - Go to Deploys > Trigger deploy > Deploy project.

Updating later: upload the changed file to the same GitHub repository.
Netlify redeploys on its own.
