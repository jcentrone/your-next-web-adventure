import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OnboardingTooltipProps {
  title: string;
  content: string;
  position: { x: number; y: number };
  arrow: 'top' | 'bottom' | 'left' | 'right';
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
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isFirst,
  isLast,
}) => {
  const getArrowClasses = () => {
    const base = "absolute w-0 h-0 border-8 border-solid";
    
    switch (arrow) {
      case 'top':
        return `${base} border-transparent border-t-[#1e40af] -bottom-2 left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${base} border-transparent border-b-[#1e40af] -top-2 left-1/2 -translate-x-1/2`;
      case 'left':
        return `${base} border-transparent border-l-[#1e40af] -right-2 top-1/2 -translate-y-1/2`;
      case 'right':
        return `${base} border-transparent border-r-[#1e40af] -left-2 top-1/2 -translate-y-1/2`;
      default:
        return '';
    }
  };

  const getTooltipPosition = () => {
    const offset = 16;
    switch (arrow) {
      case 'top':
        return { x: position.x, y: position.y - offset };
      case 'bottom':
        return { x: position.x, y: position.y + offset };
      case 'left':
        return { x: position.x - offset, y: position.y };
      case 'right':
        return { x: position.x + offset, y: position.y };
      default:
        return position;
    }
  };

  const tooltipPos = getTooltipPosition();

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
          left: tooltipPos.x,
          top: tooltipPos.y,
          transform: arrow === 'left' || arrow === 'right' 
            ? 'translateY(-50%)' 
            : 'translateX(-50%)'
        }}
      >
        <div className="relative bg-[#1e40af] text-white rounded-lg shadow-xl max-w-[320px] min-w-[280px]">
          {/* Arrow */}
          <div className={getArrowClasses()} />
          
          {/* Header */}
          <div className="px-4 pt-4 pb-2">
            <h3 className="font-semibold text-base mb-2">{title}</h3>
            <p className="text-sm text-white/90 leading-relaxed">{content}</p>
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
                      ? "bg-white w-3" 
                      : index === currentStep 
                        ? "bg-white/70 w-4" 
                        : "bg-white/30 w-2"
                  )}
                />
              ))}
            </div>
            <div className="text-xs text-white/60 mt-1">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-between items-center p-3 border-t border-white/20 bg-black/10 rounded-b-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-white/70 hover:text-white hover:bg-white/10 text-xs"
            >
              Skip Tour
            </Button>
            
            <div className="flex gap-2">
              {!isFirst && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPrev}
                  className="bg-transparent text-white/70 border-white/30 hover:bg-white/10 hover:text-white hover:border-white/50 text-xs px-3"
                >
                  Back
                </Button>
              )}
              
              <Button
                size="sm"
                onClick={isLast ? onSkip : onNext}
                className="bg-white text-[#1e40af] hover:bg-gray-100 text-xs px-3 font-medium"
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