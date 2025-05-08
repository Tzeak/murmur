# Murmur

A simple web app for writing and sharing daily thoughts. Think of it like a digital journal that's easy to use.

## What It Does

- Write down your thoughts and ideas
- Mention your contacts by typing @ and their name
- Export your posts to Obsidian (a note-taking app)
- Works in both light and dark mode
- Keeps your data private with password protection

## How to Use

1. Start the app:

   ```bash
   npm install
   npm start
   ```

2. Open your browser and go to `http://localhost:5001`

3. Log in with the password (default is "murmur")

4. Start writing! You can:
   - Type your thoughts in the text box
   - Press Enter to post
   - Type @ to mention someone
   - Click the download icon to save yesterday's posts
   - Click the clock icon to save posts from a specific date

## Features

- **Easy Writing**: Just type and press Enter
- **Contact Mentions**: Type @ to mention someone
- **Export to Obsidian**: Save your posts with one click
- **Dark Mode**: Switch between light and dark themes
- **Password Protection**: Keep your thoughts private

## Setup

1. Put your contacts in a file named `contacts.vcf`
2. Install the required packages:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npm start
   ```

## Privacy

- Your contacts are kept private
- The app runs on your computer
- Your data stays on your device
- Password protection keeps others out

## Need Help?

If something's not working:

1. Make sure all packages are installed
2. Check that your contacts file is in the right place
3. Make sure no other app is using port 5001
