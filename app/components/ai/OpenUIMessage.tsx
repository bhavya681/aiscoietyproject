"use client";

import { useState } from "react";
import { Renderer } from "@openuidev/react-lang";

import { openuiLibrary } from "@/app/lib/openui/library";
import RichText from "./RichText";

/**
 * Renders a model-authored OpenUI Lang response. If the program cannot produce
 * a root, the plain-text fallback from the API is shown instead.
 */
export default function OpenUIMessage({
  source,
  fallback,
}: {
  source: string;
  fallback: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (failedSource === source) {
    return <RichText text={fallback} />;
  }

  return (
    <Renderer
      response={source}
      library={openuiLibrary}
      onParseResult={(result) => {
        if (!result?.root) {
          setFailedSource(source);
        }
      }}
    />
  );
}
