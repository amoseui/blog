import React from "react";

import { StaticQuery, useStaticQuery } from "gatsby";

import { Comments } from "@/components/Post/Comments";
import * as mocks from "@/mocks";
import { testUtils } from "@/utils";

const mockedStaticQuery = StaticQuery as jest.Mock;
const mockedUseStaticQuery = useStaticQuery as jest.Mock;

describe("Comments", () => {
  beforeEach(() => {
    mockedStaticQuery.mockImplementationOnce(({ render }) =>
      render(mocks.siteMetadata),
    );

    mockedUseStaticQuery.mockReturnValue(mocks.siteMetadata);
  });

  test("renders correctly", () => {
    const tree = testUtils.createSnapshotsRenderer(<Comments />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
