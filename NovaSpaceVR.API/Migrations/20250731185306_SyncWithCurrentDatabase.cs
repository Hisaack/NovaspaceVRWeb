using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NovaSpaceVR.API.Migrations
{
    /// <inheritdoc />
    public partial class SyncWithCurrentDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "YoutubeUrl",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "YoutubeUrl",
                table: "CourseModules");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "YoutubeUrl",
                table: "Courses",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YoutubeUrl",
                table: "CourseModules",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
