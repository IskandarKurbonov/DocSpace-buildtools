import React from "react";
import PropTypes from "prop-types";
import PageLayout from "@appserver/common/components/PageLayout";
import toastr from "studio/toastr";
import {
  ArticleHeaderContent,
  ArticleMainButtonContent,
  ArticleBodyContent,
} from "../../components/Article";
import { SectionHeaderContent, SectionBodyContent } from "./Section";
import { withRouter } from "react-router";

import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

class Profile extends React.Component {
  componentDidMount() {
    const {
      match,
      fetchProfile,
      profile,
      location,
      t,
      setDocumentTitle,
      setFirstLoad,
    } = this.props;
    let { userId } = match.params;

    setFirstLoad(false);

    if (!userId) userId = "@self";

    setDocumentTitle(t("Common:Profile"));
    this.documentElement = document.getElementsByClassName("hidingHeader");
    const queryString = ((location && location.search) || "").slice(1);
    const queryParams = queryString.split("&");
    const arrayOfQueryParams = queryParams.map((queryParam) =>
      queryParam.split("=")
    );
    const linkParams = Object.fromEntries(arrayOfQueryParams);

    if (linkParams.email_change && linkParams.email_change === "success") {
      toastr.success(t("ChangeEmailSuccess"));
    }
    if (!profile) {
      fetchProfile(userId);
    }

    if (!profile && this.documentElement) {
      for (var i = 0; i < this.documentElement.length; i++) {
        this.documentElement[i].style.transition = "none";
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { match, fetchProfile, profile } = this.props;
    const { userId } = match.params;
    const prevUserId = prevProps.match.params.userId;

    if (userId !== undefined && userId !== prevUserId) {
      fetchProfile(userId);
    }

    if (profile && this.documentElement) {
      for (var i = 0; i < this.documentElement.length; i++) {
        this.documentElement[i].style.transition = "";
      }
    }
  }

  componentWillUnmount() {
    this.props.resetProfile();
  }

  render() {
    //console.log("Profile render");

    const { profile } = this.props;

    return (
      <PageLayout withBodyAutoFocus>
        <PageLayout.ArticleHeader>
          <ArticleHeaderContent />
        </PageLayout.ArticleHeader>

        <PageLayout.ArticleMainButton>
          <ArticleMainButtonContent />
        </PageLayout.ArticleMainButton>

        <PageLayout.ArticleBody>
          <ArticleBodyContent />
        </PageLayout.ArticleBody>

        <PageLayout.SectionHeader>
          <SectionHeaderContent profile={profile} />
        </PageLayout.SectionHeader>

        <PageLayout.SectionBody>
          <SectionBodyContent profile={profile} />
        </PageLayout.SectionBody>
      </PageLayout>
    );
  }
}

Profile.propTypes = {
  fetchProfile: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  profile: PropTypes.object,
  isAdmin: PropTypes.bool,
  language: PropTypes.string,
};

export default withRouter(
  inject(({ auth, peopleStore }) => {
    const { setDocumentTitle, isAdmin, language } = auth;
    const { targetUserStore, loadingStore } = peopleStore;
    const {
      resetTargetUser: resetProfile,
      getTargetUser: fetchProfile,
      targetUser: profile,
    } = targetUserStore;
    const { setFirstLoad } = loadingStore;
    return {
      setDocumentTitle,
      isAdmin,
      language,
      resetProfile,
      fetchProfile,
      profile,
      setFirstLoad,
    };
  })(observer(withTranslation(["Profile", "Common"])(Profile)))
);
