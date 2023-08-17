// <auto-generated />
using System;
using ASC.MessagingSystem.EF.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace ASC.Migrations.MySql.SaaS.Migrations.Messages
{
    [DbContext(typeof(MessagesContext))]
    [Migration("20230816180501_MessagesContext_Upgrade1")]
    partial class MessagesContextUpgrade1
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("ASC.Core.Common.EF.Model.DbTenant", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("id");

                    b.Property<string>("Alias")
                        .IsRequired()
                        .HasColumnType("varchar(100)")
                        .HasColumnName("alias")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<bool>("Calls")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint(1)")
                        .HasColumnName("calls")
                        .HasDefaultValueSql("'1'");

                    b.Property<DateTime>("CreationDateTime")
                        .HasColumnType("datetime")
                        .HasColumnName("creationdatetime");

                    b.Property<int>("Industry")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("industry")
                        .HasDefaultValueSql("'0'");

                    b.Property<string>("Language")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasColumnType("char(10)")
                        .HasColumnName("language")
                        .HasDefaultValueSql("'en-US'")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<DateTime>("LastModified")
                        .HasColumnType("timestamp")
                        .HasColumnName("last_modified");

                    b.Property<string>("MappedDomain")
                        .HasColumnType("varchar(100)")
                        .HasColumnName("mappeddomain")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnType("varchar(255)")
                        .HasColumnName("name")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("OwnerId")
                        .HasColumnType("varchar(38)")
                        .HasColumnName("owner_id")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("PaymentId")
                        .HasColumnType("varchar(38)")
                        .HasColumnName("payment_id")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<bool>("Spam")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint(1)")
                        .HasColumnName("spam")
                        .HasDefaultValueSql("'1'");

                    b.Property<int>("Status")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("status")
                        .HasDefaultValueSql("'0'");

                    b.Property<DateTime?>("StatusChanged")
                        .HasColumnType("datetime")
                        .HasColumnName("statuschanged");

                    b.Property<string>("TimeZone")
                        .HasColumnType("varchar(50)")
                        .HasColumnName("timezone")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<int>("TrustedDomainsEnabled")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("trusteddomainsenabled")
                        .HasDefaultValueSql("'1'");

                    b.Property<string>("TrustedDomainsRaw")
                        .HasColumnType("varchar(1024)")
                        .HasColumnName("trusteddomains")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<int>("Version")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("version")
                        .HasDefaultValueSql("'2'");

                    b.Property<DateTime?>("Version_Changed")
                        .HasColumnType("datetime")
                        .HasColumnName("version_changed");

                    b.HasKey("Id");

                    b.HasIndex("Alias")
                        .IsUnique()
                        .HasDatabaseName("alias");

                    b.HasIndex("LastModified")
                        .HasDatabaseName("last_modified");

                    b.HasIndex("MappedDomain")
                        .HasDatabaseName("mappeddomain");

                    b.HasIndex("Version")
                        .HasDatabaseName("version");

                    b.ToTable("tenants_tenants", (string)null);

                    b.HasAnnotation("MySql:CharSet", "utf8");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Alias = "localhost",
                            Calls = false,
                            CreationDateTime = new DateTime(2021, 3, 9, 17, 46, 59, 97, DateTimeKind.Utc).AddTicks(4317),
                            Industry = 0,
                            LastModified = new DateTime(2022, 7, 8, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "Web Office",
                            OwnerId = "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
                            Spam = false,
                            Status = 0,
                            TrustedDomainsEnabled = 0,
                            Version = 0
                        });
                });

            modelBuilder.Entity("ASC.Core.Common.EF.Model.DbTenantPartner", b =>
                {
                    b.Property<int>("TenantId")
                        .HasColumnType("int")
                        .HasColumnName("tenant_id");

                    b.Property<string>("AffiliateId")
                        .HasColumnType("varchar(50)")
                        .HasColumnName("affiliate_id")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Campaign")
                        .HasColumnType("varchar(50)")
                        .HasColumnName("campaign")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("PartnerId")
                        .HasColumnType("varchar(36)")
                        .HasColumnName("partner_id")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.HasKey("TenantId")
                        .HasName("PRIMARY");

                    b.ToTable("tenants_partners", (string)null);

                    b.HasAnnotation("MySql:CharSet", "utf8");
                });

            modelBuilder.Entity("ASC.Core.Common.EF.Model.DbWebstudioSettings", b =>
                {
                    b.Property<int>("TenantId")
                        .HasColumnType("int")
                        .HasColumnName("TenantID");

                    b.Property<string>("Id")
                        .HasColumnType("varchar(64)")
                        .HasColumnName("ID")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("UserId")
                        .HasColumnType("varchar(64)")
                        .HasColumnName("UserID")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Data")
                        .IsRequired()
                        .HasColumnType("mediumtext")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.HasKey("TenantId", "Id", "UserId")
                        .HasName("PRIMARY");

                    b.HasIndex("Id")
                        .HasDatabaseName("ID");

                    b.ToTable("webstudio_settings", (string)null);

                    b.HasAnnotation("MySql:CharSet", "utf8");

                    b.HasData(
                        new
                        {
                            TenantId = 1,
                            Id = "9a925891-1f92-4ed7-b277-d6f649739f06",
                            UserId = "00000000-0000-0000-0000-000000000000",
                            Data = "{\"Completed\":false}"
                        });
                });

            modelBuilder.Entity("ASC.Core.Common.EF.User", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("varchar(38)")
                        .HasColumnName("id")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<int>("ActivationStatus")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("activation_status")
                        .HasDefaultValueSql("'0'");

                    b.Property<DateTime?>("BirthDate")
                        .HasColumnType("datetime")
                        .HasColumnName("bithdate");

                    b.Property<string>("Contacts")
                        .HasColumnType("varchar(1024)")
                        .HasColumnName("contacts")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<DateTime>("CreateDate")
                        .HasColumnType("timestamp")
                        .HasColumnName("create_on");

                    b.Property<string>("CultureName")
                        .HasColumnType("varchar(20)")
                        .HasColumnName("culture")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Email")
                        .HasColumnType("varchar(255)")
                        .HasColumnName("email")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("FirstName")
                        .IsRequired()
                        .HasColumnType("varchar(64)")
                        .HasColumnName("firstname")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<DateTime>("LastModified")
                        .HasColumnType("datetime")
                        .HasColumnName("last_modified");

                    b.Property<string>("LastName")
                        .IsRequired()
                        .HasColumnType("varchar(64)")
                        .HasColumnName("lastname")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Location")
                        .HasColumnType("varchar(255)")
                        .HasColumnName("location")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("MobilePhone")
                        .HasColumnType("varchar(255)")
                        .HasColumnName("phone")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<int>("MobilePhoneActivation")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("phone_activation")
                        .HasDefaultValueSql("'0'");

                    b.Property<string>("Notes")
                        .HasColumnType("varchar(512)")
                        .HasColumnName("notes")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<bool>("Removed")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("tinyint(1)")
                        .HasColumnName("removed")
                        .HasDefaultValueSql("'0'");

                    b.Property<bool?>("Sex")
                        .HasColumnType("tinyint(1)")
                        .HasColumnName("sex");

                    b.Property<string>("Sid")
                        .HasColumnType("varchar(512)")
                        .HasColumnName("sid")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("SsoNameId")
                        .HasColumnType("varchar(512)")
                        .HasColumnName("sso_name_id")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("SsoSessionId")
                        .HasColumnType("varchar(512)")
                        .HasColumnName("sso_session_id")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<int>("Status")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("status")
                        .HasDefaultValueSql("'1'");

                    b.Property<int>("Tenant")
                        .HasColumnType("int")
                        .HasColumnName("tenant");

                    b.Property<DateTime?>("TerminatedDate")
                        .HasColumnType("datetime")
                        .HasColumnName("terminateddate");

                    b.Property<string>("Title")
                        .HasColumnType("varchar(64)")
                        .HasColumnName("title")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("UserName")
                        .IsRequired()
                        .HasColumnType("varchar(255)")
                        .HasColumnName("username")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<DateTime?>("WorkFromDate")
                        .HasColumnType("datetime")
                        .HasColumnName("workfromdate");

                    b.HasKey("Id")
                        .HasName("PRIMARY");

                    b.HasIndex("Email")
                        .HasDatabaseName("email");

                    b.HasIndex("LastModified")
                        .HasDatabaseName("last_modified");

                    b.HasIndex("Tenant", "UserName")
                        .HasDatabaseName("username");

                    b.ToTable("core_user", (string)null);

                    b.HasAnnotation("MySql:CharSet", "utf8");

                    b.HasData(
                        new
                        {
                            Id = "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
                            ActivationStatus = 0,
                            CreateDate = new DateTime(2022, 7, 8, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Email = "",
                            FirstName = "Administrator",
                            LastModified = new DateTime(2021, 3, 9, 9, 52, 55, 765, DateTimeKind.Utc).AddTicks(1420),
                            LastName = "",
                            MobilePhoneActivation = 0,
                            Removed = false,
                            Status = 1,
                            Tenant = 1,
                            UserName = "administrator",
                            WorkFromDate = new DateTime(2021, 3, 9, 9, 52, 55, 764, DateTimeKind.Utc).AddTicks(9157)
                        });
                });

            modelBuilder.Entity("ASC.MessagingSystem.EF.Model.AuditEvent", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("id");

                    b.Property<int?>("Action")
                        .HasColumnType("int")
                        .HasColumnName("action");

                    b.Property<string>("Browser")
                        .HasColumnType("varchar(200)")
                        .HasColumnName("browser")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<DateTime>("Date")
                        .HasColumnType("datetime")
                        .HasColumnName("date");

                    b.Property<string>("DescriptionRaw")
                        .HasColumnType("varchar(20000)")
                        .HasColumnName("description")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Initiator")
                        .HasColumnType("varchar(200)")
                        .HasColumnName("initiator")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Ip")
                        .HasColumnType("varchar(50)")
                        .HasColumnName("ip")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Page")
                        .HasColumnType("varchar(300)")
                        .HasColumnName("page")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Platform")
                        .HasColumnType("varchar(200)")
                        .HasColumnName("platform")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Target")
                        .HasColumnType("text")
                        .HasColumnName("target")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<int>("TenantId")
                        .HasColumnType("int")
                        .HasColumnName("tenant_id");

                    b.Property<string>("UserId")
                        .HasColumnType("char(38)")
                        .HasColumnName("user_id")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.HasKey("Id");

                    b.HasIndex("TenantId", "Date")
                        .HasDatabaseName("date");

                    b.ToTable("audit_events", (string)null);

                    b.HasAnnotation("MySql:CharSet", "utf8");
                });

            modelBuilder.Entity("ASC.MessagingSystem.EF.Model.LoginEvent", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("id");

                    b.Property<int?>("Action")
                        .HasColumnType("int")
                        .HasColumnName("action");

                    b.Property<bool>("Active")
                        .HasColumnType("tinyint(1)")
                        .HasColumnName("active");

                    b.Property<string>("Browser")
                        .HasColumnType("varchar(200)")
                        .HasColumnName("browser")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<DateTime>("Date")
                        .HasColumnType("datetime")
                        .HasColumnName("date");

                    b.Property<string>("DescriptionRaw")
                        .HasColumnType("varchar(500)")
                        .HasColumnName("description")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Ip")
                        .HasColumnType("varchar(50)")
                        .HasColumnName("ip")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Login")
                        .HasColumnType("varchar(200)")
                        .HasColumnName("login")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Page")
                        .HasColumnType("varchar(300)")
                        .HasColumnName("page")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<string>("Platform")
                        .HasColumnType("varchar(200)")
                        .HasColumnName("platform")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.Property<int>("TenantId")
                        .HasColumnType("int")
                        .HasColumnName("tenant_id");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("char(38)")
                        .HasColumnName("user_id")
                        .UseCollation("utf8_general_ci")
                        .HasAnnotation("MySql:CharSet", "utf8");

                    b.HasKey("Id");

                    b.HasIndex("Date")
                        .HasDatabaseName("date");

                    b.HasIndex("TenantId", "UserId")
                        .HasDatabaseName("tenant_id");

                    b.ToTable("login_events", (string)null);

                    b.HasAnnotation("MySql:CharSet", "utf8");
                });

            modelBuilder.Entity("ASC.Core.Common.EF.Model.DbTenantPartner", b =>
                {
                    b.HasOne("ASC.Core.Common.EF.Model.DbTenant", "Tenant")
                        .WithOne("Partner")
                        .HasForeignKey("ASC.Core.Common.EF.Model.DbTenantPartner", "TenantId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Tenant");
                });

            modelBuilder.Entity("ASC.Core.Common.EF.Model.DbTenant", b =>
                {
                    b.Navigation("Partner");
                });
#pragma warning restore 612, 618
        }
    }
}
