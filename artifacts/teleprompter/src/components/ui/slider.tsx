import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className={cn("relative w-full h-6 flex items-center group", className)}>
        {/* Track background */}
        <div className="absolute w-full h-2 bg-secondary rounded-full overflow-hidden">
          {/* Active track */}
          <div 
            className="h-full bg-primary transition-all duration-100 ease-out" 
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          {...props}
        />
        
        {/* Thumb */}
        <div 
          className="absolute h-5 w-5 bg-white rounded-full shadow-md border-2 border-primary pointer-events-none transition-transform duration-100 ease-out group-hover:scale-110"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
