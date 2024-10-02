# AI Text Summarizer Extension

An AI-powered text summarizer that allows you to condense large amounts of text directly from your browser.

## Features

- **AI Summarization**: Utilize state-of-the-art AI technology to summarize large texts quickly and efficiently.
- **Flexible Summary Length**: Choose between brief, medium, and long summaries according to your needs.
- **User-Friendly Interface**: Simple and easy-to-use interface integrated into the browser for seamless text summarization.
- **Clipboard Copy**: Easily copy the summarized content to your clipboard for quick use.

## Installation

### Prerequisites

- Google Chrome or any Chromium-based browser.

### Steps

1. Clone or download this repository.
   
   ```bash
   git clone https://github.com/yourusername/summarizer-extension.git
     ```

2. Run npm install and npm run build
   ```bash
   npm i
   npm run build
     ```
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer Mode** in the top right corner.
5. Click **Load unpacked** and select the folder containing the dist folder.
6. The extension should now appear in your browser's toolbar.

## Usage

1. Click on the **AI Text Summarizer** icon in your browser’s toolbar.
2. Enter the text you wish to summarize in the input box.
3. Select the summary length: **Brief**, **Medium**, or **Long**.
4. Click the **Summarize** button and wait for the AI to generate the summary.
5. Copy the summarized text using the copy button if needed.

## Permissions

This extension requires the following permissions:

- **Storage**: To save user preferences such as summary length and historical data.
- **Tabs**: To access active browser tabs and execute the summarization functionality based on the content visible to the user.
- **WebNavigation**: To detect page changes and ensure the summarization functionality adapts accordingly.

## Content Security Policy (CSP)

The extension uses external resources, such as fonts and scripts from trusted sources like `cdnjs.cloudflare.com`. The policy is set to ensure security while loading these resources.

```json
"content_security_policy": {
  "extension_pages": "style-src-elem 'self' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; script-src 'self' 'wasm-unsafe-eval'; default-src 'self' data:; connect-src 'self' data: https://huggingface.co https://cdn-lfs.huggingface.co https://cdn-lfs-us-1.huggingface.co https://cdn-lfs-us-1.hf.co https://raw.githubusercontent.com"
}
```

## Contributing

We welcome contributions to improve the AI Text Summarizer. If you'd like to contribute, please fork the repository and submit a pull request.

This extension leverages WebGPU to efficiently process AI models directly in the browser. The summarization model is cached for enhanced performance, reducing load times and improving user experience during consecutive uses.

The underlying AI technology is powered by [web-llm](https://github.com/mlc-ai/web-llm/tree/main), an open-source project that allows machine learning inference using WebGPU.

### Steps for contributing:

1. Fork this repository.
2. Create a branch for your feature.
3. Make your changes.
4. Submit a pull request, detailing what you've changed or added.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

## Acknowledgements

- AI summarization powered by Hugging Face.
- Special thanks to all open-source contributors who helped build the libraries and tools used in this extension.

## Contact

For any inquiries or issues, please reach out to [Arthur G. Breguez](https://arthurbreguez.info).
