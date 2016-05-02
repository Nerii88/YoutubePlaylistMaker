using System.Collections.Generic;
using System.Web.Mvc;
using System.Web.Security;
using YoutubePlaylistMaker.Models;

namespace YoutubePlaylistMaker.Controllers
{
    public class UserController : Controller
    {
        private readonly IDBHelper _dbHelper;
        public UserController()
        {
            _dbHelper = new DBHelperLocal();
        }

        // GET: User
        public ActionResult LogIn()
        {
            return PartialView();
        }

        [HttpPost]
        public JsonResult LogIn(UserLoginModel user)
        {
            if (ModelState.IsValid && _dbHelper.IsValid(user.Email, user.Password))
            {
                string userName = _dbHelper.GetUserName(user.Email);
                FormsAuthentication.SetAuthCookie(user.Email + "|" + userName, true);

                return Json(userName);
            }

            return Json(false);
        }

        [HttpGet]
        public ActionResult Registration()
        {
            return PartialView();
        }

        [HttpPost]
        public ActionResult Registration(UserRegistrationModel user)
        {
            if (ModelState.IsValid)
            {
                return Json(_dbHelper.Registration(user));
            }
            return Json(false);
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
                var playlists = _dbHelper.GetSavedPlaylists(User.Identity.Name.Split('|')[0]);
                return Json(playlists);
            }
            return Json(false);
        }

        [HttpPost]
        public ActionResult SaveNewPlaylist(string name, List<string> songIDs)
        {
            if (ModelState.IsValid && User.Identity.IsAuthenticated)
            {
                var plID = _dbHelper.SaveNewPlaylist(User.Identity.Name.Split('|')[0], name, songIDs);
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
        public ActionResult UpdatePlaylist(string guid, List<string> songIDs)
        {
            if (ModelState.IsValid && User.Identity.IsAuthenticated)
            {
                return Json(_dbHelper.UpdatePlaylist(guid, songIDs));
            }
            return Json(false);
        }

        [HttpPost]
        public ActionResult GetPublicPlaylist(string publicPlaylistID)
        {
            if (ModelState.IsValid)
            {
                var playlist = _dbHelper.GetPublicPlaylist(publicPlaylistID);
                if (playlist != null)
                    return Json(playlist);
            }
            return Json(false);
        }

        [HttpPost]
        public ActionResult RenewPlaylistLastDateUsed(string playlistID)
        {
            if (ModelState.IsValid && User.Identity.IsAuthenticated)
            {
                _dbHelper.RenewPlaylistLastDateUsed(playlistID);
            }
            return Json(true);
        }
    }
}
