import React, { createRef, useLayoutEffect } from "react";

import { useTheme } from "@/hooks";

const src = "https://utteranc.es/client.js";
const utterancesSelector = 'iframe.utterances-frame';

export interface IUtterancesProps {
  utterances: { [key: string]: string };
}

const Utterances: React.FC<IUtterancesProps> = React.memo(({ utterances }) => {
  const containerRef = createRef();

  const [{ mode }] = useTheme();
  const themeMode = mode === "dark" ? "github-dark" : "github-light"

  useLayoutEffect(() => {
    const createUtterancesEl = () => {
      const utterancesScript = document.createElement("script");

      const attributes = {
        src,
        repo: utterances.repo,
        "issue-term": utterances.issueTerm,
        label: utterances.label,
        theme: themeMode,
        crossOrigin: "anonymous",
        async: "true",
      };

      Object.entries(attributes).forEach(([key, value]) => {
        utterancesScript.setAttribute(key, value);
      });

      if (containerRef.current) {
        containerRef.current.appendChild(utterancesScript);
      }
    }

    const postThemeMessage = () => {
      const message = {
        type: 'set-theme',
        theme: themeMode,
      };
      utterancesEl.contentWindow.postMessage(message, src);
    };

    const utterancesEl = containerRef.current.querySelector(utterancesSelector);
    utterancesEl ? postThemeMessage() : createUtterancesEl();
  }, [utterances, themeMode]);

  return <div ref={containerRef} />;
});

Utterances.displayName = "Utterances";

export default Utterances;
