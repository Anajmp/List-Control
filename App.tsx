import { StatusBar } from "react-native";
import Home from "./src/pages/Home";

//Ele é quem descobre quais as áreas seguras do dispositivo
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <Home/>
    </SafeAreaProvider>
    
  );
}