import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router";
import { useTranslation, Trans } from "react-i18next";

import { combineUrl } from "@docspace/common/utils";
import history from "@docspace/common/history";

import AlertComponent from "../../AlertComponent";
import Loaders from "../../Loaders";

const PROXY_BASE_URL = combineUrl(
  window.DocSpaceConfig?.proxy?.url,
  "/portal-settings"
);

const ArticleEnterpriseAlert = ({
  theme,
  toggleArticleOpen,
  isLicenseDateExpires,
  trialDaysLeft,
  isTrial,
  paymentDate,
}) => {
  const { t, ready } = useTranslation("Common");

  const onClick = () => {
    const paymentPageUrl = combineUrl(
      PROXY_BASE_URL,
      "/payments/portal-payments"
    );
    history.push(paymentPageUrl);
    toggleArticleOpen();
  };

  const titleFunction = () => {
    if (isTrial) {
      if (isLicenseDateExpires) return t("Common:TrialExpired");
      return t("Common:TrialDaysLeft", { count: trialDaysLeft });
    }

    return t("TariffEnterprise");
  };

  const descriptionFunction = () => {
    if (isLicenseDateExpires) {
      if (isTrial) return;

      return t("SubscriptionIsExpiring", { date: paymentDate });
    }

    return t("Common:SubscriptionIsExpiring", { date: paymentDate });
  };

  const title = titleFunction();

  const additionalDescription = t("Common:RenewSubscription");

  const description = descriptionFunction();

  const color = isLicenseDateExpires
    ? theme.catalog.paymentAlert.warningColor
    : theme.catalog.paymentAlert.color;

  const isShowLoader = !ready;

  return isShowLoader ? (
    <Loaders.Rectangle width="210px" height="88px" />
  ) : (
    <AlertComponent
      id="document_catalog-payment-alert"
      borderColor={color}
      titleColor={color}
      onAlertClick={onClick}
      title={title}
      titleFontSize="11px"
      description={description}
      additionalDescription={additionalDescription}
      needArrowIcon={isTrial}
      needCloseIcon={!isTrial}
    />
  );
};

export default withRouter(
  inject(({ auth }) => {
    const { currentQuotaStore, settingsStore, currentTariffStatusStore } = auth;
    const { isTrial } = currentQuotaStore;
    const { theme } = settingsStore;
    const {
      isLicenseDateExpires,
      trialDaysLeft,
      paymentDate,
    } = currentTariffStatusStore;
    return {
      isTrial,
      isLicenseDateExpires,
      trialDaysLeft,
      paymentDate,
      theme,
    };
  })(observer(ArticleEnterpriseAlert))
);
