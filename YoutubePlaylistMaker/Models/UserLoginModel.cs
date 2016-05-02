using System.ComponentModel.DataAnnotations;

namespace YoutubePlaylistMaker.Models
{
    public class UserLoginModel
    {
        [Required]
        [EmailAddress]
        [StringLength(150)]
        [Display(Name = "Email adress: ")]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [StringLength(20, MinimumLength = 6)]
        [Display(Name = "Password: ")]
        public string Password { get; set; }
    }
}
