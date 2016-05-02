using System.ComponentModel.DataAnnotations;

namespace YoutubePlaylistMaker.Models
{
    public class UserRegistrationModel
    {
        [Required]
        [StringLength(50)]
        [Display(Name = "User Name: ")]
        public string UserName { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(150)]
        [Display(Name = "Email adress: ")]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 6)]
        [Display(Name = "Password: ")]
        public string Password { get; set; }
    }
}
