


# Docker Image Security Scanner

A proof-of-concept tool for scanning Docker Hub images to detect sensitive credential leaks in configuration files.

## Overview

This tool helps identify security vulnerabilities in Docker images where developers may have unknowingly included sensitive credentials in configuration files (like `.env` files). It operates as a set of stateless microservices using Redis queues to coordinate the scanning process.

## Architecture

The system works through a pipeline of microservices:

1. **Keyword Scanner**: Searches Docker Hub for usernames based on keywords
2. **Username Scanner**: Retrieves image names for each username
3. **Image Scanner**: Extracts available tags for each image
4. **Tag Scanner**: Pulls image `.tar` files and scans for sensitive files
5. **Alert System**: Sends notifications when credentials are detected (currently via Telegram)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Keyword   │    │  Username   │    │    Image    │    │     Tag     │    │    Alert    │
│   Scanner   │───►│   Scanner   │───►│   Scanner   │───►│   Scanner   │───►│   System    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                      Redis Queues                                        │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```
## Diagram
<details style="border: 1px solid #ddd; padding: 10px; margin:20px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
  <summary style="font-size: 18px; cursor: pointer; font-weight: bold; color: #4A90E2;">
    ▶️ Click to show/hide diagram
  </summary>

## Diagram
![Alt text](./diagram.png?raw=true "Diagram")

## Example
![Alt text](./examples.png?raw=true "Diagram")
</details>
## How It Works

1. Keywords are added to a Redis queue
2. Usernames are extracted from Docker Hub based on these keywords
3. Images are discovered for each username
4. Tags are extracted for each image
5. Images are pulled and scanned for sensitive files
6. Alerts are sent when credentials are detected

## Components

- `src/getImages.ts`: Retrieves images for a given username
- `src/getIndexData.ts`: Extracts initial data from Docker Hub
- `src/getTags.ts`: Retrieves available tags for an image
- `src/getRedis.ts`: Handles Redis queue operations
- `src/logger.ts`: Manages logging and alerts
- `src/index.ts`: Main application entry point

## Setup and Usage

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Redis connection in your environment
4. Set up Telegram webhook (optional)
5. Start the service: `npm start`

## Configuration

Create a `.env` file with the following variables:

```
REDIS_URL=your_redis_connection_string
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

## Disclaimer

**IMPORTANT**: This tool is provided as a proof-of-concept for educational and security research purposes only. It should be used exclusively to scan your own Docker images or those you have explicit permission to scan. Unauthorized scanning of third-party Docker images may violate terms of service, privacy laws, and computer fraud statutes.

The authors of this tool are not responsible for any misuse or damage caused by this software. Use responsibly and ethically.

## Legal Considerations

- Always obtain proper authorization before scanning any Docker images
- Do not use this tool to access, download, or expose sensitive information from third parties
- Report vulnerabilities responsibly to the image owners
- Follow responsible disclosure practices

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
