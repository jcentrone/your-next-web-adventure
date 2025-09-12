import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceToText } from "@/hooks/useVoiceToText";

export interface VoiceToTextTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void;
}

const VoiceToTextTextarea = React.forwardRef<HTMLTextAreaElement, VoiceToTextTextareaProps>(
  ({ className, value = "", onValueChange, onChange, ...props }, ref) => {
    const [isListening, setIsListening] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const {
      isSupported,
      startListening,
      stopListening,
      isRecording,
      audioLevel
    } = useVoiceToText({
      onResult: (transcript) => {
        console.log('Voice transcript received:', transcript);
        console.log('Current value:', value);
        
        const currentValue = (value as string) || '';
        const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
        
        console.log('New value will be:', newValue);
        
        // Only call onValueChange, not both
        if (onValueChange) {
          console.log('Calling onValueChange with:', newValue);
          onValueChange(newValue);
        } else if (onChange) {
          console.log('Calling onChange as fallback');
          const syntheticEvent = {
            target: { value: newValue }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onChange(syntheticEvent);
        }
      },
      onError: (error) => {
        console.error('Voice recognition error:', error);
        setIsListening(false);
      }
    });

    // Test function to verify data flow
    const handleTestTranscript = () => {
      const testText = "This is a test transcript";
      console.log('Testing transcript with:', testText);
      
      const currentValue = (value as string) || '';
      const newValue = currentValue ? `${currentValue} ${testText}` : testText;
      
      if (onValueChange) {
        onValueChange(newValue);
      } else if (onChange) {
        const syntheticEvent = {
          target: { value: newValue }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
      }
    };

    const handleVoiceToggle = () => {
      if (isRecording) {
        stopListening();
        setIsListening(false);
      } else {
        startListening();
        setIsListening(true);
      }
    };

    if (!isSupported) {
      return (
        <Textarea
          ref={ref}
          className={className}
          value={value}
          onChange={onChange}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        <Textarea
          ref={textareaRef}
          className={cn("pr-20", className)}
          value={value}
          onChange={onChange}
          {...props}
        />
        <div className="absolute bottom-2 right-2 flex gap-1">
          {/* Test button for debugging */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground"
                  onClick={handleTestTranscript}
                >
                  T
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Test transcript (debug)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Voice button with audio level indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "relative h-8 w-8 p-0",
                    isRecording && "text-destructive animate-pulse"
                  )}
                  onClick={handleVoiceToggle}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                   {/* Audio level indicator - more visible */}
                   {isRecording && (
                     <div 
                       className={cn(
                         "absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white",
                         audioLevel > 20 ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                       )}
                       style={{ opacity: audioLevel > 5 ? 1 : 0.3 }}
                     />
                   )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isRecording ? "Stop recording" : "Start voice input"}
                  {isRecording && audioLevel > 0 && ` (${Math.round(audioLevel)}%)`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }
);

VoiceToTextTextarea.displayName = "VoiceToTextTextarea";

export { VoiceToTextTextarea };