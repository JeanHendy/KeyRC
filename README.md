Additionnal board manager
https://dl.espressif.com/dl/package_esp32_index.json
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

# Hardware for KeyRC Smart Lock System

This branch contains all the hardware-related files, schematics, and documentation for the KeyRC Smart Lock System. The hardware design is focused on reliability, energy efficiency, and ease of integration with existing door mechanisms.


Libraries Used

The hardware design utilizes several libraries for component integration and testing. The following libraries are used within the project:

WiFi.h (1.2.7)
HttpClient.h (0.6.0) 
quirc.h (1.2) for capture and decode qrcode 
# KeyRC Smart Lock System - Hardware Branch

## Function Descriptions

This document provides detailed descriptions of the functions implemented in the hardware codebase for the KeyRC Smart Lock System. These functions enable the device's core capabilities, including connectivity, imaging, and access control.

### Connectivity Functions

- `setupWiFiAndConnectToServer()`: Establishes a connection to the specified Wi-Fi network using the credentials provided and sends a POST request to the server with the device's IP address.

### Camera Initialization

- `initializeCamera()`: Configures and initializes the camera with predefined pins and settings appropriate for the ESP32-CAM module.

### QR Code Reading Task

- `QRCodeReaderTask(void * pvParameters)`: This FreeRTOS task handles the continuous process of capturing images and attempting to decode QR codes.

### Image Capture and QR Code Decoding

- `captureAndDecodeQRCode(struct quirc *q)`: Captures an image using the camera module and uses the `quirc` library to decode any QR codes present within the image.

### QR Code Data Dumping

- `dumpData(const struct quirc_data *data)`: Outputs the details of a decoded QR code to the Serial interface.

### Setup and Loop Functions

- `setup()`: Initializes the system components, connects to Wi-Fi, and starts the QR code reader task.
- `loop()`: The main loop periodically checks for decoded QR codes and compares them to a server-provided token to control access.

### Relay Control

The relay is controlled directly in the `loop()` function, where the decoded QR code is compared with the token received from the server. If they match, the relay is activated to unlock the door:

```cpp
if (decodedQRCode != "" && serverToken != "" && decodedQRCode.equals(serverToken)) {
  Serial.println("Tokens match. Activating relay...");
  digitalWrite(RELAY_PIN, HIGH);   // Activate relay
  delay(1000);                     // Relay activation duration
  digitalWrite(RELAY_PIN, LOW);    // Deactivate relay
}

