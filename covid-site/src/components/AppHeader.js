import React from 'react';
import { Box, Heading, Header } from "grommet";
import { useTranslation } from 'react-i18next';

export default () => {
  const { t } = useTranslation();

  return (
    <Header background="light-2" pad="medium" align="center" justify="center">
      <Heading level={5} color="dark-5" margin="none" size="small" style={{ display: "flex", alignItems: "center" }}>
        {t('SITE_TITLE_1')}
        <img src="/logo.png" alt="logo" style={{ width: "34pt", height: "auto", marginHorizontal: "10px" }} />
        {t('SITE_TITLE_2')}
      </Heading>
    </Header>
  );
};