import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export const VoiceInput = ({ onTranscript, fieldName = "Description" }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const reco = new SpeechRecognition();
    reco.continuous = true;
    reco.interimResults = true;
    reco.lang = 'en-US';

    reco.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript);
      }
    };

    reco.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    reco.onend = () => {
      setIsListening(false);
    };

    setRecognition(reco);
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  if (!supported) {
    return (
      <span className="text-xs text-slate-400 italic">
        (Voice dictation requires Chrome browser)
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
        isListening
          ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-200'
          : 'bg-[#E8F5F2] text-[#0F5548] hover:bg-[#bce6dc] border border-[#b4e3d8]'
      }`}
      title={`Dictate ${fieldName} with Voice`}
    >
      {isListening ? (
        <>
          <MicOff className="w-3.5 h-3.5" />
          <span>Listening... Click to stop</span>
          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5" />
          <span>Voice Dictate</span>
        </>
      )}
    </button>
  );
};
