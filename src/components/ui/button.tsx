import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg",
    "font-semibold tracking-[-0.01em]",
    "ring-offset-background transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
    "active:scale-[0.97]",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_2px_8px_hsl(50_100%_50%/0.25)] hover:bg-accent hover:shadow-[0_6px_20px_hsl(50_100%_50%/0.4)] hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[0_2px_8px_hsl(0_84%_60%/0.25)] hover:bg-destructive/90 hover:shadow-[0_6px_20px_hsl(0_84%_60%/0.35)] hover:-translate-y-0.5",
        outline:
          "border-2 border-primary/70 text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-[0_6px_20px_hsl(50_100%_50%/0.3)] hover:-translate-y-0.5",
        secondary:
          "bg-secondary text-secondary-foreground border border-border/60 hover:bg-secondary/70 hover:border-border",
        ghost:
          "text-foreground/80 hover:bg-secondary hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline active:scale-100 font-medium",
        hero:
          "bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold shadow-[0_4px_24px_hsl(50_100%_50%/0.35)] hover:shadow-[0_8px_36px_hsl(50_100%_50%/0.55)] hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-5 py-2 text-sm",
        sm: "h-9 px-3.5 text-[13px] rounded-md",
        lg: "h-[3.25rem] px-8 text-base rounded-xl",
        xl: "h-14 px-10 text-base rounded-xl font-bold",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
