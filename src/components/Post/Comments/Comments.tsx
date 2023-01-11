import React from "react";

import { useSiteMetadata } from "@/hooks";

import { Utterances } from "./Utterances";

const Comments: React.FC = () => {
  const { utterances } = useSiteMetadata();

  if (!utterances) {
    return null;
  }

  return <Utterances utterances={utterances} />;
};

export default Comments;
