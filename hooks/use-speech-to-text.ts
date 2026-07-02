'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function joinTranscript(base: string, spoken: string, interim: string): string {
  const combined = spoken + interim;
  if (!combined) return base;
  if (!base) return combined;
  const needsSpace = !base.endsWith(' ') && !combined.startsWith(' ');
  return base + (needsSpace ? ' ' : '') + combined;
}

export function useSpeechToText(lang?: string) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const baseMessageRef = useRef('');
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    setIsSupported(!!getSpeechRecognitionCtor());
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(
    (onTranscriptUpdate: (text: string) => void, currentMessage: string) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) {
        toast.error('Voice input is not supported in this browser');
        return;
      }

      recognitionRef.current?.abort();

      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang ?? navigator.language ?? 'en-US';

      baseMessageRef.current = currentMessage;
      finalTranscriptRef.current = '';

      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript ?? '';
          if (result.isFinal) {
            finalTranscriptRef.current += transcript;
          } else {
            interim += transcript;
          }
        }
        onTranscriptUpdate(
          joinTranscript(
            baseMessageRef.current,
            finalTranscriptRef.current,
            interim
          )
        );
      };

      recognition.onerror = (event) => {
        if (event.error === 'aborted') return;
        if (event.error === 'no-speech') return;
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied');
        } else {
          toast.error('Voice input failed. Try again.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        setIsListening(true);
      } catch {
        toast.error('Could not start voice input');
        setIsListening(false);
      }
    },
    [lang]
  );

  const toggleListening = useCallback(
    (onTranscriptUpdate: (text: string) => void, currentMessage: string) => {
      if (isListening) {
        stopListening();
      } else {
        startListening(onTranscriptUpdate, currentMessage);
      }
    },
    [isListening, startListening, stopListening]
  );

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  return { isListening, isSupported, startListening, stopListening, toggleListening };
}
