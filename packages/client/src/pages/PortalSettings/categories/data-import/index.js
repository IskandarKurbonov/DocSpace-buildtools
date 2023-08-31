import { useEffect, useMemo } from "react";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router-dom";
import { withTranslation } from "react-i18next";
import { ReactSVG } from "react-svg";

import Link from "@docspace/components/link";
import Box from "@docspace/components/box";
import Text from "@docspace/components/text";
import { WorkspacesContainer } from "./StyledDataImport";

import GoogleWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.google.react.svg?url";
import NextcloudWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.nextcloud.react.svg?url";
import OnlyofficeWorkspaceSvgUrl from "PUBLIC_DIR/images/workspace.onlyoffice.react.svg?url";
import GoogleWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.google.react.svg?url";
import NextcloudWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.nextcloud.react.svg?url";
import OnlyofficeWorkspaceDarkSvgUrl from "PUBLIC_DIR/images/dark.workspace.onlyoffice.react.svg?url";

const DataImport = ({ t, theme, services, setServices, getMigrationName }) => {
  const navigate = useNavigate();

  const google = theme.isBase
    ? GoogleWorkspaceSvgUrl
    : GoogleWorkspaceDarkSvgUrl;

  const nextcloud = theme.isBase
    ? NextcloudWorkspaceSvgUrl
    : NextcloudWorkspaceDarkSvgUrl;

  const onlyoffice = theme.isBase
    ? OnlyofficeWorkspaceSvgUrl
    : OnlyofficeWorkspaceDarkSvgUrl;

  const logos = {
    GoogleWorkspace: google,
    Nextcloud: nextcloud,
    Owncloud: onlyoffice,
  };

  const workspaces = useMemo(() => {
    return services.map((service) => ({
      title: service,
      logo: logos[service],
    }));
  }, [theme.isBase, services]);

  useEffect(() => {
    getMigrationName().then((res) => setServices(res));
  }, []);

  const redirectToWorkspace = (title) => {
    switch (title) {
      case "GoogleWorkspace":
        navigate(`google?service=${title}`);
        break;
      case "Nextcloud":
        navigate(`nextcloud?service=${title}`);
        break;
      case "Owncloud":
        navigate(`onlyoffice?service=${title}`);
        break;
      default:
        break;
    }
  };

  return (
    <WorkspacesContainer>
      <Text className="data-import-description">
        {t("Settings:DataImportDescription")}
      </Text>
      <Text className="data-import-subtitle">
        {t("Settings:UploadBackupData")}
      </Text>

      <Box className="workspace-list">
        {workspaces.map((workspace) => (
          <Box
            key={workspace.title}
            className="workspace-item"
            onClick={() => redirectToWorkspace(workspace.title)}
          >
            <ReactSVG src={workspace.logo} className="workspace-logo" />
            <Link
              type="page"
              fontWeight="600"
              color="#4781D1"
              isHovered
              isTextOverflow
            >
              {t("Settings:Import")}
            </Link>
          </Box>
        ))}
      </Box>
    </WorkspacesContainer>
  );
};
export default inject(({ auth, importAccountsStore }) => {
  const { services, setServices, getMigrationName } = importAccountsStore;

  return {
    services,
    setServices,
    getMigrationName,
    theme: auth.settingsStore.theme,
  };
})(withTranslation(["Settings"])(observer(DataImport)));
