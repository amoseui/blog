// @flow strict
import React from 'react';
import Utterances from '../Utterances';
import { useSiteMetadata } from '../../../hooks';

const Comments = () => {
  const { utterances } = useSiteMetadata();

  if (!utterances) {
    return null;
  }

  return (
    <Utterances utterances={utterances} />
  );
};

export default Comments;
