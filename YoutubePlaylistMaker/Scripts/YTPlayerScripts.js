var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        width: '100%',
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
};

var playingFromPlaylist = false;

//Event fired when play state is changed
//Plays next song if current song was played from playlist
function onPlayerStateChange(event) {
    if (playingFromPlaylist) {
        if (event.data == YT.PlayerState.ENDED) {
            changeIconToPlay();
            if ($("#btn_playlist_repeatOne").hasClass('active')) {
                repeatSong();
            } else {
                playNextSong();
            }
        } else if (event.data == YT.PlayerState.PAUSED) {
            changeIconToPlay();
        } else if (event.data == YT.PlayerState.PLAYING) {
            changeIconToPause();
        }
    }
};

function repeatSong() {
    player.playVideo();
};

//Checks if repeat all or shuffle buttons are pressed
//and plays next song in the playlist accordingly
function playNextSong() {
    if (playingFromPlaylist && playlistElements.length > 0) {
        if ($("#btn_playlist_shuffle").hasClass('active')) {
            var i = (Math.floor(Math.random() * playlistElements.length) + 1) - 1;
            while (i == currentPlayingIndex) {
                i = (Math.floor(Math.random() * playlistElements.length) + 1) - 1;
            }
            playFromPlaylist(i);
        } else {
            if (currentPlayingIndex + 1 == playlistElements.length) {
                if ($("#btn_playlist_repeatAll").hasClass('active')) {
                    playFromPlaylist(0);
                }
            } else {
                playFromPlaylist(currentPlayingIndex + 1);
            }
        }
    }
};

//Checks if repeat all or shuffle buttons are pressed
//and plays previous song in the playlist accordingly
function playPreviousSong() {
    if (playingFromPlaylist && playlistElements.length > 0) {
        if ($("#btn_playlist_shuffle").hasClass('active')) {
            var i = (Math.floor(Math.random() * playlistElements.length) + 1) - 1;
            while (i == currentPlayingIndex) {
                i = (Math.floor(Math.random() * playlistElements.length) + 1) - 1;
            }
            playFromPlaylist(i);
        } else {
            if (currentPlayingIndex - 1 < 0) {
                if ($("#btn_playlist_repeatAll").hasClass('active')) {
                    playFromPlaylist(playlistElements.length-1);
                }
            } else {
                playFromPlaylist(currentPlayingIndex - 1);
            }
        }
    }
};

function pauseOrPlay() {
    if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
};

function changeIconToPause() {
    $("#pausePlaySpan").removeClass();
    $("#pausePlaySpan").addClass("glyphicon");
    $("#pausePlaySpan").addClass("glyphicon-pause");
};

function changeIconToPlay() {
    $("#pausePlaySpan").removeClass();
    $("#pausePlaySpan").addClass("glyphicon");
    $("#pausePlaySpan").addClass("glyphicon-play");
};

//Loads a Youtube video by a Youtube Video ID
//Sets player quality to 720 for higher standard quality
function playSongByYTID(ytID) {
    player.loadVideoById(ytID);
    player.setPlaybackQuality('hd720');
};

var playlistElements = [];
var currentPlayingIndex = -1;

//Populates the visible playlist on the site all from scratch by iterating playlistElements
function populatePlaylist() {
    var playlistDiv = $("#playlist");
    var newHtml = "";

    for (var index = 1; index <= playlistElements.length; index++) {
        var i = index - 1;
        var imgSrc = playlistElements[i].imgLink;
        var videoName = playlistElements[i].name;
        var orderNumber = "<div class='playlistVideoOrderNumber'><h6 class='playlistVideoOrderNumberH6'>" + index + "</h6></div>";
        var image = "<div class='playlistVideoImage'><img src='" + imgSrc + "' class='img-rounded' width='73' height='41'></div>";
        var name = "<div class='playlistVideoName'><h6 class='playlistVideoNameH6'>" + videoName + "</h6></div>";
        var clickableDiv = "<div onclick='playFromPlaylist(" + i + ")' class='playlistVideoClickLink'>" + orderNumber + image + name + "</div>";
        var removeButton = "<div class='leftFloater'><button onclick='removeFromPlaylist(" + i + ")' type='button' class='btn-link' data-toggle='tooltip' data-placement='top' title='Remove from playlist'>x</button></div>";
        var allInOne = "<div id='playlistVideo_" + i + "' class='playlistVideoContainer'>" + clickableDiv + removeButton + "</div>";
        newHtml = newHtml + allInOne;
    };

    playlistDiv.html(newHtml);

    if (playingFromPlaylist && currentPlayingIndex > -1) {
        highlightPlaylistVideo(currentPlayingIndex);
    }
};

//Removes an item from the playlist list and reloads the visible playlist on the site
//Called by a button click on right side of playlist
//Re populates playlist to fix numbering
function removeFromPlaylist(index) {
    if (index == currentPlayingIndex)
        currentPlayingIndex = -1;
    playlistElements.splice(index, 1);
    populatePlaylist();
};

//Loads and plays a video
//Adds/removes highlightning from divs to show currently played item
function playFromPlaylist(index) {
    playingFromPlaylist = true;
    if (currentPlayingIndex > -1) unhighlightPlaylistVideo(currentPlayingIndex);
    highlightPlaylistVideo(index);

    playSongByYTID(playlistElements[index].ytID);
    addTitleDateAndDescription(playlistElements[index].name, playlistElements[index].publishedAt, playlistElements[index].description);
    currentPlayingIndex = index;
};

function highlightPlaylistVideo(index) {
    $("#playlistVideo_" + index).addClass("highlightPlaylistVideo");
};

function unhighlightPlaylistVideo(index) {
    $("#playlistVideo_" + index).removeClass("highlightPlaylistVideo");
};

//Shows video info next to player
function addTitleDateAndDescription(title, date, desc) {
    var nameConainer = $("#videoNameContainer");
    var descContainer = $("#videoDescContainer");

    var titleBuilder = "<h4>" + title + "</h4>";
    var descBuilder = "<p><b>Published on: " + date.substr(0, 10) + "</b></p>" + "\n\n<p>" + desc + "</p>";

    nameConainer.html(titleBuilder);
    descContainer.html(descBuilder);
};

var UrlStart1 = "https://www.youtube.com/watch?v=";
var UrlStart2 = "https://youtu.be/";
var UrlStart3 = "https://www.youtube.com/embed/";

//Extracts the Youtube Video ID part of a valid youtube link
//Above strings are valid starts to a Youtube video link
function extractID(url) {
    var id = url;

    if (url.indexOf(UrlStart1) > -1) {
        id = url.replace(UrlStart1, "");
    }
    else if (url.indexOf(UrlStart2) > -1) {
        id = url.replace(UrlStart2, "");
    }
    else if (url.indexOf(UrlStart3) > -1) {
        id = url.replace(UrlStart3, "");
    } else {
        alert('Not a valid youtube link.');
        return "";
    }

    if (id.indexOf('&') > -1) {
        var i = id.indexOf('&');
        id = id.substring(0, i);
    }
    if (id.indexOf('?') > -1) {
        var j = id.indexOf('?');
        id = id.substring(0, j);
    }
    if (id.indexOf('#') > -1) {
        var k = id.indexOf('#');
        id = id.substring(0, k);
    }
    return id;
};

function addToPlaylistFromLinkInput() {
    var inputLink = $("#ytLink").val();
    var ytID = extractID(inputLink);
    if (ytID == "") return;

    getYTVideoInfoByYTID(ytID);
};

//Fetches Youtube video data from given Youtube Video ID
//If successful adds it to the playlist and reloads visible playlist on the site
function getYTVideoInfoByYTID(ytID) {
    $.getJSON("https://www.googleapis.com/youtube/v3/videos", {
        key: "AIzaSyCn4nYVKMaboYuhKnpykR5ivgT6loRzqxY",
        part: "snippet, contentDetails",
        id: ytID
    },
    function (data) {
        if (data.items.length == 0) {
            alert("Video not found");
            return "";
        }

        var title = removeQuotations(strip(data.items[0].snippet.title));
        var imgurl = data.items[0].snippet.thumbnails.medium.url;
        var desc = nl2br(data.items[0].snippet.description, true);
        var publishedAt = data.items[0].snippet.publishedAt;

        playlistElements.push({ imgLink: imgurl, name: title, ytID: ytID, description: desc, publishedAt: publishedAt });
        populatePlaylist();
        $("#ytLink").val("");
        return "";
    }).fail(function (jqXHR, textStatus, errorThrown) {
        alert(jqXHR.responseText || errorThrown);
    });
};

function strip(html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

function removeQuotations(text) {
    return text.replace(/['"]+/g, '');
};

//New line to break line hack for description formatting
function nl2br(str, is_xhtml) {
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};

//Check for "enter" key press in ytLink input field
function inputLinkFieldOnKeyPressEvent(e) {
    if (e.keyCode === 13) {
        addToPlaylistFromLinkInput();
    }
};

function customPlaylistInitialBuild() {
    getYTVideoInfoByYTID("-mumVUh5cXw");
    getYTVideoInfoByYTID("FL87JdFph-Y");
    getYTVideoInfoByYTID("arc-FTNW-xI");
    getYTVideoInfoByYTID("rswfNv6OfA8");
    getYTVideoInfoByYTID("ClM5UqKQvEk");
    getYTVideoInfoByYTID("GfTBEZP09D8");
    getYTVideoInfoByYTID("nNLTBKEPsiU");
    getYTVideoInfoByYTID("cr_Te6FDddg");
    getYTVideoInfoByYTID("iXlR7zRYPTw");
    getYTVideoInfoByYTID("sB0Am0v2pRo");
};
