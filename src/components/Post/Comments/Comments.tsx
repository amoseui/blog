import React from "react";

import { useSiteMetadata } from "@/hooks";

import { GiscusComments } from "./GiscusComments";

const Comments: React.FC = () => {
  const { giscus } = useSiteMetadata();

  if (!giscus) {
    return null;
  }

  return <GiscusComments />;
};

export default Comments;
