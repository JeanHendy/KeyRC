#include <WiFi.h>
#include "esp_camera.h"
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TaskScheduler.h>
#include "quirc.h"

// WiFi credentials
const char* ssid = "iPhone";
const char* password = "123456789";
const int RELAY_PIN = 4;    // Broche de contrôle du relais
// Server URL
const char* serverUrl = "http://51.91.103.54:3000/receive_ip";
/* Variables globales */
TaskHandle_t QRCodeReader_Task; 
#define CAMERA_MODEL_AI_THINKER
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22
struct QRCodeData {
  bool valid;
  int dataType;
  uint8_t payload[1024];
  int payloadLen;
};
struct quirc *q = NULL;
uint8_t *image = NULL;  
camera_fb_t * fb = NULL;
struct QRCodeData qrCodeData;  
String QRCodeResult = "";
String serverToken = "";

/* Prototypes des fonctions */
void initializeCamera();
String setupWiFiAndConnectToServer();
String captureAndDecodeQRCode();
void QRCodeReaderTask(void * pvParameters);
void dumpData(const struct quirc_data *data);

void initializeCamera() {
  // Configuration des broches de la caméra (modèle AI Thinker)
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 10000000;
  config.pixel_format = PIXFORMAT_GRAYSCALE;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 15;
  config.fb_count = 1;

  // Initialisation de la caméra
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Échec de l'initialisation de la caméra. Code d'erreur : 0x%x", err);
    ESP.restart();
  }

  // Vérification de l'initialisation
  sensor_t *s = esp_camera_sensor_get();
  if (!s) {
    Serial.println("Échec de la récupération des informations du capteur");
    ESP.restart();
  }

  Serial.println("Caméra initialisée avec succès");
}

String setupWiFiAndConnectToServer() {
    // Connexion au réseau WiFi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(1000);
        Serial.println("Connexion en cours au WiFi...");
    }

    Serial.println("Connecté au réseau WiFi");

    // Récupérer l'adresse IP locale de l'ESP32
    IPAddress localIP = WiFi.localIP();
    String ipAddress = String(localIP[0]) + "." + String(localIP[1]) + "." + String(localIP[2]) + "." + String(localIP[3]);

    // Envoyer l'adresse IP au serveur via un POST request
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    String postData = "ip=" + ipAddress;
    int httpResponseCode = http.POST(postData);

    String serverResponse = "";
    // Traiter la réponse du serveur
    if (httpResponseCode > 0) {
      Serial.print("Adresse IP envoyée avec succès au serveur. Réponse du serveur : ");
      serverResponse = http.getString();
      Serial.println(serverResponse);

      // Récupérer et retourner le token
      if (serverResponse.length() > 0) {
        // Vous pouvez ajouter ici votre logique pour traiter le token reçu
        Serial.println("Traitement du token...");
        
      } else {
        Serial.println("Aucune réponse du serveur");
      }
    } else {
      Serial.print("Échec de l'envoi de l'adresse IP au serveur. Code d'erreur HTTP : ");
      Serial.println(httpResponseCode);
    }

    http.end(); // Libérer les ressources
    return serverResponse;
}

void QRCodeReaderTask(void *pvParameters) {
  struct quirc *q = quirc_new();
  if (!q) {
    Serial.println("Failed to create quirc decoder object");
    vTaskDelete(NULL);
    return;
  }

  while (true) { // Boucle principale
    String decodedQRCode = captureAndDecodeQRCode(q);
    if (!decodedQRCode.isEmpty()) {
      Serial.println("QR code decoded: " + decodedQRCode);
      if (decodedQRCode==setupWiFiAndConnectToServer()) { 
        Serial.println("Valid QR code. Activating the strike...");
        pinMode(RELAY_PIN,OUTPUT);
        digitalWrite(RELAY_PIN, HIGH); // Activation de la gâche
        delay(10000); // Durée de l'activation
        digitalWrite(RELAY_PIN, LOW);
        break; // Sortie de la boucle après activation
      } else {
        Serial.println("Invalid QR code. Please try again.");
        // Ici vous pouvez ajouter un délai ou une logique pour réessayer après un certain temps
      }
    } else {
      Serial.println("No QR code detected or camera capture failed.");
    }
    vTaskDelay(5000 / portTICK_PERIOD_MS); // Attend 5 secondes avant de répéter
  }

  quirc_destroy(q);
  vTaskDelete(NULL);
}


String captureAndDecodeQRCode(struct quirc *q) {
  if (!q) {
    Serial.println("Invalid quirc object passed to function");
    return ""; // Return an empty string if the quirc object is not valid
  }

  String decodedQRCode = "";
  int count = 0;
  unsigned long startTime = millis();
  unsigned long timeout = 15000; // 15 seconds timeout

  while (decodedQRCode.isEmpty() && (millis() - startTime < timeout)) {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed");
      return ""; // Early exit if frame grab failed
    }

    // Resize and prepare the image for QR decoding
    quirc_resize(q, fb->width, fb->height);
    uint8_t *image = quirc_begin(q, NULL, NULL);
    memcpy(image, fb->buf, fb->len);
    quirc_end(q);

    // Attempt to decode QR code
    count = quirc_count(q);
    if (count > 0) {
      struct quirc_code code;
      struct quirc_data data;
      quirc_extract(q, 0, &code);
      if (quirc_decode(&code, &data) == QUIRC_SUCCESS) {
        Serial.println("QR code decode: success");
        decodedQRCode = String((char *)data.payload);
        
        return decodedQRCode; // Break the loop on successful decode
      } else {
        Serial.println("QR code decode failed");
      }
    } else {
      Serial.println("No QR code detected");
    }

    esp_camera_fb_return(fb); // Return the frame buffer back to the camera driver
    delay(500); // Delay to prevent excessive CPU usage and allow task switches
  }

  if (decodedQRCode.isEmpty()) {
    Serial.println("Timeout reached without detecting a QR code.");
  }

}


void dumpData(const struct quirc_data *data){
  Serial.printf("Version: %d\n", data->version);
  Serial.printf("ECC level: %c\n", "MLHQ"[data->ecc_level]);
  Serial.printf("Mask: %d\n", data->mask);
  Serial.printf("Length: %d\n", data->payload_len);
  Serial.printf("Payload: %s\n", data->payload);
  
  QRCodeResult = (const char *)data->payload;
}

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  pinMode(RELAY_PIN, OUTPUT);
  initializeCamera();
  serverToken = setupWiFiAndConnectToServer();
  xTaskCreatePinnedToCore(QRCodeReaderTask, "QRCodeReader_Task", 15000, NULL, 1, &QRCodeReader_Task, 0);
}

void loop() {
  // La loop peut rester vide si QRCodeReaderTask gère tout.
  delay(10000); // Cette ligne est juste pour soulager le CPU, facultatif si rien d'autre n'est fait.

  // Vous pouvez ajouter ici d'autres vérifications ou tâches de maintenance si nécessaire.
}




