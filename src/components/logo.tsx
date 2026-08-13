import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  imageSize?: number
  textSize?: string
  showText?: boolean
  isBold?: boolean
}

export function Logo({ 
  className, 
  imageSize = 40, 
  textSize = "text-xl", 
  showText = true,
  isBold = true 
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative shrink-0">
        <Image
          src="/logo.png"
          alt="Attendy Logo"
          width={imageSize}
          height={imageSize}
          className="rounded-xl shadow-sm"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "leading-none tracking-tight",
            textSize,
            isBold ? "font-bold" : "font-semibold"
          )}>
            Attendy
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mt-0.5">
            Attendance System
          </span>
        </div>
      )}
    </div>
  )
}
