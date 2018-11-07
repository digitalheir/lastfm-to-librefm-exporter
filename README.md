# Export scrobbled tracks from Last.fm and import them to Libre.fm
https://digitalheir.github.io/lastfm-to-librefm-exporter/

A Last.fm exporter as a web app, requiring no installation. You can use this software to back up your history from to [Last.fm](https://www.last.fm).

This program is modeled loosely after the program _[lastscrape-gui](https://github.com/encukou/lastscrape-gui)_. The difference is that for _lastscrape-gui_ you have to install Python and the Qt framework, and you might not want to take this effort.

Precautions are roughly the same as described in [this reddit post](https://www.reddit.com/r/foobar2000/comments/3zaiy6/guide_to_librefm_scrobbling_lastfm_backup_to/) under the section "Backing up from last.fm to libre.fm":

> Before you proceed now, make sure that you have [disabled automatic scrobbling from libre.fm to last.fm](https://libre.fm/user-connections.php) (it's off by default). You don't want the tracks you scrobble from last.fm now to return and re-register in last.fm while importing them to libre.fm.

## Usage
1. Go to the [web page](https://digitalheir.github.io/lastfm-to-librefm-exporter/)
2. Fill in your details for Last.fm and Libre.fm. Press buttons for creating tokens and session keys where applicable.
3. Either sync your Last.fm "Recently listened" to Libre.fm, or export your scrobbled tracks to JSON. The web page should work straight-forwardly.
4. If you encounter any problems, [leave an issue](https://github.com/digitalheir/lastfm-to-librefm-exporter/issues/new).