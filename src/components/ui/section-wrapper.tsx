import * as React from "react"

import { cn } from "@/lib/utils"

type SectionWrapperProps = React.HTMLAttributes<HTMLElement> & {
  title?: string
  description?: string
}

function SectionWrapper({
  className,
  title,
  description,
  children,
  ...props
}: SectionWrapperProps) {
  return (
    <section className={cn("w-full py-8", className)} {...props}>
      {(title || description) && (
        <div className="mb-5 space-y-1">
          {title && <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}

export { SectionWrapper }
