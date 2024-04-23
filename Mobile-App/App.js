import React, { useState } from "react";
import {
  Button,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import QRCodeDisplay from './QRCodeDisplay'; // 

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  // Création d'un token pour le QR-code
  const [token, setToken] = useState("");
  const generateToken = () => {
    fetch("http://51.91.103.54:3000/generate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Token reçu:", data.token);
        setToken(data.token);
        navigation.navigate("QRCode", { token: data.token });
      })
      .catch((error) => {
        console.error("Erreur lors de la génération du token:", error);
      });
  };
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Jean | Maison Marseille</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <AntDesign name="setting" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.statusSection}>
        <View style={styles.statusIndicator}></View>
        <View style={styles.statusInfo}>
          <Text style={styles.lockStatus}>Status: locked</Text>
          <Text style={styles.historyText}>Historic: opened 01/01/2024</Text>
          <Text style={styles.lastQRCode}>Last QR-code: 01/01/2024</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={generateToken}>
          <Text style={styles.buttonText}>Generate a new QR-CODE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sync with calendar</Text>
        </TouchableOpacity>
      </View>
      {/* Affichage du token pour vérification */}
      {token && <Text style={styles.tokenDisplay}>Token: {token}</Text>}

      <View style={styles.tabBar}>
        <View style={styles.tabItem}>
          <Entypo name="home" size={24} color="white" />
          <Text style={styles.tabTitle}>Home</Text>
        </View>

        <View style={styles.tabItem}>
          <AntDesign name="user" size={24} color="white" />
          <Text style={styles.tabTitle}>Profile</Text>
        </View>
      </View>
    </View>
  );
};

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="QRCode" component={QRCodeDisplay} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    marginTop: 40,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 20,
  },
  settingsButton: {},
  statusSection: {
    alignItems: "center",
    marginVertical: 40,
  },
  statusIndicator: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "red",
    marginBottom: 10,
  },
  statusInfo: {
    alignItems: "center",
  },
  lockStatus: {
    color: "white",
    fontSize: 18,
    marginBottom: 5,
  },
  historyText: {
    color: "white",
    fontSize: 16,
    marginBottom: 5,
  },
  lastQRCode: {
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#111",
    borderTopColor: "rgba(255, 255, 255, 0.2)",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#111",
    marginBottom: 20,
  },
  tabItem: {
    alignItems: "center",
  },
  tabTitle: {
    color: "white",
    fontSize: 10,
    marginTop: 4,
  },
  tokenDisplay: {
    color: "white",
    textAlign: "center",
    padding: 10,
  },
});

export default App;


