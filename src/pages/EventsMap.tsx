import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import customMapStyle from "../../map-style.json";
import * as MapSettings from "../constants/MapSettings";
import { AuthenticationContext } from "../context/AuthenticationContext";
import mapMarkerImg from "../images/map-marker.png";
import eventsData from "../../db.json";

interface Event {
  id: string;
  name: string;
  description: string;
  position: { latitude: number; longitude: number };
  dateTime: string;
}

export default function EventsMap(props: StackScreenProps<any>) {
  const { navigation } = props;
  const authenticationContext = useContext(AuthenticationContext);
  const mapViewRef = useRef<MapView>(null);

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    // Show all events for debugging
    console.log("Event data:", eventsData.events);

    // Filter upcoming events only
    const upcomingEvents = eventsData.events.filter(
      (event) => new Date(event.dateTime) > new Date()
    );

    // If no upcoming events, show all events to avoid empty map
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
    authenticationContext?.setValue(undefined);
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapViewRef}
        provider={PROVIDER_GOOGLE}
        initialRegion={MapSettings.DEFAULT_REGION}
        style={styles.mapStyle}
        customMapStyle={customMapStyle}
        showsMyLocationButton={false}
        showsUserLocation={true}
        rotateEnabled={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        mapPadding={MapSettings.EDGE_PADDING}
        onLayout={() => {
          if (events.length) {
            mapViewRef.current?.fitToCoordinates(
              events.map((e) => e.position),
              { edgePadding: MapSettings.EDGE_PADDING }
            );
          }
        }}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            coordinate={event.position}
            onPress={() => handleNavigateToEventDetails(event.id)}
          >
            <Image
              resizeMode="contain"
              style={{ width: 48, height: 54 }}
              source={mapMarkerImg}
            />
          </Marker>
        ))}
      </MapView>

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
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  mapStyle: { ...StyleSheet.absoluteFillObject },
  logoutButton: { position: "absolute", top: 70, right: 24, elevation: 3 },
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
});
