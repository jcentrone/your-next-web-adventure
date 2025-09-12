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
      isRecording
    } = useVoiceToText({
      onResult: (transcript) => {
        const currentValue = value as string;
        const newValue = currentValue ? `${currentValue} ${transcript}` : transcript;
        
        if (onValueChange) {
          onValueChange(newValue);
        }
        
        if (onChange) {
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
          className={cn("pr-12", className)}
          value={value}
          onChange={onChange}
          {...props}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "absolute bottom-2 right-2 h-8 w-8 p-0",
                  isRecording && "text-destructive animate-pulse"
                )}
                onClick={handleVoiceToggle}
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRecording ? "Stop recording" : "Start voice input"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
);

VoiceToTextTextarea.displayName = "VoiceToTextTextarea";

export { VoiceToTextTextarea };