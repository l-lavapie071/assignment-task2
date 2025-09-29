import React, { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import eventsRaw from "../../db.json";
import { AuthenticationContext } from "../context/AuthenticationContext";
import { Event } from "../types/Event";

export default function EventsMap({ navigation }: any) {
  const auth = useContext(AuthenticationContext);
  const currentUser = auth?.value;
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const eventsData = eventsRaw as { events: Event[] };
    const upcomingEvents = eventsData.events.filter(
      (event) => new Date(event.dateTime) > new Date()
    );
    setEvents(upcomingEvents.length ? upcomingEvents : eventsData.events);
  }, []);

  const handleNavigateToCreateEvent = () => {
    alert("Navigate to Create Event screen");
  };

  const handleNavigateToEventDetails = (eventId: string) => {
    navigation.navigate("EventDetails", { eventId });
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(["userInfo", "accessToken"]);
    auth?.setValue(undefined);
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      {/* --- WELCOME --- */}
      {currentUser && (
        <Text
          style={[
            styles.welcome,
            {
              paddingTop:
                Platform.OS === "android" ? StatusBar.currentHeight || 20 : 40,
            },
          ]}
        >
          Welcome, {currentUser.name.first} {currentUser.name.last}!
        </Text>
      )}

      {/* --- EVENTS LIST --- */}
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCard}
            onPress={() => handleNavigateToEventDetails(item.id)}
          >
            <Text style={styles.eventTitle}>{item.name}</Text>
            <Text style={styles.eventDate}>
              {new Date(item.dateTime).toLocaleString()}
            </Text>
            <Text style={styles.eventDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>{events.length} event(s) found</Text>
        <RectButton
          style={[styles.smallButton, { backgroundColor: "#00A3FF" }]}
          onPress={handleNavigateToCreateEvent}
        >
          <Feather name="plus" size={20} color="#FFF" />
        </RectButton>
      </View>

      <RectButton
        style={[
          styles.logoutButton,
          styles.smallButton,
          { backgroundColor: "#4D6F80" },
        ]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={20} color="#FFF" />
      </RectButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  welcome: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 20,
    marginBottom: 10,
  },
  logoutButton: {
    position: "absolute",
    top: Platform.OS === "android" ? StatusBar.currentHeight! + 20 : 70,
    right: 24,
    elevation: 3,
  },
  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 40,
    backgroundColor: "#FFF",
    borderRadius: 16,
    height: 56,
    paddingLeft: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 3,
  },
  footerText: { fontFamily: "Nunito_700Bold", color: "#8fa7b3" },
  smallButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  eventCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  eventTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  eventDate: { fontSize: 12, color: "#666", marginBottom: 6 },
  eventDescription: { fontSize: 14, color: "#444" },
});
