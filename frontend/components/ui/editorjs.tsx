"use client";

import * as React from "react";
import DOMPurify from "isomorphic-dompurify";
import { Card, CardContent } from "@/components/ui/card";
import type EditorJS from "@editorjs/editorjs";
import type { OutputData } from "@editorjs/editorjs";

export function EditorJs({ value, onChange }: { value?: OutputData; onChange?: (data: OutputData) => void }) {
  const holderRef = React.useRef<HTMLDivElement | null>(null);
  const editorRef = React.useRef<EditorJS | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      if (!holderRef.current) return;
      const Editor = (await import("@editorjs/editorjs")).default;
      const Header = (await import("@editorjs/header")).default;
      const List = (await import("@editorjs/list")).default;
      const Paragraph = (await import("@editorjs/paragraph")).default;
      const editor = new Editor({
        holder: holderRef.current,
        data: value,
        tools: { header: Header, list: List, paragraph: Paragraph },
        async onChange(api) {
          const data = await api.saver.save();
          onChange?.(data);
        },
      });
      if (!isMounted) {
        editor.destroy();
        return;
      }
      editorRef.current = editor as unknown as EditorJS;
    })();
    return () => {
      isMounted = false;
      editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, [onChange, value]);

  return (
    <Card>
      <CardContent className="pt-0">
        <div ref={holderRef} />
      </CardContent>
    </Card>
  );
}

export function EditorPreview({ data }: { data: unknown }) {
  const content = React.useMemo(() => {
    try {
      const json = JSON.stringify(data, null, 2);
      const safe = DOMPurify.sanitize(json, { USE_PROFILES: { html: true } });
      return safe;
    } catch {
      return "";
    }
  }, [data]);
  return <pre className="whitespace-pre-wrap break-words text-sm">{content}</pre>;
}


