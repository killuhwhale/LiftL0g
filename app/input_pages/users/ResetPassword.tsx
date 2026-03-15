import React, { FunctionComponent } from "react";
import { useTheme } from "styled-components";
import styled from "styled-components/native";

import { Container } from "@/src/app_components/shared";
import ResetPasswordOld from "@/src/app_components/passwords/resetPasswordOld";

const PageContainer = styled(Container)`
  background-color: ${(props) => props.theme.palette.backgroundColor};
  justify-content: space-between;
  width: 100%;
`;

// Convert a JSON stringified list to a space demilimited string

const ResetPasswordScreen: FunctionComponent = () => {
  const theme = useTheme();
  // Access/ send actions

  return (
    <PageContainer>
      <ResetPasswordOld />
    </PageContainer>
  );
};

export default ResetPasswordScreen;
