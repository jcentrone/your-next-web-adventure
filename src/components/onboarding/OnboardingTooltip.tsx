import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OnboardingTooltipProps {
  title: string;
  content: string;
  position: { x: number; y: number };
  arrow: 'top' | 'bottom' | 'left' | 'right';
  transform: string;
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrev?: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  title,
  content,
  position,
  arrow,
  transform,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
}) => {
  const getArrowClasses = () => {
    const base = "absolute w-0 h-0 border-[14px] border-solid";
    
    switch (arrow) {
      case 'top':
        return `${base} border-transparent border-t-primary -bottom-[14px] left-1/2 -translate-x-1/2 z-20`;
      case 'bottom':
        return `${base} border-transparent border-b-primary -top-[14px] left-1/2 -translate-x-1/2 z-20`;
      case 'left':
        return `${base} border-transparent border-l-primary -right-[14px] top-1/2 -translate-y-1/2 z-20`;
      case 'right':
        return `${base} border-transparent border-r-primary -left-[14px] top-1/2 -translate-y-1/2 z-20`;
      default:
        return '';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-[9998]"
        onClick={onSkip}
      />
      
      {/* Tooltip */}
      <div
        className="fixed z-[9999] animate-fade-in"
        style={{
          left: position.x,
          top: position.y,
          transform: transform
        }}
      >
        <div className="relative bg-primary text-primary-foreground rounded-lg shadow-xl max-w-[320px] min-w-[280px]">
          {/* Arrow */}
          <div className={getArrowClasses()} />
          
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <h3 className="font-semibold text-base mb-2">{title}</h3>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">{content}</p>
          </div>
          
          {/* Progress indicator */}
          <div className="px-4 pb-2">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-colors",
                    index < currentStep 
                      ? "bg-primary-foreground w-3" 
                      : index === currentStep 
                        ? "bg-primary-foreground/70 w-4" 
                        : "bg-primary-foreground/30 w-2"
                  )}
                />
              ))}
            </div>
            <div className="text-xs text-primary-foreground/60 mt-1">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-center p-3 border-t border-primary-foreground/20 bg-primary/10 rounded-b-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs"
            >
              Skip Tour
            </Button>
            
            <div className="flex gap-2">
              {!isFirst && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrev}
                  className="bg-transparent text-primary-foreground/70 border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:border-primary-foreground/50 text-xs px-3"
                >
                  Back
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={isLast ? onSkip : onNext}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-xs px-3 font-medium"
              >
                {isLast ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};