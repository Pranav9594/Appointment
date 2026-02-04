import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CheckStatusScreen from "@/screens/CheckStatusScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type StatusStackParamList = {
  CheckStatus: undefined;
};

const Stack = createNativeStackNavigator<StatusStackParamList>();

export default function StatusStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="CheckStatus"
        component={CheckStatusScreen}
        options={{
          headerTitle: "Check Status",
        }}
      />
    </Stack.Navigator>
  );
}
