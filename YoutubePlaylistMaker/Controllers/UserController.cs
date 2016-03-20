using System.Web.Mvc;
using System.Web.Security;
using YoutubePlaylistMaker.Models;

namespace YoutubePlaylistMaker.Controllers
{
    public class UserController : Controller
    {
        // GET: User
        public ActionResult LogIn()
        {
            return PartialView();
        }

        [HttpPost]
        public JsonResult LogIn(UserModel user)
        {
            if (ModelState.IsValid && IsValid(user.Email, user.Password))
            {
                FormsAuthentication.SetAuthCookie(user.Email, true);

                return Json(true);
            }

            return Json(false);
        }

        [HttpGet]
        public ActionResult Registration()
        {
            return PartialView();
        }

        [HttpPost]
        public ActionResult Registration(UserModel user)
        {
            //if (ModelState.IsValid)
            //{
            //    using (var db = new MyLoginDBEntities())
            //    {
            //        var crypto = new SimpleCrypto.PBKDF2();
            //        var encrpPass = crypto.Compute(user.Password);
            //        var sysUser = db.Users.Create();

            //        sysUser.Email = user.Email;
            //        sysUser.Password = encrpPass;
            //        sysUser.PasswordSalt = crypto.Salt;

            //        db.Users.Add(sysUser);
            //        db.SaveChanges();

            //        return RedirectToAction("Index", "Home");
            //    }
            //}

            return PartialView(user);
        }

        [HttpGet]
        public ActionResult Logout()
        {
            FormsAuthentication.SignOut();
            return RedirectToAction("Index", "Home");
        }

        private bool IsValid(string email, string password)
        {
            //var crypto = new SimpleCrypto.PBKDF2();
            //bool isValid = false;

            //using (var db = new MyLoginDBEntities())
            //{
            //    var user = db.Users.FirstOrDefault(u => u.Email == email);

            //    if (user != null)
            //    {
            //        if (user.Password == crypto.Compute(password, user.PasswordSalt))
            //        {
            //            isValid = true;
            //        }
            //    }
            //}

            //return isValid;
            return true;
        }
    }
}
