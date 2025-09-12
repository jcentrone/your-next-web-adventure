import { useState, useRef, useCallback, useEffect } from 'react';

interface UseVoiceToTextOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useVoiceToText = ({
  onResult,
  onError,
  continuous = false,
  interimResults = true,
  language = 'en-US'
}: UseVoiceToTextOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioMonitoringRef = useRef<boolean>(false);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    console.log('Speech recognition supported:', !!SpeechRecognition);
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      console.log('Creating speech recognition instance');
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      
      // Add better timeout settings
      if ('maxAlternatives' in recognition) {
        (recognition as any).maxAlternatives = 1;
      }
      if ('serviceURI' in recognition) {
        // Some browsers support this for better performance
        (recognition as any).serviceURI = '';
      }
      
      console.log('Speech recognition settings:', { continuous, interimResults, language });

      recognition.onstart = () => {
        console.log('Speech recognition started');
        setIsRecording(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log('🎤 Speech recognition result event:', event);
        console.log('🎤 Number of results:', event.results.length);
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;
          
          console.log(`🎤 Result ${i}:`, {
            transcript,
            confidence,
            isFinal: result.isFinal
          });
          
          if (result.isFinal) {
            console.log('🎤 FINAL RESULT:', transcript);
            if (onResult && transcript.trim()) {
              console.log('🎤 Calling onResult with final transcript');
              onResult(transcript.trim());
            }
          } else if (interimResults && transcript.trim()) {
            console.log('🎤 INTERIM RESULT:', transcript);
            // Only call onResult for interim results if they're substantial
            if (onResult && transcript.trim().length > 2) {
              console.log('🎤 Calling onResult with interim transcript');
              onResult(transcript.trim());
            }
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error, event.message);
        setIsRecording(false);
        if (onError) {
          onError(event.error || 'Speech recognition error occurred');
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
        // Auto-restart if continuous mode is enabled and we're still supposed to be recording
        if (continuous && isRecording) {
          console.log('Auto-restarting speech recognition...');
          setTimeout(() => {
            if (recognitionRef.current && isRecording) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Failed to restart speech recognition:', error);
              }
            }
          }, 100);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult, onError, continuous, interimResults, language]);

  // Audio level monitoring
  const startAudioMonitoring = useCallback(async () => {
    try {
      console.log('🎤 Starting audio monitoring...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 512;
      analyzer.smoothingTimeConstant = 0.8;
      analyzerRef.current = analyzer;
      
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyzer);
      
      const dataArray = new Uint8Array(analyzer.frequencyBinCount);
      audioMonitoringRef.current = true;
      
      const updateAudioLevel = () => {
        if (analyzerRef.current && audioMonitoringRef.current) {
          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          console.log('🎤 Audio level:', average);
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        } else {
          console.log('🎤 Stopping audio level monitoring');
          setAudioLevel(0);
        }
      };
      
      updateAudioLevel();
      console.log('🎤 Audio monitoring started successfully');
    } catch (error) {
      console.error('🎤 Failed to start audio monitoring:', error);
      if (error.name === 'NotAllowedError') {
        console.error('🎤 Microphone permission denied');
      }
    }
  }, []);

  const stopAudioMonitoring = useCallback(() => {
    console.log('🎤 Stopping audio monitoring...');
    audioMonitoringRef.current = false;
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🎤 Stopped audio track:', track.kind);
      });
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setAudioLevel(0);
    console.log('🎤 Audio monitoring stopped');
  }, []);

  const startListening = useCallback(async () => {
    console.log('🎤 startListening called, isRecording:', isRecording);
    
    // Check microphone permissions first
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('🎤 Microphone permission status:', permission.state);
      
      if (permission.state === 'denied') {
        if (onError) {
          onError('Microphone permission denied. Please allow microphone access in your browser settings.');
        }
        return;
      }
    } catch (error) {
      console.warn('Could not check microphone permissions:', error);
    }
    
    if (recognitionRef.current && !isRecording) {
      try {
        console.log('🎤 Starting speech recognition...');
        await startAudioMonitoring();
        
        // Add a small delay to ensure audio monitoring is fully set up
        setTimeout(() => {
          if (recognitionRef.current) {
            console.log('🎤 Actually starting speech recognition now...');
            recognitionRef.current.start();
          }
        }, 100);
      } catch (error) {
        console.error('🎤 Failed to start speech recognition:', error);
        stopAudioMonitoring();
        if (onError) {
          onError('Failed to start speech recognition: ' + (error as Error).message);
        }
      }
    }
  }, [isRecording, onError, startAudioMonitoring]);

  const stopListening = useCallback(() => {
    console.log('🎤 stopListening called');
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    stopAudioMonitoring();
  }, [isRecording, stopAudioMonitoring]);

  const toggleListening = useCallback(() => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  }, [isRecording, startListening, stopListening]);

  return {
    isSupported,
    isRecording,
    audioLevel,
    startListening,
    stopListening,
    toggleListening
  };
};