%install
rm -rf %{buildroot}
mkdir -p "%{buildroot}/usr/lib/systemd/system/"
mkdir -p "%{buildroot}/%{_var}/www/onlyoffice/Data"
mkdir -p "%{buildroot}%{buildpath}/Tools/radicale/plugins/"
mkdir -p "%{buildroot}%{buildpath}/studio/ASC.Web.Studio/"
mkdir -p "%{buildroot}%{buildpath}/studio/ASC.Web.Api/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.Web.HealthChecks.UI/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.Studio.Notify/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.SsoAuth/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.Socket.IO/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.Notify/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.Migration.Runner/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.Data.Backup/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.Data.Backup.BackgroundTasks/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.ClearEvents/"
mkdir -p "%{buildroot}%{buildpath}/services/ASC.ApiSystem/"
mkdir -p "%{buildroot}%{buildpath}/public/"
mkdir -p "%{buildroot}%{buildpath}/products/ASC.People/server/"
mkdir -p "%{buildroot}%{buildpath}/products/ASC.People/client/"
mkdir -p "%{buildroot}%{buildpath}/products/ASC.Login/login/"
mkdir -p "%{buildroot}%{buildpath}/products/ASC.Files/service/"
mkdir -p "%{buildroot}%{buildpath}/products/ASC.Files/server/DocStore/"
mkdir -p "%{buildroot}%{buildpath}/products/ASC.Files/editor/"
mkdir -p "%{buildroot}%{buildpath}/products/ASC.Files/client/"
mkdir -p "%{buildroot}%{buildpath}/client/"
mkdir -p "%{buildroot}%{_var}/log/onlyoffice/%{product}/"
mkdir -p "%{buildroot}%{_sysconfdir}/openresty/includes/"
mkdir -p "%{buildroot}%{_sysconfdir}/openresty/conf.d/"
mkdir -p "%{buildroot}%{_sysconfdir}/onlyoffice/%{product}/openresty"
mkdir -p "%{buildroot}%{_sysconfdir}/onlyoffice/%{product}/.private/"
mkdir -p "%{buildroot}%{_sysconfdir}/logrotate.d"
mkdir -p "%{buildroot}%{_docdir}/%{name}-%{version}-%{release}/"
mkdir -p "%{buildroot}%{_bindir}/"
cp -rf %{_builddir}/publish/web/public/* "%{buildroot}%{buildpath}/public/"
cp -rf %{_builddir}/publish/web/login/* "%{buildroot}%{buildpath}/products/ASC.Login/login/"
cp -rf %{_builddir}/publish/web/editor/* "%{buildroot}%{buildpath}/products/ASC.Files/editor/"
cp -rf %{_builddir}/publish/web/client/* "%{buildroot}%{buildpath}/client/"
cp -rf %{_builddir}/server/publish/services/ASC.Web.Studio/service/* "%{buildroot}%{buildpath}/studio/ASC.Web.Studio/"
cp -rf %{_builddir}/server/publish/services/ASC.Web.HealthChecks.UI/service/* "%{buildroot}%{buildpath}/services/ASC.Web.HealthChecks.UI/"
cp -rf %{_builddir}/server/publish/services/ASC.Web.Api/service/* "%{buildroot}%{buildpath}/studio/ASC.Web.Api/"
cp -rf %{_builddir}/server/publish/services/ASC.Studio.Notify/service/* "%{buildroot}%{buildpath}/services/ASC.Studio.Notify/"
cp -rf %{_builddir}/server/publish/services/ASC.SsoAuth/service/* "%{buildroot}%{buildpath}/services/ASC.SsoAuth/"
cp -rf %{_builddir}/server/publish/services/ASC.Socket.IO/service/* "%{buildroot}%{buildpath}/services/ASC.Socket.IO/"
cp -rf %{_builddir}/server/publish/services/ASC.Notify/service/* "%{buildroot}%{buildpath}/services/ASC.Notify/"
cp -rf %{_builddir}/server/publish/services/ASC.Files.Service/service/* "%{buildroot}%{buildpath}/products/ASC.Files/service/"
cp -rf %{_builddir}/server/publish/services/ASC.Data.Backup/service/* "%{buildroot}%{buildpath}/services/ASC.Data.Backup/"
cp -rf %{_builddir}/server/publish/services/ASC.Data.Backup.BackgroundTasks/service/* "%{buildroot}%{buildpath}/services/ASC.Data.Backup.BackgroundTasks/"
cp -rf %{_builddir}/server/publish/services/ASC.ClearEvents/service/* "%{buildroot}%{buildpath}/services/ASC.ClearEvents/"
cp -rf %{_builddir}/server/publish/services/ASC.ApiSystem/service/* "%{buildroot}%{buildpath}/services/ASC.ApiSystem/"
cp -rf %{_builddir}/server/publish/products/ASC.People/server/* "%{buildroot}%{buildpath}/products/ASC.People/server/"
cp -rf %{_builddir}/server/publish/products/ASC.Files/server/* "%{buildroot}%{buildpath}/products/ASC.Files/server/"
cp -rf %{_builddir}/server/LICENSE "%{buildroot}%{_docdir}/%{name}-%{version}-%{release}/"
cp -rf %{_builddir}/server/ASC.Migration.Runner/service/* "%{buildroot}%{buildpath}/services/ASC.Migration.Runner/"
cp -rf %{_builddir}/document-templates-main-community-server/* "%{buildroot}%{buildpath}/products/ASC.Files/server/DocStore/"
cp -rf %{_builddir}/buildtools/install/RadicalePlugins/* "%{buildroot}%{buildpath}/Tools/radicale/plugins/"
cp -rf %{_builddir}/buildtools/install/docker/config/nginx/templates/nginx.conf.template "%{buildroot}%{_sysconfdir}/onlyoffice/%{product}/openresty/nginx.conf.template"
cp -rf %{_builddir}/buildtools/install/docker/config/nginx/onlyoffice-proxy.conf "%{buildroot}%{_sysconfdir}/openresty/conf.d/onlyoffice-proxy.conf"
cp -rf %{_builddir}/buildtools/install/docker/config/nginx/onlyoffice-proxy-ssl.conf "%{buildroot}%{_sysconfdir}/openresty/conf.d/onlyoffice-proxy-ssl.conf.template"
cp -rf %{_builddir}/buildtools/install/docker/config/nginx/letsencrypt.conf "%{buildroot}%{_sysconfdir}/openresty/includes/letsencrypt.conf"
cp -rf %{_builddir}/buildtools/install/common/systemd/modules/* "%{buildroot}/usr/lib/systemd/system/"
cp -rf %{_builddir}/buildtools/install/common/logrotate/product-common "%{buildroot}%{_sysconfdir}/logrotate.d/%{product}-common"
cp -rf %{_builddir}/buildtools/install/common/%{product}-ssl-setup "%{buildroot}%{_bindir}/%{product}-ssl-setup"
cp -rf %{_builddir}/buildtools/install/common/%{product}-configuration "%{buildroot}%{_bindir}/%{product}-configuration"
cp -rf %{_builddir}/buildtools/config/nginx/onlyoffice*.conf "%{buildroot}%{_sysconfdir}/openresty/conf.d/"
cp -rf %{_builddir}/buildtools/config/nginx/includes/onlyoffice*.conf "%{buildroot}%{_sysconfdir}/openresty/includes/"
cp -rf %{_builddir}/buildtools/config/* "%{buildroot}%{_sysconfdir}/onlyoffice/%{product}/"
