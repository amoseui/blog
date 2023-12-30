import React from "react";

interface Props {
  description: string;
  image?: string;
  title: string;
}

const naverMeta = "b14b409f559df7b1c4219c72067097d7cd45ce9c";
const Meta: React.FC<Props> = ({ description, title, image }: Props) => (
  <>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="naver-site-verification" content={naverMeta} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="og:title" content={title} />
    <meta name="og:type" content="website" />
    <meta name="og:description" content={description} />

    {image ? (
      <>
        <meta name="image" content={image} />
        <meta name="og:image" content={image} />
        <meta name="twitter:image" content={image} />
      </>
    ) : null}
  </>
);

export default Meta;
