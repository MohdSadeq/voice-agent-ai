# redONE Voice Agent AI

A modern, real-time voice AI assistant built with Next.js and the latest AI technologies, designed to provide natural and intelligent voice interactions.

## Features

- 🎙️ Real-time voice interaction with low latency
- 🧠 Advanced AI-powered conversations
- 🎨 Sleek, responsive UI with dark/light mode
- ⚡ Optimized for performance
- 🔒 Secure and private conversations
- 🌐 Multi-language support

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, React 18
- **Styling**: Tailwind CSS with custom theming
- **AI Integration**: OpenAI Realtime API
- **State Management**: React Context API
- **UI Components**: Radix UI Primitives
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm (v7+) or yarn (v1.22+)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MohdSadeq/voice-agent-ai.git
   cd voice-agent-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # App router pages and routes
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   └── agentConfigs/       # AI agent configurations
└── public/                 # Static assets
```

## Customization

### Theming

Customize the application's appearance by modifying the theme variables in `src/app/globals.css`:

```css
:root {
  --background: 0 0% 7%;
  --foreground: 0 0% 98%;
  --primary: 0 84% 55%;
  --accent: 0 72% 51%;
  /* ... other variables ... */
}
```

### Adding New Features

1. **Create a new page**:
   - Add a new folder in `src/app` with a `page.tsx` file
   - The route will be automatically created based on the folder name

2. **Add a new component**:
   - Create a new file in `src/app/components`
   - Export the component and import it where needed

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMohdSadeq%2Fvoice-agent-ai)

1. Fork this repository
2. Create a new Vercel project and import your forked repository
3. Add your `OPENAI_API_KEY` to the environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

Mohd Sadeq - [@your_twitter](https://twitter.com/your_twitter) - your.email@example.com

Project Link: [https://github.com/MohdSadeq/voice-agent-ai](https://github.com/MohdSadeq/voice-agent-ai)

## Assets

```json
{
  "images": {
    "data_icon": "https://www.redonemobile.com.my/wp-content/uploads/2021/12/Asset-2.png",
    "calls_icon": "https://www.redonemobile.com.my/wp-content/uploads/2021/12/Asset-3.png",
    "vas_icon": "https://www.redonemobile.com.my/wp-content/uploads/2021/12/Asset-5-2.png",
    "free_phone_icon": "https://www.redonemobile.com.my/wp-content/uploads/2024/12/card-home-page-1-10.png"
  }
}
```
