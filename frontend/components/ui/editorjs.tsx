"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import type EditorJS from "@editorjs/editorjs"
import type { OutputData } from "@editorjs/editorjs"

const editorVariants = cva("", {
  variants: {
    size: {
      sm: "[&_.codex-editor]:text-sm",
      md: "[&_.codex-editor]:text-base",
      lg: "[&_.codex-editor]:text-lg",
    },
    variant: {
      default: "",
      minimal: "border-none shadow-none",
      outline: "border-2",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
})

interface EditorJsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    VariantProps<typeof editorVariants> {
  value?: OutputData
  onChange?: (data: OutputData) => void
}

const EditorJs = React.forwardRef<HTMLDivElement, EditorJsProps>(
  ({ className, size, variant, value, onChange, ...props }, ref) => {
    const holderRef = React.useRef<HTMLDivElement | null>(null)
    const editorRef = React.useRef<EditorJS | null>(null)

    React.useEffect(() => {
      let isMounted = true
      ;(async () => {
        if (!holderRef.current) return
        const Editor = (await import("@editorjs/editorjs")).default
        const Header = (await import("@editorjs/header")).default
        const List = (await import("@editorjs/list")).default
        const Paragraph = (await import("@editorjs/paragraph")).default
        const editor = new Editor({
          holder: holderRef.current,
          data: value,
          tools: { header: Header, list: List, paragraph: Paragraph },
          async onChange(api) {
            const data = await api.saver.save()
            onChange?.(data)
          },
        })
        if (!isMounted) {
          editor.destroy()
          return
        }
        editorRef.current = editor as unknown as EditorJS
      })()
      return () => {
        isMounted = false
        editorRef.current?.destroy()
        editorRef.current = null
      }
    }, [onChange, value])

    return (
      <Card
        ref={ref}
        className={cn(editorVariants({ size, variant }), className)}
        {...props}
      >
        <CardContent className="pt-0">
          <div ref={holderRef} />
        </CardContent>
      </Card>
    )
  }
)
EditorJs.displayName = "EditorJs"

const editorPreviewVariants = cva("whitespace-pre-wrap break-words", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

interface EditorPreviewProps
  extends React.HTMLAttributes<HTMLPreElement>,
    VariantProps<typeof editorPreviewVariants> {
  data: unknown
}

const EditorPreview = React.forwardRef<HTMLPreElement, EditorPreviewProps>(
  ({ className, size, data, ...props }, ref) => {
    const raw = React.useMemo(() => {
      try {
        return JSON.stringify(data, null, 2)
      } catch {
        return ""
      }
    }, [data])

    const [content, setContent] = React.useState(raw)

    React.useEffect(() => {
      let active = true
      ;(async () => {
        try {
          const mod = await import("isomorphic-dompurify")
          if (!active) return
          const DOMPurify = mod.default
          setContent(DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } }))
        } catch {
          if (active) setContent(raw)
        }
      })()

      return () => {
        active = false
      }
    }, [raw])

    return (
      <pre
        ref={ref}
        className={cn(editorPreviewVariants({ size }), className)}
        {...props}
      >
        {content}
      </pre>
    )
  }
)
EditorPreview.displayName = "EditorPreview"

export {
  EditorJs,
  editorVariants,
  EditorPreview,
  editorPreviewVariants,
}

