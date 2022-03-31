const Endpoints = require("./mocking/endpoints.js");

const browser = process.env.profile || "chromium";
const deviceType = process.env.DEVICE_TYPE || "desktop";

const isModel = !!process.env.MODEL;

const featureName = isModel
  ? `Client render on '${browser}' with '${deviceType}' dimension (model)`
  : `Client render on '${browser}' with '${deviceType}' dimension`;

Feature(featureName);

Scenario("TfaAuth page render test", async ({ I }) => {
  I.mockEndpoint(Endpoints.confirm, "confirm");
  I.amOnPage("/confirm/TfaAuth");

  I.see("Enter code from authentication app");

  I.seeElement({
    react: "TextInput",
    props: {
      id: "code",
    },
  });

  I.seeElement({
    react: "Button",
  });

  I.saveScreenshot(`1.tfa-auth.png`);
  if (!isModel) {
    I.seeVisualDiff(`1.tfa-auth.png`, {
      tolerance: 1,
      prepareBaseImage: false,
    });
  }
});

Scenario("Profile Remove page render test", async ({ I }) => {
  I.mockEndpoint(Endpoints.settings, "settings");
  I.mockEndpoint(Endpoints.confirm, "confirm");
  I.amOnPage("/confirm/ProfileRemove");

  I.see("Web Office");
  I.see("Attention! You are about to delete your account.");
  I.see('By clicking "Delete my account" you agree with our Privacy policy.');

  I.seeElement({
    react: "Button",
  });

  I.saveScreenshot(`2.profile-remove.png`);
  if (!isModel) {
    I.seeVisualDiff(`2.profile-remove.png`, {
      tolerance: 1,
      prepareBaseImage: false,
    });
  }
});

Scenario("Change phone page render test", async ({ I }) => {
  I.mockEndpoint(Endpoints.settings, "settings");
  I.mockEndpoint(Endpoints.confirm, "confirm");
  I.amOnPage("/confirm/PhoneActivation");

  I.see("Enter mobile phone number");

  I.seeElement({
    react: "TextInput",
  });

  I.seeElement({
    react: "Button",
  });

  I.saveScreenshot(`3.change-phone.png`);
  if (!isModel) {
    I.seeVisualDiff(`3.change-phone.png`, {
      tolerance: 1,
      prepareBaseImage: false,
    });
  }
});

Scenario("Create user page render test", async ({ I }) => {
  I.mockEndpoint(Endpoints.confirm, "confirm");
  I.mockEndpoint(Endpoints.settings, "settings");
  I.mockEndpoint(Endpoints.build, "build");
  I.mockEndpoint(Endpoints.settings, "settings");
  I.mockEndpoint(Endpoints.password, "password");
  I.mockEndpoint(Endpoints.user, "user");
  I.mockEndpoint(Endpoints.providers, "providers");
  I.mockEndpoint(Endpoints.capabilities, "capabilities");

  I.amOnPage("/confirm/LinkInvite?type=LinkInvite&key=KEY&uid=user&emplType=1");

  I.see("Web Office");

  I.see("Test Test");

  I.seeElement({
    react: "SocialButton",
  });

  if (deviceType === "desktop") {
    I.seeElement({
      react: "EmailInput",
    });

    I.seeElement({
      react: "TextInput",
      props: {
        name: "first-name",
      },
    });

    I.seeElement({
      react: "TextInput",
      props: {
        name: "last-name",
      },
    });

    I.seeElement({
      react: "PasswordInput",
    });
  }

  I.seeElement({
    react: "Button",
  });

  I.saveScreenshot(`4.create-user.png`);
  if (!isModel) {
    I.seeVisualDiff(`4.create-user.png`, {
      tolerance: 1,
      prepareBaseImage: false,
    });
  }
});

Scenario("Change owner page render test", async ({ I }) => {
  I.mockEndpoint(Endpoints.settings, "settings");
  I.mockEndpoint(Endpoints.confirm, "confirm");

  I.amOnPage("/confirm/PortalOwnerChange");

  I.see("Web Office");
  I.see("Please confirm that you want to change portal owner");

  I.seeElement({
    react: "Button",
    props: {
      className: "owner-button owner-buttons",
    },
  });

  I.seeElement({
    react: "Button",
    props: {
      className: "owner-buttons",
    },
  });

  I.saveScreenshot(`5.change-owner.png`);
  if (!isModel) {
    I.seeVisualDiff(`5.change-owner.png`, {
      tolerance: 1,
      prepareBaseImage: false,
    });
  }
});

Scenario("Activate user page render test", async ({ I }) => {
  I.mockEndpoint(Endpoints.settings, "settings");
  I.mockEndpoint(Endpoints.build, "build");
  I.mockEndpoint(Endpoints.password, "password");
  I.mockEndpoint(Endpoints.providers, "providers");
  I.mockEndpoint(Endpoints.confirm, "confirm");

  I.amOnPage("/confirm/Activation");

  I.see("Web Office");

  I.seeElement({
    react: "TextInput",
    props: {
      className: "confirm-row",
      id: "name",
    },
  });

  I.seeElement({
    react: "TextInput",
    props: {
      className: "confirm-row",
      id: "surname",
    },
  });

  I.seeElement({
    react: "PasswordInput",
    props: {
      className: "confirm-row",
      id: "password",
    },
  });

  I.seeElement({
    react: "Button",
    props: {
      className: "confirm-row",
    },
  });

  I.saveScreenshot(`6.activate-user.png`);
  if (!isModel) {
    I.seeVisualDiff(`6.activate-user.png`, {
      tolerance: 1,
      prepareBaseImage: false,
    });
  }
});

Scenario("Change password page render test", async ({ I }) => {
  I.mockEndpoint(Endpoints.settings, "settings");
  I.mockEndpoint(Endpoints.password, "password");
  I.mockEndpoint(Endpoints.confirm, "confirm");

  I.amOnPage("/confirm/PasswordChange");

  I.see("Web Office");
  I.see("Now you can create a new password");

  I.seeElement({
    react: "PasswordInput",
    props: {
      className: "password-input",
    },
  });

  I.seeElement({
    react: "Button",
    props: {
      className: "password-button",
    },
  });

  I.saveScreenshot(`7.change-password.png`);
  if (!isModel) {
    I.seeVisualDiff(`7.change-password.png`, {
      tolerance: 1,
      prepareBaseImage: false,
    });
  }
});

Scenario("TfaActivation page render test", async ({ I }) => {
  I.mockEndpoint(Endpoints.confirm, "confirm");
  I.mockEndpoint(Endpoints.setup, "setup");
  I.amOnPage("/confirm/TfaActivation");

  I.see("Configure your authenticator application");
  I.see(
    "To connect the app, scan the QR code or manually enter your secret key KRWVMTLBNVDGWZCG, and then enter a 6-digit code from your app in the field below."
  );

  I.seeElement({
    react: "TextInput",
    props: {
      name: "code",
    },
  });

  I.seeElement({
    react: "Button",
  });

  I.saveScreenshot(`8.tfa-activation.png`);
  if (!isModel) {
    I.seeVisualDiff(`8.tfa-activation.png`, {
      tolerance: 1,
      prepareBaseImage: false,
    });
  }
});

Scenario(
  "Language and Time Zone Settings page mobile render test",
  async ({ I }) => {
    I.mockEndpoint(Endpoints.common, "common");
    I.mockEndpoint(Endpoints.cultures, "cultures");
    I.mockEndpoint(Endpoints.timezones, "timezones");
    I.mockEndpoint(Endpoints.settings, "settingsCustomization");
    I.mockEndpoint(Endpoints.build, "build");
    I.mockEndpoint(Endpoints.info, "infoSettings");
    I.mockEndpoint(Endpoints.self, "selfSettings");

    I.amOnPage("/settings/common/customization/language-and-time-zone");

    if (deviceType === "mobile") {
      I.see("Language and Time Zone Settings");

      I.seeElement("div", ".settings-block");

      I.seeElement({
        react: "Button",
        props: {
          label: "Save",
          isDisabled: true,
        },
      });

      I.seeElement({
        react: "Button",
        props: {
          label: "Cancel",
          isDisabled: true,
        },
      });

      I.saveScreenshot(`9.language-and-time-zone-settings-mobile.png`);
      if (!isModel) {
        I.seeVisualDiff(`9.language-and-time-zone-settings-mobile.png`, {
          tolerance: 1,
          prepareBaseImage: false,
        });
      }
    }
  }
);
