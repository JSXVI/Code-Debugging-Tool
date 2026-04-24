# 🌌 Lumina AI (v1.2.0)

**Lumina AI** is a next-generation versatile assistant powered by Google's Gemini neural engine. It combines real-time Google Search grounding with advanced visual context awareness to understand and assist with almost any task—from complex debugging to creative writing and general knowledge.

## ✨ Features

-   **🌟 Versatile Intelligence**: Understands any topic with ease, moving beyond just code debugging to a full-spectrum assistant.
-   **🔍 Neural Analysis**: Detect syntax errors, logic flaws, and potential bugs in seconds, or analyze any text for deep insights.
-   **🌐 Google Search Grounding**: Access live web information for up-to-date facts and data. Includes clickable source links for transparency.
-   **🖼️ Visual Context Awareness**: Upload images, screenshots, or visual data for instant neural analysis and context-aware responses.
-   **⚡ Real-time Interaction**: Instant, streaming responses powered by the latest Gemini 3 Flash models.
-   **🛡️ Robust Error Handling**: Intelligent error categorization and automatic exponential backoff retries for transient network issues.
-   **⌨️ Enhanced Input**: 
    -   **Large Payloads**: Support for up to 7,000 characters per message.
-   **🎨 Atmospheric UI**: A sleek, dark-themed interface with a responsive sidebar and smooth animations.

## 📜 Changelog (v1.2.0)

### 🚀 Major Updates
-   **Persona Transformation**: Rebranded from "Lumina Debug AI" to **Lumina AI**, shifting from a debugging-centric tool to a versatile, all-purpose assistant.
-   **Neural Engine Optimization**:
    -   Resolved connection (404) and token limit errors by optimizing history management and model routing.
    -   Implemented **Exponential Backoff Retries** for better resilience against network instability.
    -   Added **Intelligent Error Handling** with user-friendly Markdown alerts for rate limits, safety filters, and context limits.

### ✨ New Features
-   **Smart History**: Optimized token usage by limiting context to the last 4 messages and only including images for the most recent prompt.

### 🛠️ UI/UX Improvements
-   **Mobile Sidebar Fix**: Fixed visibility of delete and rename buttons in the chat sidebar for mobile users.
-   **Branding Refresh**: Updated all UI text, metadata, and icons to reflect the new "Lumina AI" identity.
-   **Version Bump**: Updated to v1.2.0 with a refreshed landing screen and feature grid.

## 🛠️ Tech Stack

-   **Frontend**: React 18+, Vite, TypeScript
-   **Styling**: Tailwind CSS
-   **Animations**: Motion (formerly Framer Motion)
-   **Icons**: Lucide React
-   **AI Engine**: Google Gemini API (`@google/genai`)

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn
-   A Google Gemini API Key (Get one [here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/lumina-debug-ai.git
    cd lumina-debug-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Start the development server**:
    ```bash
    npm run dev
    ```

5.  **Build for production**:
    ```bash
    npm run build
    ```

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for more details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

---

Built with ❤️ by [Your Name/Organization]
