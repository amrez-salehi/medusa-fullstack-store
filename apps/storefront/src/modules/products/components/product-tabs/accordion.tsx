import { Text, clx } from "@modules/common/components/ui"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import React from "react"

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
}

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>)

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, ...props }) => {
  return (
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  )
}

const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  headingSize: _headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  triggerable: _triggerable,
  ...props
}) => {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={clx(
        "group mb-3 overflow-hidden border border-[var(--color-border)] bg-[var(--color-light-cream)] last:mb-0",
        className
      )}
    >
      <AccordionPrimitive.Header className="px-5">
        <div className="flex flex-col">
          <div className="flex w-full items-center justify-between py-5">
            <div className="flex items-center gap-4">
              <Text className="font-medium text-[#27231f]">{title}</Text>
            </div>
            <AccordionPrimitive.Trigger>
              {customTrigger || <MorphingTrigger />}
            </AccordionPrimitive.Trigger>
          </div>
          {subtitle && (
            <Text as="span" className="mt-1 text-sm">
              {subtitle}
            </Text>
          )}
        </div>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={clx(
          "radix-state-closed:animate-accordion-close radix-state-open:animate-accordion-open radix-state-closed:pointer-events-none px-1"
        )}
      >
          <div className="border-t border-[var(--color-border)] bg-[var(--color-background)] px-5 py-1 inter-base-regular group-radix-state-closed:animate-accordion-close">
          {description && <Text>{description}</Text>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

Accordion.Item = Item

const MorphingTrigger = () => {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center border border-[var(--color-border)] text-[var(--color-text-secondary)] transition group-hover:border-[var(--color-accent)] group-hover:text-[var(--color-accent-dark)]">
      <div className="h-4 w-4">
        <span className="absolute inset-x-1/2 top-2 h-4 w-px -translate-x-1/2 bg-current transition group-data-[state=open]:rotate-90" />
        <span className="absolute inset-y-1/2 left-2 right-2 h-px -translate-y-1/2 bg-current" />
      </div>
    </div>
  )
}

export default Accordion
