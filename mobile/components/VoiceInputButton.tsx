import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import Voice from '@react-native-voice/voice';

interface VoiceInputProps {
  onSpeechResult: (text: string) => void;
  label?: string;
}

export const VoiceInputButton: React.FC<VoiceInputProps> = ({ onSpeechResult, label = "Voice Dictate" }) => {
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value[0]) {
        onSpeechResult(e.value[0]);
      }
    };
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechError = () => setIsListening(false);

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const toggleListening = async () => {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      } else {
        await Voice.start('en-US');
        setIsListening(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleListening}
      style={[styles.button, isListening ? styles.activeButton : styles.idleButton]}
    >
      <Text style={[styles.text, isListening ? styles.activeText : styles.idleText]}>
        🎤 {isListening ? 'Listening... Tap to Stop' : label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  idleButton: {
    backgroundColor: '#E8F5F2',
    borderWidth: 1,
    borderColor: '#B4E3D8',
  },
  activeButton: {
    backgroundColor: '#EF4444',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  idleText: {
    color: '#0F5548',
  },
  activeText: {
    color: '#FFFFFF',
  },
});
