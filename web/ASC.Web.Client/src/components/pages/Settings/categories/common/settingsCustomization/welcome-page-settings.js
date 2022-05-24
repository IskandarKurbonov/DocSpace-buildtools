import React from "react";
import { withTranslation } from "react-i18next";
import FieldContainer from "@appserver/components/field-container";
import Loader from "@appserver/components/loader";
import toastr from "@appserver/components/toast/toastr";
import TextInput from "@appserver/components/text-input";
import HelpButton from "@appserver/components/help-button";
import SaveCancelButtons from "@appserver/components/save-cancel-buttons";
import { showLoader, hideLoader } from "@appserver/common/utils";
import { saveToSessionStorage, getFromSessionStorage } from "../../../utils";
import { setDocumentTitle } from "../../../../../../helpers/utils";
import { inject, observer } from "mobx-react";
import { CustomTitlesTooltip } from "../sub-components/common-tooltips";
import { combineUrl } from "@appserver/common/utils";
import { AppServerConfig } from "@appserver/common/constants";
import config from "../../../../../../../package.json";
import history from "@appserver/common/history";
import { isMobileOnly } from "react-device-detect";
import { isSmallTablet } from "@appserver/components/utils/device";
import checkScrollSettingsBlock from "../utils";
import { StyledSettingsComponent, StyledScrollbar } from "./StyledSettings";
import LoaderCustomization from "../sub-components/loaderCustomization";
import withLoading from "../../../../../../HOCs/withLoading";

let greetingTitleFromSessionStorage = "";
let greetingTitleDefaultFromSessionStorage = "";
let isFirstWelcomePageSettings = "";
const settingNames = ["greetingTitle"];

class WelcomePageSettings extends React.Component {
  constructor(props) {
    super(props);

    const { t, greetingSettings /*, organizationName*/ } = props;

    greetingTitleFromSessionStorage = getFromSessionStorage("greetingTitle");

    greetingTitleDefaultFromSessionStorage = getFromSessionStorage(
      "greetingTitleDefault"
    );

    isFirstWelcomePageSettings = localStorage.getItem(
      "isFirstWelcomePageSettings"
    );

    setDocumentTitle(t("CustomTitlesWelcome"));

    this.state = {
      isLoading: false,
      greetingTitle: greetingTitleFromSessionStorage || greetingSettings,
      greetingTitleDefault:
        greetingTitleDefaultFromSessionStorage || greetingSettings,
      isLoadingGreetingSave: false,
      isLoadingGreetingRestore: false,
      hasChanged: false,
      showReminder: false,
      hasScroll: false,
      isFirstWelcomePageSettings: isFirstWelcomePageSettings,
    };
  }

  componentDidMount() {
    const { isLoaded, setIsLoadedWelcomePageSettings, tReady } = this.props;
    const { greetingTitleDefault } = this.state;
    window.addEventListener("resize", this.checkInnerWidth);

    const isLoadedSetting = isLoaded && tReady;

    if (isLoadedSetting) setIsLoadedWelcomePageSettings(isLoadedSetting);

    if (greetingTitleDefault) {
      this.checkChanges();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isLoaded, setIsLoadedWelcomePageSettings, tReady } = this.props;

    const { hasScroll } = this.state;

    if (isLoaded !== prevProps.isLoaded || tReady !== prevProps.tReady) {
      const isLoadedSetting = isLoaded && tReady;

      if (isLoadedSetting) {
        setIsLoadedWelcomePageSettings(isLoadedSetting);
      }
    }

    const checkScroll = checkScrollSettingsBlock();

    window.addEventListener("resize", checkScroll);
    const scrollLngTZSettings = checkScroll();

    if (scrollLngTZSettings !== hasScroll) {
      this.setState({
        hasScroll: scrollLngTZSettings,
      });
    }

    // TODO: Remove div with height 64 and remove settings-mobile class
    const settingsMobile = document.getElementsByClassName(
      "settings-mobile"
    )[0];

    if (settingsMobile) {
      settingsMobile.style.display = "none";
    }

    if (this.state.greetingTitleDefault) {
      this.checkChanges();
    }
  }

  componentWillUnmount() {
    window.removeEventListener(
      "resize",
      this.checkInnerWidth,
      checkScrollSettingsBlock
    );
  }

  onChangeGreetingTitle = (e) => {
    this.setState({ greetingTitle: e.target.value });

    if (this.settingIsEqualInitialValue("greetingTitle", e.target.value)) {
      saveToSessionStorage("greetingTitle", "");
      saveToSessionStorage("greetingTitleDefault", "");
    } else {
      saveToSessionStorage("greetingTitle", e.target.value);
      this.setState({
        showReminder: true,
      });
    }

    this.checkChanges();
  };

  onSaveGreetingSettings = () => {
    const { setGreetingTitle, t } = this.props;
    const { greetingTitle } = this.state;
    this.setState({ isLoadingGreetingSave: true }, function () {
      setGreetingTitle(greetingTitle)
        .then(() =>
          toastr.success(t("SuccessfullySaveGreetingSettingsMessage"))
        )
        .catch((error) => toastr.error(error))
        .finally(() => this.setState({ isLoadingGreetingSave: false }));
    });

    this.setState({
      showReminder: false,
      greetingTitle: greetingTitle,
      greetingTitleDefault: greetingTitle,
    });

    saveToSessionStorage("greetingTitle", greetingTitle);
    saveToSessionStorage("greetingTitleDefault", greetingTitle);

    if (!localStorage.getItem("isFirstWelcomePageSettings")) {
      localStorage.setItem("isFirstWelcomePageSettings", true);
      this.setState({
        isFirstWelcomePageSettings: "true",
      });
    }
  };

  onRestoreGreetingSettings = () => {
    const { restoreGreetingTitle, t } = this.props;
    this.setState({ isLoadingGreetingRestore: true }, function () {
      restoreGreetingTitle()
        .then(() => {
          this.setState({
            greetingTitle: this.props.greetingSettings,
            greetingTitleDefault: this.props.greetingSettings,
            showReminder: false,
          });
          saveToSessionStorage("greetingTitle", "");
          toastr.success(t("SuccessfullySaveGreetingSettingsMessage"));
        })
        .catch((error) => toastr.error(error))
        .finally(() => this.setState({ isLoadingGreetingRestore: false }));
    });
  };

  settingIsEqualInitialValue = (stateName, value) => {
    const defaultValue = JSON.stringify(this.state[stateName + "Default"]);
    const currentValue = JSON.stringify(value);
    return defaultValue === currentValue;
  };

  checkChanges = () => {
    let hasChanged = false;

    settingNames.forEach((settingName) => {
      const valueFromSessionStorage = getFromSessionStorage(settingName);
      if (
        valueFromSessionStorage &&
        !this.settingIsEqualInitialValue(settingName, valueFromSessionStorage)
      )
        hasChanged = true;
    });

    if (hasChanged !== this.state.hasChanged) {
      this.setState({
        hasChanged: hasChanged,
        showReminder: hasChanged,
      });
    }
  };

  checkInnerWidth = () => {
    if (!isSmallTablet()) {
      history.push(
        combineUrl(
          AppServerConfig.proxyURL,
          config.homepage,
          "/settings/common/customization"
        )
      );
      return true;
    }
  };

  onClickLink = (e) => {
    e.preventDefault();
    history.push(e.target.pathname);
  };

  render() {
    const { t, isMobileView, isLoadedPage } = this.props;
    const {
      greetingTitle,
      isLoadingGreetingSave,
      isLoadingGreetingRestore,
      showReminder,
      hasScroll,
      isFirstWelcomePageSettings,
    } = this.state;

    const tooltipCustomTitlesTooltip = <CustomTitlesTooltip t={t} />;

    const settingsBlock = (
      <div className="settings-block">
        <FieldContainer
          id="fieldContainerWelcomePage"
          className="field-container-width"
          labelText={`${t("Common:Title")}:`}
          isVertical={true}
        >
          <TextInput
            id="textInputContainerWelcomePage"
            scale={true}
            value={greetingTitle}
            onChange={this.onChangeGreetingTitle}
            isDisabled={isLoadingGreetingSave || isLoadingGreetingRestore}
            placeholder={`${t("Cloud Office Applications")}`}
          />
        </FieldContainer>
      </div>
    );

    return !isLoadedPage ? (
      <LoaderCustomization welcomePage={true} />
    ) : (
      <StyledSettingsComponent
        hasScroll={hasScroll}
        className="category-item-wrapper"
      >
        {this.checkInnerWidth() && !isMobileView && (
          <div className="category-item-heading">
            <div className="category-item-title">
              {t("CustomTitlesWelcome")}
            </div>
            <HelpButton
              iconName="static/images/combined.shape.svg"
              size={12}
              tooltipContent={tooltipCustomTitlesTooltip}
            />
          </div>
        )}
        {(isMobileOnly && isSmallTablet()) || isSmallTablet() ? (
          <StyledScrollbar stype="smallBlack">{settingsBlock}</StyledScrollbar>
        ) : (
          <> {settingsBlock}</>
        )}
        <SaveCancelButtons
          id="buttonsWelcomePage"
          className="save-cancel-buttons"
          onSaveClick={this.onSaveGreetingSettings}
          onCancelClick={this.onRestoreGreetingSettings}
          showReminder={showReminder}
          reminderTest={t("YouHaveUnsavedChanges")}
          saveButtonLabel={t("Common:SaveButton")}
          cancelButtonLabel={t("Settings:RestoreDefaultButton")}
          displaySettings={true}
          hasScroll={hasScroll}
          isFirstWelcomePageSettings={isFirstWelcomePageSettings}
        />
      </StyledSettingsComponent>
    );
  }
}

export default inject(({ auth, setup, common }) => {
  const { greetingSettings, organizationName, theme } = auth.settingsStore;
  const { setGreetingTitle, restoreGreetingTitle } = setup;
  const { isLoaded, setIsLoadedWelcomePageSettings } = common;
  return {
    theme,
    greetingSettings,
    organizationName,
    setGreetingTitle,
    restoreGreetingTitle,
    isLoaded,
    setIsLoadedWelcomePageSettings,
  };
})(
  withLoading(
    withTranslation(["Settings", "Common"])(observer(WelcomePageSettings))
  )
);