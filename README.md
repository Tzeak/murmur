# Murmur - Microblogging PWA

A progressive web application for microblogging with push notifications and contact tagging.

## Features

- Create and view microblog posts
- Tag contacts using @ symbol
- Push notifications every 1.5 hours asking "What are you doing?"
- Reply to notifications directly
- Export all posts to markdown format
- Progressive Web App (PWA) support

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- A modern web browser that supports Service Workers and Push Notifications

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd murmur
```

2. Install server dependencies:

```bash
npm install
```

3. Install client dependencies:

```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb://localhost/murmur
PORT=5000
```

5. Generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

6. Update the VAPID public key in `client/src/serviceWorker.js` with your generated public key.

## Running the Application

1. Start the development server:

```bash
npm run dev:full
```

This will start both the backend server and the React development server.

2. Open your browser and navigate to `http://localhost:3000`

3. Allow push notifications when prompted

## Building for Production

1. Build the client:

```bash
cd client
npm run build
cd ..
```

2. Start the production server:

```bash
npm start
```

## Usage

- Create posts by typing in the text field and clicking "Post"
- Tag contacts by typing @ followed by their name
- Click the download icon to export all posts as markdown
- Allow push notifications to receive hourly prompts
- Reply to notifications directly from your device

## License

MIT
