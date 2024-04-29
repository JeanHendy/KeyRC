# KeyRC Mobile App

## Introduction
Welcome to the KeyRC Mobile App. This mobile application allows users to lock and unlock a smart lock device directly from their smartphones. By interfacing with cloud services, the app generates a secure token, which is then converted into a QR code. Scanning this QR code with the smart lock activates the lock or unlock mechanism, providing a seamless and secure user experience.

## Features
- **Lock/Unlock Mechanism**: Users can trigger the locking and unlocking functionality from within the app.
- **Token Generation**: On user command, the app communicates with cloud services to generate a secure access token.
- **QR Code Generation**: The app converts the received token into a QR code.
- **Smart Lock Interaction**: When the QR code is scanned by the smart lock, the lock's state is toggled accordingly.

## How It Works
1. **User Authentication**: The user logs into the app with their credentials.
2. **Trigger Lock/Unlock**: The user presses the button within the app to lock or unlock the smart lock.
3. **Token Request**: The app sends a request to the cloud to generate a secure token.
4. **Receive Token**: Once the cloud returns the token, the app proceeds to generate a QR code.
5. **QR Code Display**: The generated QR code is displayed on the user's screen.
6. **Scan QR Code**: The user scans the QR code using the smart lock's scanner.
7. **Lock/Unlock Action**: The smart lock processes the QR code and performs the lock or unlock action.

## Installation

To set up the app on your local machine for development and testing purposes, follow these steps:

git clone https://github.com/your-username/smart-lock-control-app.git
cd Mobile-App
npx expo start
