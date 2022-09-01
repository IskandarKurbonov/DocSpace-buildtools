import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import Button from "@docspace/components/button";
import Text from "@docspace/components/text";
import TextInput from "@docspace/components/text-input";
import Link from "@docspace/components/link";
import Checkbox from "@docspace/components/checkbox";
import Toast from "@docspace/components/toast";
import HelpButton from "@docspace/components/help-button";
import PasswordInput from "@docspace/components/password-input";
import FieldContainer from "@docspace/components/field-container";
import SocialButton from "@docspace/components/social-button";
import FacebookButton from "@docspace/components/facebook-button";
import Section from "@docspace/common/components/Section";
import ForgotPasswordModalDialog from "./sub-components/forgot-password-modal-dialog";
import RecoverAccessModalDialog from "./sub-components/recover-access-modal-dialog";
import MoreLoginModal from "./sub-components/more-login";
import Register from "./sub-components/register-container";
import {
  getAuthProviders,
  getCapabilities,
} from "@docspace/common/api/settings";
import { checkPwd } from "@docspace/common/desktop";
import {
  createPasswordHash,
  getProviderTranslation,
} from "@docspace/common/utils";
import { providersData } from "@docspace/common/constants";
import { inject, observer } from "mobx-react";
import i18n from "./i18n";
import {
  I18nextProvider,
  useTranslation,
  withTranslation,
} from "react-i18next";
import toastr from "@docspace/components/toast/toastr";
import {
  ButtonsWrapper,
  LoginContainer,
  LoginFormWrapper,
} from "./StyledLogin";
import AppLoader from "@docspace/common/components/AppLoader";
import EmailInput from "@docspace/components/email-input";
import { ReactSVG } from "react-svg";
import FormWrapper from "@docspace/components/form-wrapper";

import { ColorTheme, ThemeType } from "@docspace/common/components/ColorTheme";

const settings = {
  minLength: 6,
  upperCase: false,
  digits: false,
  specSymbols: false,
};

const Form = (props) => {
  const inputRef = React.useRef(null);

  const [identifierValid, setIdentifierValid] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const [passwordValid, setPasswordValid] = useState(true);
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const [moreAuthVisible, setMoreAuthVisible] = useState(false);
  const [ssoLabel, setSsoLabel] = useState("");
  const [ssoUrl, setSsoUrl] = useState("");

  const [errorText, setErrorText] = useState("");

  const [isLoaded, setIsLoaded] = useState(false);

  const [isEmailErrorShow, setIsEmailErrorShow] = useState(false);

  const [recoverDialogVisible, setRecoverDialogVisible] = useState(false);

  const { t } = useTranslation("Login");

  const {
    login,
    hashSettings,
    isDesktop,
    match,
    organizationName,
    greetingTitle,
    history,
    thirdPartyLogin,
    providers,
    setRoomsMode,
  } = props;

  const { error, confirmedEmail } = match.params;

  const oAuthLogin = async (profile) => {
    try {
      await thirdPartyLogin(profile);

      const redirectPath = localStorage.getItem("redirectPath");

      if (redirectPath) {
        localStorage.removeItem("redirectPath");
        window.location.href = redirectPath;
      }
    } catch (e) {
      toastr.error(
        t("Common:ProviderNotConnected"),
        t("Common:ProviderLoginError")
      );
    }

    localStorage.removeItem("profile");
    localStorage.removeItem("code");
  };

  const getSso = async () => {
    const data = await getCapabilities();
    setSsoLabel(data.ssoLabel);
    setSsoUrl(data.ssoUrl);
  };

  useEffect(() => {
    const profile = localStorage.getItem("profile");
    if (!profile) return;

    oAuthLogin(profile);
  }, []);

  const onKeyDown = (e) => {
    //console.log("onKeyDown", e.key);
    if (e.key === "Enter") {
      onClearErrors(e);
      !isDisabled && onSubmit(e);
      e.preventDefault();
    }
  };

  const onClearErrors = (e) => {
    //console.log("onClearErrors", e);
    !passwordValid && setPasswordValid(true);
  };

  //const throttledKeyPress = throttle(onKeyPress, 500);

  const authCallback = (profile) => {
    oAuthLogin(profile);
  };

  const setProviders = async () => {
    const { setProviders } = props;

    try {
      await getAuthProviders().then((providers) => {
        setProviders(providers);
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(async () => {
    document.title = `${t("Authorization")} – ${organizationName}`; //TODO: implement the setDocumentTitle() utility in ASC.Web.Common

    error && setErrorText(error);
    confirmedEmail && setIdentifier(confirmedEmail);

    Promise.all([setProviders(), getSso()]).then(() => {
      setIsLoaded(true);
      focusInput();
    });

    window.authCallback = authCallback;

    //window.addEventListener("keyup", throttledKeyPress, false);

    /*return () => {
      window.removeEventListener("keyup", throttledKeyPress, false);
    };*/
  }, []);

  const focusInput = () => {
    if (inputRef) {
      inputRef.current.focus();
    }
  };

  const onChangeLogin = (e) => {
    //console.log("onChangeLogin", e.target.value);
    setIdentifier(e.target.value);
    setIsEmailErrorShow(false);
    onClearErrors(e);
  };

  const onChangePassword = (e) => {
    //console.log("onChangePassword", e.target.value);
    setPassword(e.target.value);
    onClearErrors(e);
  };

  const onChangeCheckbox = () => setIsChecked(!isChecked);

  const onClick = () => {
    setIsDialogVisible(true);
    setIsDisabled(true);
  };

  const onDialogClose = () => {
    setIsDialogVisible(false);
    setIsDisabled(false);
    setIsLoading(false);
  };

  const moreAuthOpen = () => {
    setMoreAuthVisible(true);
  };

  const moreAuthClose = () => {
    setMoreAuthVisible(false);
  };

  const onSubmit = () => {
    //errorText && setErrorText("");
    let hasError = false;

    const userName = identifier.trim();

    if (!userName) {
      hasError = true;
      setIdentifierValid(false);
      setIsEmailErrorShow(true);
    }

    const pass = password.trim();

    if (!pass) {
      hasError = true;
      setPasswordValid(false);
    }

    if (!identifierValid) hasError = true;

    if (hasError) return false;

    setIsLoading(true);
    const hash = createPasswordHash(pass, hashSettings);

    isDesktop && checkPwd();
    const session = !isChecked;
    login(userName, hash, session)
      .then((res) => {
        const { url, user, hash } = res;
        const redirectPath = localStorage.getItem("redirectPath");

        if (redirectPath) {
          localStorage.removeItem("redirectPath");
          window.location.href = redirectPath;
        } else history.push(url, { user, hash });
      })
      .catch((error) => {
        setIsEmailErrorShow(true);
        setErrorText(error);
        setPasswordValid(!error);
        setIsLoading(false);
        focusInput();
      });
  };

  const onLoginWithCodeClick = () => {
    setRoomsMode(true);
  };

  const onSocialButtonClick = useCallback((e) => {
    const providerName = e.target.dataset.providername;
    const url = e.target.dataset.url;

    const { getOAuthToken, getLoginLink } = props;

    try {
      const tokenGetterWin = isDesktop
        ? (window.location.href = url)
        : window.open(
            url,
            "login",
            "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no"
          );

      getOAuthToken(tokenGetterWin).then((code) => {
        const token = window.btoa(
          JSON.stringify({
            auth: providerName,
            mode: "popup",
            callback: "authCallback",
          })
        );

        tokenGetterWin.location.href = getLoginLink(token, code);
      });
    } catch (err) {
      console.log(err);
    }
  }, []);

  const providerButtons = () => {
    const providerButtons =
      providers &&
      providers.map((item, index) => {
        if (!providersData[item.provider]) return;
        if (index > 1) return;

        const { icon, label, iconOptions, className } = providersData[
          item.provider
        ];

        return (
          <div className="buttonWrapper" key={`${item.provider}ProviderItem`}>
            <SocialButton
              iconName={icon}
              label={getProviderTranslation(label, t)}
              className={`socialButton ${className ? className : ""}`}
              $iconOptions={iconOptions}
              data-url={item.url}
              data-providername={item.provider}
              onClick={onSocialButtonClick}
              isDisabled={isLoading}
            />
          </div>
        );
      });

    return providerButtons;
  };

  const ssoButton = () => {
    return (
      <div className="buttonWrapper">
        <SocialButton
          iconName="/static/images/sso.react.svg"
          className="socialButton"
          label={ssoLabel || getProviderTranslation("sso", t)}
          onClick={() => (window.location.href = ssoUrl)}
          isDisabled={isLoading}
        />
      </div>
    );
  };

  const oauthDataExists = () => {
    let existProviders = 0;
    providers && providers.length > 0;
    providers.map((item) => {
      if (!providersData[item.provider]) return;
      existProviders++;
    });

    return !!existProviders;
  };

  const ssoExists = () => {
    if (ssoUrl) return true;
    else return false;
  };

  const onValidateEmail = (res) => {
    //console.log("onValidateEmail", res);
    setIdentifierValid(res.isValid);
    setErrorText(res.errors[0]);
  };

  const onBlurEmail = () => {
    !identifierValid && setIsEmailErrorShow(true);
  };

  //console.log("Login render");

  return (
    <ColorTheme {...props} themeId={ThemeType.LinkForgotPassword}>
      {!isLoaded ? (
        <AppLoader />
      ) : (
        <>
          <ReactSVG
            src="/static/images/docspace.big.react.svg"
            className="logo-wrapper"
          />
          <Text
            fontSize="23px"
            fontWeight={700}
            textAlign="center"
            className="greeting-title"
          >
            {greetingTitle}
          </Text>

          <FormWrapper>
            {ssoExists() && <ButtonsWrapper>{ssoButton()}</ButtonsWrapper>}

            {oauthDataExists() && (
              <>
                <ButtonsWrapper>{providerButtons()}</ButtonsWrapper>
                {providers && providers.length > 2 && (
                  <Link
                    isHovered
                    type="action"
                    fontSize="13px"
                    fontWeight="600"
                    color="#3B72A7"
                    className="more-label"
                    onClick={moreAuthOpen}
                  >
                    {t("Common:ShowMore")}
                  </Link>
                )}
              </>
            )}

            {(oauthDataExists() || ssoExists()) && (
              <div className="line">
                <Text color="#A3A9AE" className="or-label">
                  {t("Or")}
                </Text>
              </div>
            )}

            <form className="auth-form-container">
              <FieldContainer
                isVertical={true}
                labelVisible={false}
                hasError={isEmailErrorShow}
                errorMessage={
                  errorText
                    ? t(`Common:${errorText}`)
                    : t("Common:RequiredField")
                } //TODO: Add wrong login server error
              >
                <EmailInput
                  id="login"
                  name="login"
                  type="email"
                  hasError={isEmailErrorShow}
                  value={identifier}
                  placeholder={t("RegistrationEmailWatermark")}
                  size="large"
                  scale={true}
                  isAutoFocussed={true}
                  tabIndex={1}
                  isDisabled={isLoading}
                  autoComplete="username"
                  onChange={onChangeLogin}
                  onBlur={onBlurEmail}
                  onValidateInput={onValidateEmail}
                  forwardedRef={inputRef}
                />
              </FieldContainer>
              <FieldContainer
                isVertical={true}
                labelVisible={false}
                hasError={!passwordValid}
                errorMessage={!password.trim() ? t("Common:RequiredField") : ""} //TODO: Add wrong password server error
              >
                <PasswordInput
                  simpleView={true}
                  passwordSettings={settings}
                  id="password"
                  inputName="password"
                  placeholder={t("Common:Password")}
                  type="password"
                  hasError={!passwordValid}
                  inputValue={password}
                  size="large"
                  scale={true}
                  tabIndex={1}
                  isDisabled={isLoading}
                  autoComplete="current-password"
                  onChange={onChangePassword}
                  onKeyDown={onKeyDown}
                />
              </FieldContainer>

              <div className="login-forgot-wrapper">
                <div className="login-checkbox-wrapper">
                  <div className="remember-wrapper">
                    <Checkbox
                      className="login-checkbox"
                      isChecked={isChecked}
                      onChange={onChangeCheckbox}
                      label={t("Remember")}
                      helpButton={
                        <HelpButton
                          helpButtonHeaderContent={t("CookieSettingsTitle")}
                          tooltipContent={
                            <Text fontSize="12px">{t("RememberHelper")}</Text>
                          }
                        />
                      }
                    />
                  </div>

                  <Link
                    fontSize="13px"
                    className="login-link"
                    type="page"
                    isHovered={false}
                    onClick={onClick}
                  >
                    {t("ForgotPassword")}
                  </Link>
                </div>
              </div>

              {isDialogVisible && (
                <ForgotPasswordModalDialog
                  visible={isDialogVisible}
                  email={identifier}
                  onDialogClose={onDialogClose}
                />
              )}
              <Button
                id="submit"
                className="login-button"
                primary
                size="medium"
                scale={true}
                label={
                  isLoading
                    ? t("Common:LoadingProcessing")
                    : t("Common:LoginButton")
                }
                tabIndex={1}
                isDisabled={isLoading}
                isLoading={isLoading}
                onClick={onSubmit}
              />

              {/*Uncomment when add api*/}
              <div className="login-or-access">
                {/*<Link
                  fontWeight="600"
                  fontSize="13px"
                  color="#316DAA"
                  type="action"
                  isHovered={true}
                  onClick={onLoginWithCodeClick}
                >
                  {t("SignInWithCode")}
                </Link>*/}

                <Text color="#A3A9AE">{t("Or")}</Text>
                <Link
                  fontWeight="600"
                  fontSize="13px"
                  color="#316DAA"
                  type="action"
                  isHovered={true}
                  onClick={() => setRecoverDialogVisible(true)}
                >
                  {t("RecoverAccess")}
                </Link>
              </div>
              {confirmedEmail && (
                <Text isBold={true} fontSize="16px">
                  {t("MessageEmailConfirmed")} {t("MessageAuthorize")}
                </Text>
              )}
            </form>
          </FormWrapper>
          <Toast />

          <MoreLoginModal
            t={t}
            visible={moreAuthVisible}
            onClose={moreAuthClose}
            providers={providers}
            onSocialLoginClick={onSocialButtonClick}
            ssoLabel={ssoLabel}
            ssoUrl={ssoUrl}
          />

          <RecoverAccessModalDialog
            t={t}
            visible={recoverDialogVisible}
            onClose={() => setRecoverDialogVisible(false)}
          />
        </>
      )}
    </ColorTheme>
  );
};

Form.propTypes = {
  login: PropTypes.func.isRequired,
  match: PropTypes.object.isRequired,
  hashSettings: PropTypes.object,
  greetingTitle: PropTypes.string.isRequired,
  organizationName: PropTypes.string,
  homepage: PropTypes.string,
  defaultPage: PropTypes.string,
  isDesktop: PropTypes.bool,
};

Form.defaultProps = {
  identifier: "",
  password: "",
  email: "",
};

const LoginForm = (props) => {
  const { enabledJoin, isDesktop } = props;

  return (
    <LoginFormWrapper
      enabledJoin={enabledJoin}
      isDesktop={isDesktop}
      className="with-background-pattern"
    >
      <Section>
        <Section.SectionBody>
          <Form {...props} />
        </Section.SectionBody>
      </Section>
      <Register />
    </LoginFormWrapper>
  );
};

LoginForm.propTypes = {
  isLoaded: PropTypes.bool,
  enabledJoin: PropTypes.bool,
  isDesktop: PropTypes.bool.isRequired,
};

const Login = inject(({ auth }) => {
  const {
    settingsStore,
    isAuthenticated,
    isLoaded,
    login,
    thirdPartyLogin,
    setProviders,
    providers,
  } = auth;
  const {
    greetingSettings: greetingTitle,
    organizationName,
    hashSettings,
    enabledJoin,
    defaultPage,
    isDesktopClient: isDesktop,
    getOAuthToken,
    getLoginLink,
    setRoomsMode,
  } = settingsStore;

  return {
    isAuthenticated,
    isLoaded,
    organizationName,
    greetingTitle,
    hashSettings,
    enabledJoin,
    defaultPage,
    isDesktop,
    login,
    thirdPartyLogin,
    getOAuthToken,
    getLoginLink,
    setProviders,
    providers,
    setRoomsMode,
  };
})(withRouter(observer(withTranslation(["Login", "Common"])(LoginForm))));

export default (props) => (
  <I18nextProvider i18n={i18n}>
    <Login {...props} />
  </I18nextProvider>
);
