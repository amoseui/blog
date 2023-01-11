import React, { createRef, useLayoutEffect } from "react";

const src = "https://utteranc.es/client.js";

export interface IUtterancesProps {
  utterances: { [key: string]: string };
}

const Utterances: React.FC<IUtterancesProps> = React.memo(({ utterances }) => {
  const containerRef = createRef();

  useLayoutEffect(() => {
    const utterancesScript = document.createElement("script");

    const attributes = {
      src,
      repo: utterances.repo,
      "issue-term": utterances.issueTerm,
      label: utterances.label,
      theme: utterances.theme,
      crossOrigin: "anonymous",
      async: "true",
    };

    Object.entries(attributes).forEach(([key, value]) => {
      utterancesScript.setAttribute(key, value);
    });

    if (containerRef.current) {
      containerRef.current.appendChild(utterancesScript);
    }
  }, [utterances]);

  return <div ref={containerRef} />;
});

Utterances.displayName = "Utterances";

export default Utterances;
