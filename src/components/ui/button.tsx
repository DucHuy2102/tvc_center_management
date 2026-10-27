import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[#1E3A8A] border border-transparent shadow-none",
        destructive:
          "bg-[#FBE8E5] text-[#B3382C] border border-[#FBE8E5] hover:bg-[#B3382C]/15",
        outline:
          "border border-border bg-white text-foreground hover:bg-[#E7EDFB] hover:text-primary",
        secondary:
          "bg-[#ECEFF5] text-[#5A6478] hover:bg-[#DFE4EC] border border-transparent",
        ghost:
          "text-foreground hover:bg-[#E7EDFB] hover:text-primary",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
        accent:
          "bg-[#E7EDFB] text-primary hover:bg-[#1E40AF]/15 border border-transparent font-medium",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[6px] px-3 text-xs",
        lg: "h-10 rounded-[6px] px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
