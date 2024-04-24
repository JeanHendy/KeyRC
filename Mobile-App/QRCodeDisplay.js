import React from "react";
import { View, Text, TouchableOpacity, Share, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot"; 

const QRCodeDisplay = ({ route, navigation }) => {
  const { token } = route.params;

  const viewShotRef = React.useRef();

  const shareQRCode = async () => {
    try {
      
      const imageUri = await viewShotRef.current.capture();

      const result = await Share.share({
        message: `Voici mon QR Code :`,
        url: imageUri, 
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          
        } else {
          
        }
      } else if (result.action === Share.dismissedAction) {
        
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        The QR-code has been successfully generated
      </Text>
      <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
        <QRCode value={token} size={200} />
      </ViewShot>
      <Text style={styles.subtitle}>You can now use it or share it</Text>
      <TouchableOpacity style={styles.shareButton} onPress={shareQRCode}>
        <Text style={styles.shareButtonText}>Share</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000", 
  },
  title: {
    marginBottom: 20,
    color: "white",
    fontSize: 18,
  },
  subtitle: {
    marginTop: 20,
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  shareButton: {
    width: 100,
    marginTop: 50,
    backgroundColor: "green", // You can change this to the color you prefer
    padding: 10,
    borderRadius: 5,
  },
  shareButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
  backButton: {
    width: 100,
    position: "absolute",
    right: 20,
    top: 90,
    backgroundColor: "rgba(255,255,255,0.3)",
    padding: 10,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
  },
});

export default QRCodeDisplay;
