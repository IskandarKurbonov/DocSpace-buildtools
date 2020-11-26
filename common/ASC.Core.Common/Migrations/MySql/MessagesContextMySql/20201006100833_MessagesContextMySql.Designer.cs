﻿// <auto-generated />
using System;
using ASC.Core.Common.EF.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace ASC.Core.Common.Migrations.MySql.MessagesContextMySql
{
    [DbContext(typeof(MySqlMessagesContext))]
    [Migration("20201006100833_MessagesContextMySql")]
    partial class MessagesContextMySql
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "3.1.8")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("ASC.Core.Common.EF.Model.AuditEvent", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnName("id")
                        .HasColumnType("int");

                    b.Property<int>("Action")
                        .HasColumnName("action")
                        .HasColumnType("int");

                    b.Property<string>("Browser")
                        .HasColumnName("browser")
                        .HasColumnType("varchar(200)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<DateTime>("Date")
                        .HasColumnName("date")
                        .HasColumnType("datetime");

                    b.Property<string>("Description")
                        .HasColumnName("description")
                        .HasColumnType("varchar(20000)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Initiator")
                        .HasColumnName("initiator")
                        .HasColumnType("varchar(200)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Ip")
                        .HasColumnName("ip")
                        .HasColumnType("varchar(50)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Page")
                        .HasColumnName("page")
                        .HasColumnType("varchar(300)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Platform")
                        .HasColumnName("platform")
                        .HasColumnType("varchar(200)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Target")
                        .HasColumnName("target")
                        .HasColumnType("text")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<int>("TenantId")
                        .HasColumnName("tenant_id")
                        .HasColumnType("int");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnName("user_id")
                        .HasColumnType("char(38)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.HasKey("Id");

                    b.HasIndex("TenantId", "Date")
                        .HasName("date");

                    b.ToTable("audit_events");
                });

            modelBuilder.Entity("ASC.Core.Common.EF.Model.DbTenant", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnName("id")
                        .HasColumnType("int");

                    b.Property<string>("Alias")
                        .IsRequired()
                        .HasColumnName("alias")
                        .HasColumnType("varchar(100)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<bool>("Calls")
                        .ValueGeneratedOnAdd()
                        .HasColumnName("calls")
                        .HasColumnType("tinyint(1)")
                        .HasDefaultValueSql("true");

                    b.Property<DateTime>("CreationDateTime")
                        .HasColumnName("creationdatetime")
                        .HasColumnType("datetime");

                    b.Property<int?>("Industry")
                        .HasColumnName("industry")
                        .HasColumnType("int");

                    b.Property<string>("Language")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasColumnName("language")
                        .HasColumnType("char(10)")
                        .HasDefaultValueSql("'en-US'")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<DateTime>("LastModified")
                        .ValueGeneratedOnAdd()
                        .HasColumnName("last_modified")
                        .HasColumnType("timestamp")
                        .HasDefaultValueSql("CURRENT_TIMESTAMP");

                    b.Property<string>("MappedDomain")
                        .HasColumnName("mappeddomain")
                        .HasColumnType("varchar(100)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasColumnName("name")
                        .HasColumnType("varchar(255)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("OwnerId")
                        .IsRequired()
                        .HasColumnName("owner_id")
                        .HasColumnType("varchar(38)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("PaymentId")
                        .HasColumnName("payment_id")
                        .HasColumnType("varchar(38)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<bool>("Public")
                        .HasColumnName("public")
                        .HasColumnType("tinyint(1)");

                    b.Property<string>("PublicVisibleProducts")
                        .HasColumnName("publicvisibleproducts")
                        .HasColumnType("varchar(1024)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<bool>("Spam")
                        .ValueGeneratedOnAdd()
                        .HasColumnName("spam")
                        .HasColumnType("tinyint(1)")
                        .HasDefaultValueSql("true");

                    b.Property<int>("Status")
                        .HasColumnName("status")
                        .HasColumnType("int");

                    b.Property<DateTime?>("StatusChanged")
                        .HasColumnName("statuschanged")
                        .HasColumnType("datetime");

                    b.Property<string>("TimeZone")
                        .HasColumnName("timezone")
                        .HasColumnType("varchar(50)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("TrustedDomains")
                        .HasColumnName("trusteddomains")
                        .HasColumnType("varchar(1024)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<int>("TrustedDomainsEnabled")
                        .ValueGeneratedOnAdd()
                        .HasColumnName("trusteddomainsenabled")
                        .HasColumnType("int")
                        .HasDefaultValueSql("'1'");

                    b.Property<int>("Version")
                        .ValueGeneratedOnAdd()
                        .HasColumnName("version")
                        .HasColumnType("int")
                        .HasDefaultValueSql("'2'");

                    b.Property<DateTime>("VersionChanged")
                        .HasColumnName("version_changed")
                        .HasColumnType("datetime");

                    b.Property<DateTime?>("Version_Changed")
                        .HasColumnType("datetime(6)");

                    b.HasKey("Id");

                    b.HasIndex("LastModified")
                        .HasName("last_modified");

                    b.HasIndex("MappedDomain")
                        .HasName("mappeddomain");

                    b.HasIndex("Version")
                        .HasName("version");

                    b.ToTable("tenants_tenants","onlyoffice");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            Alias = "localhost",
                            Calls = false,
                            CreationDateTime = new DateTime(2020, 10, 6, 10, 8, 33, 104, DateTimeKind.Utc).AddTicks(3779),
                            LastModified = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                            Name = "Web Office",
                            OwnerId = "66faa6e4-f133-11ea-b126-00ffeec8b4ef",
                            Public = false,
                            Spam = false,
                            Status = 0,
                            TrustedDomainsEnabled = 0,
                            Version = 0,
                            VersionChanged = new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified)
                        });
                });

            modelBuilder.Entity("ASC.Core.Common.EF.Model.DbTenantPartner", b =>
                {
                    b.Property<int>("TenantId")
                        .HasColumnName("tenant_id")
                        .HasColumnType("int");

                    b.Property<string>("AffiliateId")
                        .HasColumnName("affiliate_id")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("Campaign")
                        .HasColumnName("campaign")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.Property<string>("PartnerId")
                        .HasColumnName("partner_id")
                        .HasColumnType("longtext CHARACTER SET utf8mb4");

                    b.HasKey("TenantId");

                    b.ToTable("tenants_partners");
                });

            modelBuilder.Entity("ASC.Core.Common.EF.Model.DbWebstudioSettings", b =>
                {
                    b.Property<int>("TenantId")
                        .HasColumnName("TenantID")
                        .HasColumnType("int");

                    b.Property<string>("Id")
                        .HasColumnName("ID")
                        .HasColumnType("varchar(64)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("UserId")
                        .HasColumnName("UserID")
                        .HasColumnType("varchar(64)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Data")
                        .IsRequired()
                        .HasColumnType("mediumtext")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.HasKey("TenantId", "Id", "UserId")
                        .HasName("PRIMARY");

                    b.HasIndex("Id")
                        .HasName("ID");

                    b.ToTable("webstudio_settings");

                    b.HasData(
                        new
                        {
                            TenantId = 1,
                            Id = "9a925891-1f92-4ed7-b277-d6f649739f06",
                            UserId = "00000000-0000-0000-0000-000000000000",
                            Data = "{\"Completed\":false}"
                        });
                });

            modelBuilder.Entity("ASC.Core.Common.EF.Model.LoginEvents", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnName("id")
                        .HasColumnType("int");

                    b.Property<int>("Action")
                        .HasColumnName("action")
                        .HasColumnType("int");

                    b.Property<string>("Browser")
                        .HasColumnName("browser")
                        .HasColumnType("varchar(200)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<DateTime>("Date")
                        .HasColumnName("date")
                        .HasColumnType("datetime");

                    b.Property<string>("Description")
                        .HasColumnName("description")
                        .HasColumnType("varchar(500)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Ip")
                        .HasColumnName("ip")
                        .HasColumnType("varchar(50)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Login")
                        .HasColumnName("login")
                        .HasColumnType("varchar(200)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Page")
                        .HasColumnName("page")
                        .HasColumnType("varchar(300)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<string>("Platform")
                        .HasColumnName("platform")
                        .HasColumnType("varchar(200)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.Property<int>("TenantId")
                        .HasColumnName("tenant_id")
                        .HasColumnType("int");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnName("user_id")
                        .HasColumnType("char(38)")
                        .HasAnnotation("MySql:CharSet", "utf8")
                        .HasAnnotation("MySql:Collation", "utf8_general_ci");

                    b.HasKey("Id");

                    b.HasIndex("Date")
                        .HasName("date");

                    b.HasIndex("TenantId", "UserId")
                        .HasName("tenant_id");

                    b.ToTable("login_events");
                });

            modelBuilder.Entity("ASC.Core.Common.EF.Model.DbTenantPartner", b =>
                {
                    b.HasOne("ASC.Core.Common.EF.Model.DbTenant", "Tenant")
                        .WithOne("Partner")
                        .HasForeignKey("ASC.Core.Common.EF.Model.DbTenantPartner", "TenantId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });
#pragma warning restore 612, 618
        }
    }
}
