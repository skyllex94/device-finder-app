import { Audio } from "expo-av";
import { useEffect, useState } from "react";

export const usePlaySound = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async () => {
    console.log("Loading Sound");
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require("../assets/sounds/find_device.mp3"),
        {
          isLooping: true,
          shouldPlay: true,
          volume: 1.0,
        }
      );
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  return {
    playSound,
    stopSound,
    isPlaying,
  };
};
