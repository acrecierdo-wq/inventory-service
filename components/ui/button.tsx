import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive tracking-widest",
  {
    variants: {
      variant: {
        default:
          "bg-blue-100 text-black border-slate-500 border-2 border-b-[5px] active:border-b-8 hover:bg-slate-100 text-slate-500",
        primary:
        "bg-yellow-300 text-white hover:bg-yellow-600/90 border-yellow-500 border-b-4 active:border-b-8",
        primaryOutline:
        "bg-white p-10 text-[#642248] hover:bg-slate-200",
        secondary:
        "bg-purple-400 text-white hover:bg-purple-600/90 border-purple-700 border-b-4 active:border-b-8",
        secondaryOutline:
        "bg-white text-green-500 hover:bg-slate-200",
        danger:
        "bg-rose-500 text-primary-foregound hover:bg-rose-500/90 border-rose-600 border-b-4 active:border-b-8",
        dangerOutline:
        "bg-white text-rose-500 hover:bg-slate-200",
        super:
        "bg-indigo-500 text-white hover:bg-indigo-500/90 border-indigo-600 border-b-4 active:border-b-8",
        superOutline:
        "bg-[#ffc922] text-white hover:bg-yellow-500",
        ghost:
        "bg-transparent text-slate-500 border-transparent border-0 hover:bg-[#ffc922] hover:text-white",
        sidebar:
        "bg-transparent text-yellow-600 hover:bg-yellow-600 hover:text-white transition-none",
        sidebarOutline:
        "bg-sky-500/15 text-sky-500 border-sky-300 border-2 hover:bg-sky-500/20 transition-none",
        link:
        "text-primary text-yellow-600 underline-offset-4 hover:underline hover:text-[#642248]",
        inquire:
        "text-yellow-600 hover:bg-yellow-500/90 border-yellow-600 border-b-4 active:border-b-8 hover:text-white",
        outline:
        "bg-[#fed795] text-[#482b0e] border-0 border-[#e3ae01] border-b-2 hover:bg-yellow-600/30 transition-none"
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-10 w-10",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
