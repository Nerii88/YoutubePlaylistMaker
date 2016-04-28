using System;
using System.Collections.Generic;
using System.Web.Mvc;
using System.Web.Security;
using YoutubePlaylistMaker.Models;

namespace YoutubePlaylistMaker.Controllers
{
    public class UserController : Controller
    {
        private readonly DBHelper _dbHelper;
        public UserController()
        {
            _dbHelper = new DBHelper();
        }

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

        [HttpPost]
        public ActionResult RetrieveSavedPlaylists()
        {
            if (ModelState.IsValid && User.Identity.IsAuthenticated)
            {
                var playlists = _dbHelper.GetSavedPlaylists(User.Identity.Name);
                return Json(playlists);
            }
            return Json(false);
        }

        [HttpPost]
        public ActionResult SaveNewPlaylist(string name, List<string> songIDs)
        {
            if (ModelState.IsValid && User.Identity.IsAuthenticated)
            {
                var plID = _dbHelper.SaveNewPlaylist(name, songIDs);
                return Json(plID);
            }
            return Json(false);
        }

        [HttpPost]
        public ActionResult CreatePublicPlaylist(string name, List<string> songIDs)
        {
            if (ModelState.IsValid)
            {
                var playlistLink = _dbHelper.CreatePublicPlaylist(name, songIDs);
                return Json(playlistLink);
            }
            return Json(false);
        }

        [HttpPost]
        public ActionResult UpdatePlaylist(Guid guid, List<string> songIDs)
        {
            if (ModelState.IsValid && User.Identity.IsAuthenticated)
            {
                return Json(_dbHelper.UpdatePlaylist(guid, songIDs));
            }
            return Json(false);
        }

        public ActionResult GetPublicPlaylist(Guid publicPlaylistID)
        {
            if (ModelState.IsValid)
            {
                var playlist = _dbHelper.GetPublicPlaylist(publicPlaylistID);
                if(playlist != null)
                    return Json(playlist);
            }
            return Json(false);
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
