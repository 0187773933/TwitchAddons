// ==UserScript==
// @name          Twitch Custom Sharable 20MAR2019
// @namespace     http://userstyles.org
// @description   My Sharable Twitch Addon for Friends
// @author        636597
// @include       *://*.twitch.tv/*
// @run-at        document-start
// @version       0.1
// ==/UserScript==


// Controls / Preferences
// ========================================
// ========================================
var ignoreEveryone = false; // but true
var enableTranslation = true;
var hideUsernames = true;
var enableBlacklist = true;
var blacklistMessagesToKnownToxicUsernames = false;
var blacklistAnywhereWords = true;
var blacklistExactWords = true;
var custom_sub_mode_channels = {
	"chessbrah" : 12 ,
	"avori": 6 ,
};
// Controls / Preferences
// ========================================
// ========================================


// Add CSS
// ===============================================================================
// ===============================================================================
function add_css() {
	if ( !!!window.document.styleSheets ) { console.log( "no stylesheets ???" ) };
	for ( var i = 0; i < window.document.styleSheets.length; ++i ) {
		try {
				var sheet = window.document.styleSheets[ i ];
				sheet.insertRule( "div.tw-z-default { display: none; !important }" , sheet.cssRules.length );
		}
		catch( e ) { console.log( e ); }

	}

}
// Add CSS
// ===============================================================================
// ===============================================================================

// Keep Track of User List
// ===============================================================================
// ===============================================================================
var LatestUserList = [];
function getLatestUserList() {
	console.log( "Updating Latest 'Chatters' List" );
	var xhr = new XMLHttpRequest();
	var username = window.location.href.split( "twitch.tv/" )[ 1 ];
	var url = "https://tmi.twitch.tv/group/user/" + username + "/chatters";
	var headers = {
		'authority': 'tmi.twitch.tv',
		'accept': 'application/json; charset=UTF-8',
		'client-id': 'kimne78kx3ncx6brgo4mv6wki5h1ko',
		'content-type': 'application/json; charset=UTF-8',
		'accept-language': 'en-US,en;q=0.9,es;q=0.8',
	};
	xhr.open( "GET" , url );
	for( var key in headers ) {
		xhr.setRequestHeader( key , headers[ key ] );
	}
	xhr.responseType = "json";
	xhr.onload = function( e ) {
		if ( this.status == 200 ) {
			var _latest_userlist = [];
			for( var type in this.response[ "chatters" ] ) {
				_latest_userlist.push.apply( _latest_userlist , this.response[ "chatters" ][ type ] );
			}
			LatestUserList = _latest_userlist;
			LatestUserList.sort();
			console.log( LatestUserList );
		}
	};
	xhr.send();
}
setInterval( getLatestUserList , 30000 );
getLatestUserList();
// ===============================================================================
// ===============================================================================


// Translation Stuff
// ===============================================================================
// ===============================================================================
var destinationLanguage = "en";
var gapi_key = atob( "NyEqS0UuRmFZNmpKITVPNFFSKmRIOSwySw==" );
var GoogleTranslateBase = atob( "aHR0cHM6Ly9jZWJlcm91cy5vcmcvdHJhbnMvdGV4dA==" );

function fixedEncodeURIComponent(str){
	return encodeURIComponent(str).replace(/[!'()]/g, escape).replace(/\*/g, "%2A");
}

var TranslationActive = false;
var GoogleTranslateEnd = "&key=" + gapi_key;
var TranB1 = "q=";
var TranB2 = "&target=" + destinationLanguage;
function translateText( text , dom_elem ) {
	if ( !text ) { return; }
	if ( !dom_elem ) { return; }
	text = text.trim();
	var query_string = TranB1 + fixedEncodeURIComponent( text ) + TranB2 + GoogleTranslateEnd;
	var anHttpRequest = new XMLHttpRequest();
	anHttpRequest.onreadystatechange = function() {
		if ( anHttpRequest.readyState == 4 && anHttpRequest.status == 200 ) {
			var response = anHttpRequest.responseText;
			console.log( response );
			var translation = JSON.parse( response );
			translation = translation[ "data" ][ "translations" ][ 0 ][ "translatedText" ];
			translation = translation.trim();
			var has_mention_fragment = false;
			var mention_frag_node = null;
			for ( var i = 0; i < dom_elem.childNodes.length; ++i ) {
				if ( dom_elem.childNodes[ i ].className === "mention-fragment" ) { has_mention_fragment = true; mention_frag_node = dom_elem.childNodes[ i ]; }
				var attr = dom_elem.childNodes[ i ].getAttribute( "data-a-target" );
				if ( attr === "chat-message-text" ) {
					dom_elem.childNodes[ i ].innerHTML = translation;
					dom_elem.setAttribute( "data-showTranslation" ,  "true" );
					dom_elem.setAttribute( "data-translatedText" , translation );
					dom_elem.setAttribute( "data-originalText" ,  text );
				}
			}
			if ( has_mention_fragment ) { dom_elem.removeChild( mention_frag_node ); }
		}
	};
	anHttpRequest.open( "POST", GoogleTranslateBase , true );
	anHttpRequest.setRequestHeader( "Content-Type" , "application/x-www-form-urlencoded; charset=UTF-8" );
	anHttpRequest.send( query_string );
}

function attach_translation_support_to_node( addedNode ) {
	addedNode.addEventListener( "dblclick" , function() {
		var that = this;

		var show_translation = addedNode.getAttribute( "data-showTranslation" );
		console.log( show_translation );
		if ( show_translation ) {
			if ( show_translation === "true" ) {
				//that.style.background = "red";
				console.log( "reverting" );
				console.log( "old text === " );
				var original_text = addedNode.getAttribute( "data-originalText" );
				console.log( original_text );
				for ( var i = 0; i < addedNode.childNodes.length; ++i ) {
					if ( !addedNode.childNodes[ i ] ) { continue; }
					var attr = addedNode.childNodes[ i ].getAttribute( "data-a-target" );
					if ( attr === "chat-message-text" ) {
						addedNode.childNodes[ i ].innerText = original_text;
						break;
					}
				}
				addedNode.setAttribute( "data-showTranslation" , "false" );
			}
			else {
				//that.style.background = "green";
				addedNode.setAttribute( "data-showTranslation" ,  "true" );
				var already_translated = addedNode.getAttribute( "data-translatedText" );
				console.log( "already_translated text === " );
				console.log( already_translated );
				// already_translated = already_translated.replace( /([A-Za-z\u00C0-\u1FFF\u2800-\uFFFD]+)\s+\1(?:\s|$)/gi , function ( str , match ) {
				//     return match[ 0 ];
				// });
				for ( var i = 0; i < addedNode.childNodes.length; ++i ) {
					if ( !addedNode.childNodes[ i ] ) { continue; }
					var attr = addedNode.childNodes[ i ].getAttribute( "data-a-target" );
					if ( attr === "chat-message-text" ) {
						addedNode.childNodes[ i ].innerHTML = already_translated;
						break;
					}
				}
			}
		}
		else {
			//that.style.background = "green";
			var start = addedNode.innerText.indexOf( ":" );
			var z1 = addedNode.innerText.substring( ( start + 1 ) );
			translateText( z1 , addedNode );
		}
	} , false );
}
// Translation Stuff
// ===============================================================================
// ===============================================================================


// Blacklist BS
// ===============================================================================
// ===============================================================================
// Search for Occurrence *anywhere* in message
var blacklist_anywhere_words = [
	"https://chessbrah.ting.com/" ,
	"https://www.chessbrah.tv/hos" ,
	"https://www.chessbrah.tv/chess" ,
	"www.chessbrah.tv/chess",
	"https://discord.gg/chessbrah" ,
	"https://youtu.be/Vjr1Hs6iBrA" ,
	"twitter.com/chessbrahTV",
	"https://streamlabs.com/chessbrah",
	"http://chessbrahstore.com/",
	"https://instagram.com/eric.hansen/",
	"bae",
	"ptsd",
];

// Search for these exact words
var blacklist_exact_words = [
	"BTTV!",
	"Prime" ,
	"Subscribe",
	"subscription",
	"lynxW",
	"lfs3" ,
	"lfs4" ,
	"lfsA" ,
	"lfsB" ,
	"lfsC" ,
	"lfsD" ,
	"lfsE" ,
	"lfsF" ,
	"lfsG" ,
	"lfsH" ,
	"lfsI" ,
	"lfsJ" ,
	"lfsK" ,
	"lfsl",
	"lfsL" ,
	"lfsM" ,
	"lfsN" ,
	"lfsO" ,
	"lfsP" ,
	"lfsQ" ,
	"lfsR" ,
	"lfsS" ,
	"lfsT" ,
	"lfsU" ,
	"lfsV" ,
	"lfsW" ,
	"lfsX" ,
	"lfsY" ,
	"lfsZ" ,
	"chessbrahTV",
	"Vjr1Hs6iBrA",
	"https://youtu.be/Vjr1Hs6iBrA",
	"kill myself",
	"suicide" ,
	"killmyself",
	"ptsd",
];

// Get 'Latest' Blocked User List
// 1.) Go Here: and login https://t.3v.fi/ignored/
// 2.) Enter DevTools 'Console' Window , and paste this code into the console
/*
var var_string = 'var blacklist_toxic_usernames = [ ';
var blocked = [];
$( "#i > tr" ).each( function() {
	var username = $( this ).children();
	username = $( username[ 1 ] ).text().trim();
	blocked.push( username );
});
blocked = blocked.sort();
for ( var i = 0; i < blocked.length; ++i ) {
	var_string = var_string + '"' + blocked[ i ] + '" , ';
}
var_string = var_string + '];';
console.log( var_string );
*/
// 3.) Copy Generated Variable String and Replace the One Belew with the 'latest'

// Block these "known" "toxic" Twitch Chess Users
var blacklist_toxic_usernames = [ "00bondmade" , "00hermit" , "065auqclporrdxfg" , "0blaoi" , "119mars" , "13monad3" , "1_football_basketball" , "1arman99123" , "1littlefox1" , "1pietor1" , "2005surya" , "2badman316" , "2bottles_whiskey" , "2dark_wolf2" , "2phsycho" , "2week2slo" , "2week2slow" , "420bongcloud" , "45trance" , "4flea" , "534n84" , "7oxx" , "7praokon" , "7ringsbyarianagrande" , "808rose" , "888speedyboarding" , "99_rng" , "a0sh" , "a_pair_of_rookies" , "aaitkens" , "aaron0007" , "aaronhibberd" , "aaronkay" , "aavoss" , "abcdgeometry" , "abcut99" , "abe_fr0man" , "abledenthusiast" , "aboubacarfilbert" , "about89goats" , "abscynthe" , "absd1" , "absorbingunderwear" , "abstractdungeon" , "acartii" , "acedespades" , "adam_jason_babcock" , "adavis19134" , "addwaah" , "adecentperson_" , "adi16011" , "adimare" , "admichla" , "admiralbumblebee" , "admiraleyebr0ws" , "adonissacsthequeen" , "aerphielzinho" , "aggressive_perfector" , "agumer12" , "agustinfield" , "ahimissedthat" , "ahmadlikeschess" , "ahmedhelal1994" , "aidenalphabet" , "air_falcon" , "airsons" , "aizengamingxd" , "ak_pop" , "akacuddlefish" , "aladin_is_real" , "alaoy" , "alborzmgm" , "alchemist888" , "ale0ftw" , "alectv" , "aleha95" , "aleksjac" , "alekz14" , "alexgabrielov" , "alexkerford" , "alexylamoureux" , "alexz323" , "alias_hairplug" , "allaby2" , "alliewww" , "allisonmariah" , "allsmilesallday" , "almightus" , "alphadog510" , "alqaeda0470" , "alsrl9031" , "altruisticraven" , "alvez_" , "amans_bum" , "aminefelah" , "aminorph" , "amirrimidaiw" , "ammarhatem2000" , "ammeeba" , "amusani007" , "amusedbystander" , "anaphaze" , "anatolyakarpov" , "anchorless" , "andmunko" , "andrew_chess" , "andrewa" , "andrewpkuhn" , "andromeda3" , "andyisyoda" , "anentiresleeve" , "angelina2079" , "angelxx1234" , "angrypawngrabber" , "aniketm117" , "anon012" , "anotherswedishplayer" , "ansgarbaldurson" , "ant314159265" , "ao1sauce" , "apetkov" , "aphrow" , "apographon" , "apolchess" , "appleavocado" , "applejuicelikeskc" , "applemangobanana" , "applepie123123" , "apsyrtos" , "aquilaungula" , "arakarigm" , "arashfromiran" , "archangel_1980" , "aremvaleth" , "arizonateaa_" , "armatage_shanks" , "armchairexpert1123" , "armymedicrn" , "arnastu" , "arshiya132004" , "artaniusfm" , "arterapsy" , "artvandelay64" , "ascential138" , "asdfasdfasd32113" , "ashersc" , "ashi51" , "ashish_" , "ashkansboyfriend" , "askdaopaquestions" , "asturiasgijon95" , "atomic__player" , "atomicshoelace" , "atuartuaraq" , "audchav" , "austin1234516" , "ave1842" , "average1800player" , "avidspinballa" , "avinashsp93" , "awesome843" , "awkwardrecluse" , "awnik86" , "axelzucho" , "ayrton_t" , "ayudinn" , "ayyyayyyyron" , "azam397" , "azelf1" , "aznguy1020" , "azozsaad1995" , "azurajacobs" , "b0nob089" , "b2muchtime" , "baakss" , "baballbooey" , "babytiger1" , "backz_here" , "badaxe99" , "badchev" , "badhabitmarco" , "badrobot86" , "bahamutdlj" , "bakimikic_" , "baladiamine34" , "balajid13" , "baldrmvp" , "ballcream5000" , "bama3737" , "bana57" , "baphangelus" , "baptou99" , "barelyotaku" , "basherpubg" , "basitsnake" , "battmeng" , "beatonyx" , "beatpoet67" , "beavis3682" , "beeblebr0x" , "beesod" , "belledesire" , "benbunny7" , "benceleszko03" , "bendovafridays" , "bendoverfinegold" , "benjaminbreeg" , "benyazino" , "berenzen_kt" , "berniebuckets" , "berniesandersdiaper" , "bhamdeezy" , "bhavajbsvkkbv" , "bigccz" , "bigchina_17" , "bigmike92ataoldotcom" , "bigsheepog" , "bigslap75" , "bigtimestalker" , "bilal_h23" , "bilborados" , "bill_kitches" , "bilodiego" , "bionicd0lph1n" , "biotelomeres" , "biped_snake" , "bisamrazz" , "biscuitfiend2592" , "bishop_takes" , "bismuth78" , "bitman777" , "bjh13" , "bkopnick" , "blackferne" , "blackpainted" , "blacktusk" , "blagadaru" , "blandified" , "blas_d_lezo" , "blazingthieff" , "blbchessmaster" , "blitzhammerlichess" , "blitzingbullet" , "blntaftrblnt" , "blobe75fm" , "blodslegge" , "bloodcanvas" , "blswagger07" , "bluebottlebop" , "blueechip" , "bluey3llowpower" , "blunder_mate" , "blunderyears" , "bluper1" , "bmoreherbie" , "bob10576" , "bobapoo32" , "bobbytareco" , "bobsenboii" , "boddah99933" , "bogbogad" , "boheme_and_chella" , "bomberstar" , "booobyfischer" , "booshu" , "boostinppl" , "boranibanjan" , "boratfkazakh" , "borispasskey" , "born2pizza1234" , "bornfilthydynasty" , "bottleandglass" , "bradcoulding" , "bradenlaughlin" , "bradpittfromfightclub" , "braydonplayz66" , "brazenhazel" , "brewmasta" , "brianmaisie" , "brickballerbrand" , "brijeash" , "brokntoiletseat" , "bronxdefense" , "broo_sh" , "broskapop" , "browntowneuw" , "brratman" , "bruce_louis" , "brucejenner8inches" , "brujaweb" , "brumfield85" , "brunopontes93" , "brutal_deluxe_" , "brutalisk102" , "bshara_harbi" , "bubblegutts1" , "bucypher" , "budtenderbill" , "buglifeee" , "bulkington" , "bunkshus" , "busynights" , "butipoopfromthere2" , "bydcollin" , "bydou" , "byfelipesb" , "bzdybowicz" , "bzonkhou" , "c4lvinkl3in" , "cacabutt3000" , "cai__" , "calculatedblunder" , "callmealin" , "callmemaybe2229" , "callpeta" , "calvin_eggs" , "cametostunt" , "camilopc1" , "cammaccam" , "camthemann" , "canalover420" , "cannonballler" , "cansvr" , "captain_harlock96" , "captain_toefungus" , "carebarethebear" , "carlaheredia" , "carnicero79" , "carrotsandpizza" , "caruana_at_blitz" , "cashhboyy" , "castonneux" , "castorxpollux" , "casual_mate_in_24" , "casualheadshotpro" , "casutanta123123123" , "catask8" , "catchme225" , "cattherinesmith" , "catweb99" , "cellovayne" , "censoredxyz" , "cesco5544" , "challenger604" , "chalmeropoulos" , "chandelure11" , "chaning_tatyum" , "chaos_r3ign" , "chaumurky" , "cheat3x" , "check_mate" , "checkmate3141" , "checkmateeerree123" , "checkmatingkids" , "checkraiseflops" , "cheetah13" , "chenge22" , "cherimoyayummy" , "cherrera96" , "cherub_enjel" , "chess" , "chess_coding" , "chess_virgin" , "chessathlete" , "chesscomet" , "chessjack11" , "chesskeys" , "chessknight22" , "chesslover" , "chessmessed" , "chessmodern" , "chessquack" , "chesssky2" , "chesstafari" , "chessteachertom" , "chesstheorya00" , "chesstkidding" , "chesswind" , "chessyspagett" , "chetannshah" , "chicagojhawk" , "chickaboogaagabooga" , "chickenpepper20" , "chickenumbrella" , "cholymela" , "chompas11" , "chr1stos94" , "chrislb3224" , "chromethunder2" , "chubspot" , "chuck820357" , "chungboii21" , "circulomorozevich" , "civilenemy" , "claracottontail" , "clark234mc" , "cloroxbleach34" , "clorx" , "closedbroadcast" , "clowersuniverse" , "clumsyrook" , "cnoble27848" , "codax604" , "codykoffel" , "colta111" , "comfysnake" , "commonmisunderstanding" , "compactbuffalo" , "corastas" , "coreaccretion" , "corluxx" , "cormacobear" , "coryy818" , "cosmicoceans" , "cotillionxy" , "cozypain69" , "cr34myl33754uc3" , "cr7sbestfriend" , "crawlywhat" , "crazedmethod" , "crazy_bro_athene" , "crazycoffeeman" , "crazzbez" , "creative_thinking64" , "creybedey2" , "critical_haircut" , "croltown" , "croskie" , "crownroyalwhisky" , "cruelcustomer" , "crunchyjuiceyt" , "ctm095" , "custom_mods" , "cuttlas8" , "cvaal" , "cvele961" , "cwizzo3000" , "cwrle90" , "cyndalive" , "cyraxislive" , "cyrille8574" , "d0wnpour" , "d2o3p4a5" , "d4nnyes" , "d_price0407" , "daaaaaaaaniel" , "dabomegamer" , "dagiantpanda" , "dahlia318" , "dale_b0203" , "dalegarrett95" , "damani_711" , "danielalfred" , "danieltrez" , "danielwench" , "dankestmemerna" , "dannydonesrox" , "dantuch" , "daphnne" , "daredarezhang" , "darf_" , "dariusmisty666" , "dark_knight_chessbrah" , "darkavenger3" , "darkengine_" , "darklorins" , "darknessbylaw" , "darkpiece" , "darthvader15634" , "davidfernando84" , "davronrdm" , "daxypoo71" , "daysofwrathx" , "dchunter1213" , "de_greenlight" , "dead_st0ck" , "deadman_001" , "deathloks" , "deepaklamhe" , "deitmar_ch" , "deletedys" , "demantiis" , "demondim1" , "dentrified" , "denvisser89" , "derbiggler" , "derek013" , "deriseqt" , "derpyturle076" , "descartador" , "detrial" , "devin_essketitt" , "devoe444" , "dffllyer" , "dibbski" , "dickfiddler1738" , "diego_high" , "dienadel41" , "diggerduck" , "dimitriraymondo88" , "dingsaller" , "dipdim" , "dirty_player" , "dirtyhank69" , "dishk0" , "distantfiire" , "ditididi" , "ditto74" , "djchessdog" , "djnapalm585" , "dkaoc" , "dking911" , "dmitry_serdyukov" , "dmnkz" , "dmrocha1024" , "dns_2222" , "doctorlepper" , "doctorlono" , "dog_emit" , "dog_king_101" , "dombrefiel" , "dominatrix2804" , "dominiquemyers" , "donnahh" , "dontcrywolff" , "donx4me" , "donz10" , "doodlingperson" , "doorsnake" , "dopenoble" , "doremipasol7" , "doubleanalassgapes0" , "doubledigitzzzz" , "doublereverse" , "doxsaint" , "dr_smelly_gooch" , "dragon321mm" , "dragonmatez" , "drainus" , "drblueman" , "drdremate" , "drexciya808" , "dreydrey" , "drf21" , "driveknight5" , "drizzt2807" , "dropdatbooty" , "drtiltenstein" , "drzykiop" , "dstark93" , "dtg412" , "dubiouschess" , "ducktailz" , "dudecat316" , "durrrr_gg" , "dzabs" , "eaglescharlton" , "ectoface1799" , "eddiebarber2" , "edgarallanpwned420" , "edgeoftommrrow" , "edgykoala" , "ediboss21" , "eduardovasquez" , "edvedder758" , "edwardbuttfingers" , "edwards997chucky" , "eggnchips66" , "eklusis" , "ekxf" , "eldiablo12332" , "elevatortrain" , "eleviation" , "elfens" , "eliemilikow" , "elizark" , "ellipsoul" , "elros_silverhand" , "eltmon" , "elucif969" , "elvon123" , "emailsupport666" , "embriyonikzigot" , "embuhakusopo" , "emil6006" , "emilynella" , "emilyr1998" , "emptybodhi" , "emptywavefunction" , "en_croissant" , "ender_ccz" , "enderzing" , "endlessflame" , "enes266262" , "enpawnsmom" , "enrikesky" , "eoguel" , "epatts" , "epixor_legend_of_cod2" , "erdoganyangil" , "ericaamerica_" , "ericisbeast30149" , "erikido23" , "ernestogonzalezneira" , "eronald" , "erperry1" , "ertugrull01" , "escardifandub_" , "estexx1337" , "eternal__september" , "evanchess" , "evcon69" , "everclear06" , "evil_coookie" , "evilguava" , "ewizzle" , "exaways" , "exorcist_77" , "exploreri" , "exsorters" , "extremedota" , "eyehartroosters" , "eyeohio" , "eyuphanbayraktar28" , "f6mode" , "f8b9" , "fabs_musicproducer" , "falke72" , "fan810" , "fannta" , "fantomexiii" , "fartingmoonman925" , "fatcamp90" , "fate" , "fatfattie1" , "fatherlou771" , "fawwaztariq" , "fearlity" , "fedamaster" , "federalist45" , "ferhax" , "fernand38" , "feuer_psycho" , "ffive_" , "ffreshie" , "fibonacci04816" , "fibonacciyyc" , "fieryfighter" , "fifa13demo" , "fifakingaqeel1" , "figeon" , "finaletable1" , "finna_smash" , "firefightenfreak" , "firstclash" , "fishimpersonator" , "fjankfjankly" , "flanero" , "flightcs" , "flightsquare1" , "flolj" , "floppytuesday" , "floydakash" , "fluffywaffle510" , "fmmarreta84" , "fobbyfisher" , "forceadraw" , "forgetful_steve" , "forketaboutit" , "forsethofdarknef" , "fourierian" , "fractal_dust" , "fractalflowers" , "franciscojose9p" , "frankonator123" , "frantorius" , "friendlyexplosion" , "frobeee" , "frozyeso" , "fsociety13" , "ftpower718" , "funcelot" , "furionblubber" , "fusez0r" , "fut02" , "fuzzyuranus" , "fxstreamer" , "g1eep" , "g_nobbi" , "gabelingoblin" , "gabriel_millee" , "gacoss" , "gambitman14" , "gamedadepre" , "gamerdhs" , "gamergangzextra" , "garryhurz" , "garushia_" , "garyhat" , "gaster619" , "gaykoalabear" , "gb0034" , "gb_eh" , "generaldeluxo" , "gengarr95" , "george288" , "gerberbaby3" , "germinatorz" , "getbasiled" , "gggdol" , "ggivichue" , "ghostfrappe" , "ghostpriggman" , "ghoulie11" , "gigi_yo" , "gilad905" , "giotupapini" , "giraffe_hunter" , "girland00" , "giusbold" , "gizmo88dc" , "gladuke" , "glenny1010" , "glitchyboyy" , "glolen" , "gm_sleepless" , "gmrayrobson" , "gmstreamer" , "gmultraplayer" , "goatmentator" , "gobbedy" , "goblinblacksmith" , "god_of_casuals" , "god_of_naughtiness99" , "going2gomad" , "gokor_the_great" , "gokul999" , "gold1e3" , "goldh00k" , "goldnuscarlsen" , "gonzoooznog" , "good_evening17" , "goodchessmind" , "google_dinosaur_nothing" , "goohtt" , "goonerbear94" , "goonrecruiter" , "gopher_tv" , "goranzaric" , "gordon112007" , "gossipmanager" , "gosuismydadmate" , "got_ryce" , "gothamchess" , "gq_asa_akira" , "grantics" , "great27" , "greatchessplayer" , "greatslyfer43" , "greenapple6999" , "greip_" , "greyshades_" , "grimsshd" , "grittywillis" , "grizzhog11" , "grr__im__here" , "gruskymeerkat11" , "gtxgaming23" , "guizac" , "gummybearthug" , "gunholettv" , "guntherfoll" , "guytori" , "gv_money" , "hachacha" , "hafeez_sayeed" , "hagin27" , "hailstans" , "halfmanthehand" , "halos_raze_wisper" , "haloysius" , "handpullednoodles" , "hanechy_" , "hang_nga" , "hansisgonnawinpoker" , "hansisrllygoodatchess" , "haphazarddamage" , "hardwell24" , "harmcrafts" , "harpvr23" , "harrywallbin" , "harstar_" , "hasantrix" , "hatt555" , "heart_attack_chess" , "heatherkonch" , "heatmizer" , "hectorbonilla" , "hedgehog1963" , "heelgrabber" , "heldmat" , "hemis_" , "henghengwwj1" , "herkull" , "hexapplan" , "hexilucifer" , "hey_its_adam" , "heyhey12345y" , "hfxmunroe" , "hhonkler" , "hicktewth" , "hieriktv" , "highgravity808" , "highimveda" , "highway322" , "hiimcool_" , "hirnloserverlierer" , "hitenstylex" , "hl275" , "hndrya007" , "hobo_dawg" , "hofo75" , "hold_my_beer45" , "hollyisthicc" , "hoopscootch" , "hopeca" , "hopinthedelorean" , "horso" , "housenotonfire" , "houston" , "hristijancakoncev" , "hssl2432" , "ht1992" , "htfp0" , "huhting" , "humanman34" , "hurricanematt" , "hxwilliam" , "hyaluranicacid" , "hydragunman" , "hyperbladex47" , "i05fr3d" , "i_do_know_you" , "i_eat_yummy_poo" , "i_fotted" , "i_got_laid_today" , "i_no_english" , "i_poop_at_chess" , "iam_veryedgy" , "iamnobodyreally" , "ibinot" , "ibragim789" , "ibraheemkhn01" , "ibschi" , "ichessbcuzyoudo" , "iconoc" , "idiomentary" , "idontdeservetolive2" , "igotthatgirth" , "ihatesleeping" , "ihx__5" , "ii_th3ory_ii" , "iiamkevin" , "iilyallen" , "ijhchess" , "ikhajiitmypants" , "iknowyouknow11" , "ilawchess" , "illiteratesoup" , "ilthir" , "im2600andurnot" , "imagentsmith" , "imawoofus" , "imcheatinghuh" , "imchill_00" , "imgottablast" , "immavanta" , "immaxvu" , "immmawarlock" , "immortalcobb" , "imsillysally" , "incitefulnick" , "incomingdiarrhea" , "incredibleblunderer" , "inducedbycoffee" , "ineedbuddy" , "inevereatpoop" , "infamous415" , "ingrid_92" , "inklingismidtier" , "insanedrunkard" , "inserttoken" , "instrumelody" , "internalize" , "intheheart" , "intra123" , "inzidenzstruktur" , "ipodclassic" , "ipooopmypants" , "irnjuggle28" , "ironmansnaps123" , "irush_" , "irvinechesstrainer" , "isolatedpun" , "isoldmysoultorocknroll" , "ispillmypee" , "israelv23" , "isthatcheckmate" , "itakeback" , "item93" , "itmustbetheshoes" , "its_doobuh" , "itslupa" , "itsover_ninethousand" , "iva182" , "ivantw" , "j3wmanchu" , "jacer1454" , "jack444" , "jackfury2017" , "jacksamson_020" , "jackyshowss" , "jacobrutskiy1124" , "jafarnaik" , "jakeloans" , "jamescharlesbutnotgay" , "janczas" , "jane_denton" , "janvreid" , "japanesetutor" , "jaromeiginlasstepdaughter" , "jassenphan" , "javi_3r" , "jawaka23" , "jawsishere" , "jay_naker" , "jaysleeman" , "jaysonsunshine" , "jazeks" , "jbking07" , "jbrazel" , "jdgfcr" , "jdukes3" , "jeegs2424" , "jeffabelle" , "jefforjo" , "jens009" , "jensenlynch" , "jeralllop" , "jeremy_sc2" , "jesserob98" , "jey_ming" , "jffryclrnc" , "jhughes61" , "jiesenp" , "jim_santaku" , "jimjamthemanfam" , "jimmytalontonightshow" , "jimster_99" , "jingram16" , "jj_dynasty" , "jjjeeebbb" , "jjwad95" , "jlandaw" , "jmintj" , "jmoneyjess__" , "joan_igga" , "joaoalexandre0" , "joaopires92" , "jocal17" , "joe010" , "joebruin" , "joelclementine" , "joesphshelton" , "johaanavarachan" , "johahi" , "johnathanisagod21" , "johndickenswolves" , "johnny_thehobo" , "johnnycash12" , "johnnyfranchize" , "johnnygogo382" , "johsellion" , "jojogoloa" , "jokkah" , "jolllybishop" , "jonathan1645" , "jonathansampson" , "jopaa24" , "josbeljr" , "josephb820" , "josharkk" , "josiah1729" , "josmok" , "joyouslovehello" , "jpluma5" , "jr_king__" , "js_1000" , "juangm68" , "juanpyoezii" , "jubaskete" , "julianonery" , "julianproleiko" , "juniorqualifier" , "just__resign" , "justaddblu" , "justanedtior" , "justanothermorty167" , "justdoitplease123" , "justenufstuff" , "justhit2500" , "justice_scalia" , "justonemorepuzzlerush" , "jusx" , "jwktiger" , "jwong01" , "k1ll3u4" , "k1ngmack" , "k1t3nr4g3" , "k_brown1991" , "k_vent" , "kaannism" , "kaese111" , "kahnet" , "kairyu28" , "kaitoulupin" , "kajkati" , "kanishk2000" , "kanivakil" , "kaot1c_k1dd" , "kappa_fappa" , "kappablancaa" , "karacakaan35" , "karla11" , "karpovgambit64" , "katheress" , "kauai_life" , "kcb32" , "kck2056" , "kcnewyork" , "kelsitha" , "kemontaegganah" , "kentimeter_" , "keplare" , "keslie" , "kevin7elway" , "keyg_pma" , "kgreenstone" , "khaki_trousers" , "khaledsaad107" , "kickme34" , "kid_maverick" , "kiegan_b" , "killer123miner" , "killerayanda" , "killyoselffool" , "kilotas1986" , "kindapinkjake" , "kingbertiv" , "kingjord1022" , "kingofthechickengods" , "kingoldman718" , "kingoldman926" , "kingpopo5" , "kinz1z" , "kittykittyhisshisss" , "kittyrules1" , "kkq007" , "klaustrophobic12" , "klausyboi" , "klimtkiller" , "klipseffigy" , "klooop" , "klooth" , "klutchdr" , "knewkn0w" , "knightex62" , "knightpoacher" , "knitler_" , "kobyyyyyyy" , "kodytrent" , "kolt54321" , "komischie" , "kommontater" , "koosha_zargham" , "kopper2002" , "kowalski_x" , "kramnikatung" , "krapstain13" , "krazyvibezz" , "kricksbr2" , "kriegerseele_" , "krowny3" , "kshazar" , "kshinkle" , "kulkidspin" , "kupkake" , "kushdaddy19" , "kwesiquest" , "kylemparker" , "kyoretsue" , "lackiluke_" , "ladderclimb" , "lakarahh" , "lali0000" , "lamb_sauze" , "langrehr8751" , "lastkingrising" , "lastmiles" , "lawrencelafonti" , "laxsusss" , "lazarmark17" , "lazy_sapien" , "leart94" , "learyhoover" , "leavenfish" , "leeslife" , "legolarion" , "legolauz" , "lemonboy66" , "leonid_066" , "leorra" , "letmeslapyourking" , "levathain" , "levyisme" , "levys_chair" , "liam33" , "liamchez12" , "lichesschess" , "lieutenant_scrotes" , "lifes0rcerer" , "light_has_color" , "lightningcowpoop" , "lil_joker11" , "liljoe6string" , "lillebq" , "lillmackish" , "limebr" , "limoforimo" , "lingering_lentil" , "liocl" , "liongeorge1" , "lionill" , "liquideggproduct" , "liquidor" , "liquidsword89" , "little_turd" , "littlepicklee" , "liushu" , "livetera1" , "livkalo" , "ljj17" , "ljs510" , "llamav4" , "llawliet187" , "lmperialsoldier" , "ln_media" , "lnfinitiii" , "loganaugustus" , "loganchan_cellor" , "logannagol" , "logical_fallacy" , "lonewolf_cs" , "lookatthis1" , "loophold_" , "lordmilio" , "lordoftheforeskins" , "lordshado1331" , "lordturbotom" , "lotux27" , "lovelybyte" , "loveseasytears_" , "lowkeyy91" , "lredowl" , "lrimmy" , "luar1609" , "lucaasdamaso" , "lucidchesslive" , "lucie0n" , "lucifer_2020" , "lucky____x" , "lucymoody" , "luddder" , "luis228a" , "lunar_shuttle_tickets" , "lunisce" , "lurkmode16" , "lvrdplex" , "lyghtryder" , "lynx67" , "lyrictenor" , "m0rkiam" , "maalta7" , "maartenols" , "macgyyverlol" , "machinaesupremacy238" , "madeupstuff" , "madmat42" , "madphantasy94" , "maek_28" , "magician_531" , "magicolivers" , "majesticness17" , "major1959" , "makehell_tal" , "makingyoutryharder" , "maksim135541" , "mamoon0806" , "manaxii" , "manycookies" , "marcelyuw" , "marix__haez" , "marsillion" , "martaway" , "marthijn17" , "martimportugaltheman" , "martineden41" , "maskedlemete" , "masokistgirl" , "mast3rt0ny" , "mate_in_china" , "matheusperes0" , "mathwizard296" , "mattyb4703" , "mav1chavoc" , "maverickeyes" , "maxmlynek" , "maxwellmelon69" , "mayjerwinning" , "mayorgrumpsy" , "mazew22" , "mblem22" , "mcblyutman" , "mcjgp" , "mdsajidalam" , "mediumroller" , "megamc988" , "mehdude" , "mehrannjp" , "meisterbehr" , "mejcel" , "melbaa" , "melx23" , "mentalyobesed" , "meowelina" , "meowlodramatic" , "mepluschess" , "mercurymind" , "mere6" , "merindra" , "methematics4477" , "metindgunay" , "mewando" , "michaelinnh" , "michaelscott101" , "michelleharris78" , "microwaved_poop" , "midnightrhino" , "midzito" , "mightypleb" , "mikoisfantastic" , "milfywaygalaxy" , "mingsdad" , "mirjak_" , "mistahbobharris" , "misterhomes" , "mite_ms" , "miyag1dojo" , "mkyn" , "mlehrack" , "mmehrian" , "mneme_baduk" , "moedollas" , "mohammad73" , "molokai1" , "momfoundpoopsock" , "moneymcgill" , "monkborn" , "monkeymagic69" , "monnomtwitch" , "moobot" , "moomoodeath26" , "moonbutter" , "moopus" , "moopypieloopy" , "moscatel87" , "mosesposes" , "movebymove" , "movingdutchman" , "mr_jhv" , "mr_moogles" , "mr_rayne_" , "mrbloodyart" , "mrfartymcbarfpants" , "mrfig" , "mrgreen293" , "mrhugearms" , "mrlpoo" , "mrmarkfilaroski" , "mrnightman" , "mrtrinidad510" , "msfemmeslayer" , "msoriginale" , "mteedmyclip" , "muhendis66" , "mukaikubo" , "muku3200" , "mummymarshall" , "mungashansleton" , "muselkpubgisgoat" , "mutaborrr" , "myarchimedes314" , "myexistenceisfutile" , "mynameiscjx" , "mynamelscj" , "myqueef37" , "mysickduck" , "myspiku" , "mztwitch304" , "naasssss" , "naberius86" , "nagini13" , "naidenovn" , "naka_adopts_eric" , "naltron_osu" , "nargathronic" , "nassim_sh" , "naterader" , "nathan7158" , "nathannalgren" , "nationalpatzer" , "naughty_peanut" , "naughtyyash1209" , "naycir" , "ncshooter" , "neebuz" , "negationofnegation" , "neildeal101" , "nelsonmoore1" , "neonspritebecauseican" , "neotris9" , "nescafestrong" , "neuraloutlet" , "neurogain" , "nevermoreless" , "neverw84m8" , "nextmjgen" , "nhkdhg" , "nickpapatonis" , "nickyownsyou" , "nickysue89" , "nigelbushy" , "nigerian419" , "nightknight32" , "nikkinova90" , "nikko027" , "nikolastheiss" , "nikolastojsin" , "niku_andromeda" , "nimzozo" , "ninja10zmt" , "ninjadudeofficial" , "ninjagendalf" , "ninofrommars" , "nirvanraymond" , "nitrousgamertwitch" , "no_ola" , "nobodynb" , "nobullnoble" , "nodari125" , "nofriction" , "noiki" , "noirpale" , "noizyboy96" , "nomadicpatch" , "nomenescire" , "non_locality" , "nopermabanplz" , "nordboeh" , "noseknowsall" , "nosgothreaper" , "not_a_gm_johndavis_59" , "nota999" , "notfoursquared" , "npcv1984" , "numbskullz" , "nvm32" , "nyohosud" , "o0squirrel0o" , "ob1kenobie" , "oba_lol" , "obrestad99" , "oculto7w7" , "oddonebiggestfan" , "officedemon" , "offllineplayer" , "ogbullygang" , "ogjudas" , "oilerssuuck" , "oinest" , "okni66" , "okokaslan" , "oktested" , "olavipolavi00" , "oldhunter" , "olduglyandslow" , "oledole" , "om_pham" , "omniperspective" , "omnipotentnoob" , "onceapawnatime22" , "onecoffeetwonipples" , "onefudgeboi" , "onerooster123" , "onetwopc" , "ooloncolluphid" , "oooslo" , "openingtheoryexplore" , "oppositeofgrandmaster" , "or1m" , "orcrin12" , "orri32" , "oshidir" , "oui_ouims" , "outer_dimension" , "outsider10011001" , "over_thetop" , "overlaygames" , "oysteingk" , "oyvindmal" , "pagingthealtar" , "paigey" , "paijaus" , "painpita" , "pakelis" , "paleemperor94" , "palmroth197" , "pantherxer0" , "papoi321" , "parabalistic" , "paradoxicalbeing" , "parakeet_peeps" , "partisan2500" , "partyman25" , "partytimevv" , "pasapa" , "passedpawn99" , "pastapraego" , "patronizeddd" , "patzer_varun" , "pauloodbelis" , "pawngrubber" , "pawnsplatter" , "pc_meat_lasagna" , "pdxzionlion" , "peachipaws" , "pendrewtanguin" , "penguingm999" , "pepetusb" , "pepperoniinmyporridge" , "perpetualstalemate" , "persistencemodule" , "petrllx" , "pettayt" , "phantomplay3r" , "phenomenalp1one" , "phil_frags" , "phillyboy8008" , "phillycheezttv" , "phoolala" , "photochess" , "piecelovehappiness" , "pigeonmastah" , "piideli" , "pinkfloyded3" , "pinkgatorrode" , "pinkpocky" , "pipus260" , "pj2002_xxx" , "plabscore" , "planesrunners" , "plataea" , "plato_the_potato" , "playthegrob" , "pleasurebeam" , "plevis57" , "plgbz" , "ploucroux" , "plzkillmeslowly" , "pogchamp57" , "pojmaneam" , "pokercommentator" , "polottus" , "polypies73" , "poopgod" , "poopooextreme" , "poopoosticky" , "poopydickens" , "popabag" , "porcelain123" , "porkly" , "potpic" , "potsmokinglegend" , "pouryafard" , "powerchess" , "poya221b" , "pr0n00b_" , "prevailer019" , "prime77" , "primeshoe" , "prince_higdon" , "princesquirel" , "prkid86" , "professorendjala" , "programmist_ebanniy" , "pubgplayer1744" , "pullbackthe_bolt" , "pulmonarymedina" , "purgatoires" , "pushdapawns" , "pushisland" , "pwalesdi" , "pyaru536" , "qballking4" , "qq_knight" , "quan319" , "quashick" , "quicklywatchestv" , "quince47" , "quincyorg" , "quintintanksley" , "qulala" , "r00tifant" , "rabid_skwirl" , "raccoonoranges" , "rachid_o" , "raffey13" , "raffix170000" , "ragnock_the_destroyer" , "rahmenburg" , "rainbow476" , "raisedbychozos" , "ralph_wigum_" , "rambo2019" , "randomname993" , "raphael32" , "ratulmaster377" , "raviorz" , "raxxoxd" , "rayne_amazon" , "raziel_the_fallen" , "realdogemon" , "realgenius9898" , "reavor" , "reborndrago" , "reconassin" , "red_citizen" , "redbunnybun" , "redgaara09" , "redhat__83" , "reedthedamnbook" , "reflypubg" , "reformedmale" , "refunkt" , "reichler" , "rekone75" , "rektiw0w" , "reliqs" , "renttodaynooooot" , "reptiliano88" , "revealchess" , "reverentt" , "rexandjeanne" , "rezahaqiqi66" , "rezasaurusrex" , "riataman" , "ribbz_" , "ricerocket42" , "rich_chigga" , "richard_jiggler" , "richsmo" , "riddasarusttv" , "rihpa" , "rilke21" , "rizash" , "rjaxon18" , "rmeatte" , "robert969696" , "robobeer" , "robocooldude2468" , "robsusername" , "rocketixx" , "rocknrolljb" , "rockybalboasnuts" , "romanchessmaster2" , "rookcrusher" , "rookymistakes" , "rootabeggas" , "roraurora7" , "roversed" , "rrhydd" , "rrisedk" , "ruble__" , "rudolf85_" , "ruggamuffin1" , "ruiisuuu" , "rukasudesu34" , "ruligaris" , "rusk1turbopubg" , "russthebus14" , "russthebus16" , "ruzzle26" , "ryanmp99" , "ryanwannabe" , "rysperdalll" , "ryu92" , "s00sadtv" , "saatviks" , "sacredtwin11" , "sactheexchange" , "sagerules" , "saiftrkmani" , "sajbott" , "salcalibulgurpilavi" , "salcrucifer" , "saltsaltsaltt" , "salty_ciown" , "salty_clown" , "samiandoni" , "samlinho" , "sammiidx" , "sangan4ever" , "sanguinephoenixx" , "sanjayrame123" , "sanpuchis" , "santiaprende" , "sarahwynn" , "sarcasticninja" , "sardonicpawn" , "sartaglo" , "saschadapawneater" , "saschathemediocre" , "satan233c" , "satansvalet77" , "satchitanandaj" , "saurabhxd" , "sausagegod69" , "savoffm" , "scarthewolf12" , "schhmoney" , "scoffman_bratr" , "scottdpt12" , "scramble_this" , "sealxteam6" , "seamoose" , "seanyang0813" , "sebaztuk" , "sedifric" , "seeking_alpha" , "seepis" , "sefcakir" , "seinrien" , "seismicwhite" , "seldom_pooper" , "senjai" , "sepehr91" , "sephalis" , "sequentialcircuits" , "sergioktl" , "sertmansc" , "sewicsyde" , "shadecorn" , "shafer__" , "shanmukha_meruga" , "sharbel04" , "shartnation" , "shayanov" , "shendoxjoey" , "sherlock117" , "sherrygherkin" , "shibity00" , "shieldofdeflection" , "shin_ftw" , "shizzlesticksz" , "shonkinator" , "shottysteve" , "shoughie" , "shrekkles" , "shreyaskp" , "shuhaitthegreat" , "sicinthemind" , "siddharth1711476" , "siddheshgade" , "siggy717" , "siimeys" , "sikuriestchess" , "siljekulstad" , "silkymcnuggets" , "simonp1987" , "simplicial" , "simplyblue293" , "sina68d" , "sinaftw" , "sinanian1" , "sinboy_" , "sinsjudge" , "sionar" , "sirraptor_" , "sisyphusrocs" , "skacerino" , "sketchygamer01" , "skillfulgoose75" , "skillidansaltrage" , "skyimpacted" , "skylargames" , "skytrident120" , "slartybestfart" , "sleazyart" , "sleepydiaablo" , "sleepyirv" , "sliceserve" , "slickyskye" , "slimycucumber" , "slobatro" , "slomka8" , "small139999" , "smarterchess" , "smashhhhhhhh" , "smokedbrisket1" , "smoknhotgirl" , "smudgey_boi" , "snakelol_8" , "snakeoilscrub" , "snaky2" , "snatchpato" , "sneakyisback" , "snickersnicker" , "snuffles1120" , "socal8181" , "soccer3222" , "socially_squidward" , "sock_o" , "socratesthegrey" , "sofa_king_lovable" , "soheilsoheil1" , "solarau_poker" , "somut" , "son0fabirch" , "sonergonul1" , "soothsayrr" , "soradakey" , "soraka_w_not_learned" , "sotala" , "soulkrusher7" , "soundsofkilling" , "southernsalt" , "spacecactuses" , "spaghetti_chess" , "spaghettiohhhs" , "speakvincer" , "specjalna_dostawa" , "sphinxy9" , "spirossteve" , "spoiled_kitty" , "squatchyy" , "ssbm_highlander" , "stankybeefflaps" , "starsalamajack" , "stas1567" , "stashq" , "stc20xx" , "stefanpoe" , "stephenisdedalus" , "stevencumlings" , "stevenson2405" , "stevespirosthegod" , "stevew90" , "stevis5" , "stevonub420" , "stoprunningiamfat" , "str3sslord" , "strafferett" , "straightfiya" , "streamelements" , "striderboigetsrekd" , "string_dogg" , "strugglebusses" , "stuk123" , "suicidalpingu_" , "suicideadgods" , "sunnykk" , "superbueb" , "superninjatzu" , "superplayz1231" , "supersingh10" , "supness1" , "suspicious_moves" , "sutibumbu" , "svengartheterrible" , "swagtorian" , "swarmed" , "swiftpower7" , "swim19" , "swisspresident" , "sylent_knyght" , "synrage" , "taclara" , "taconexus" , "tagbon" , "tahahk" , "takestakestakes" , "talfski" , "taragaarn" , "tasteepastry" , "tasty_cookies" , "tawxic4simon" , "tayip999" , "taytaytyrone69" , "tb12isagod" , "teabagyoazz" , "tecomoelculooo" , "teepsqueaks" , "tehshoe" , "telamohn1" , "teliatuli1" , "tellkyletohydrate" , "tellusumpin" , "temporaryshadow" , "temptationdelight" , "tester991" , "testprofile39" , "tetris_addict" , "tetrolobs" , "texasblugreen" , "th3xaw3s0m3" , "thalisonamaral2" , "thancin" , "thankyoubishop" , "that_fat_kiddd" , "thatkid2013" , "thatsmate" , "thatsociopath" , "thatthomas" , "the5000yearoldpharaoh" , "the_5cientist" , "the_blobfish" , "the_boomer123" , "the_sniper_chess" , "the_tasty_pickle" , "the_zaal" , "theassistant666" , "theaveragekappa" , "thebestguydud3" , "thebestguydude" , "thebigbadjuju" , "thebingleboop" , "theblev" , "thebluewolf___" , "thechasm9" , "thedukeofprunes" , "theglobalsiiver" , "thehopefulbishop" , "theking10223" , "thelegendhimself222" , "theleobt" , "theliquidator101" , "thelittiest" , "thelkingdossgaming" , "thelucasmito" , "theluckyjohn" , "themadqueenranter" , "themastermindofall" , "themusic" , "theogcooter" , "theonefeather123" , "thepuddleofaids" , "theratrivertrapper" , "therealestraph" , "therealpuppypunter" , "therebeliouscow" , "therripper" , "thesilverniko" , "thesindustry" , "thesnake9787" , "thesouvinearman" , "thesupersaiyan99" , "thetimeofnick" , "thetruthicc" , "theunlikelyknight" , "thewhitetw1" , "theycallmetalon" , "thinkofanumber" , "thinktwicegk" , "this__boring" , "thissil_" , "thornralston" , "thorzie1" , "thouniiii" , "thoushantlewdkaori" , "thulester" , "thunder99_hs" , "tiguent" , "timelapseryan" , "timeticker1127" , "tip_genius" , "tipsytun" , "tito85" , "tjm6x2" , "tlbogdan94" , "tls_567" , "tnkhanh" , "toddl1088" , "toehack" , "tolesag" , "tolosdomi" , "tomahawkki" , "tomcarbo1" , "tonightwefeast" , "tonybax" , "tonytuori" , "torifanforever" , "torqueytv" , "totti_7" , "towerofgodmanhwa" , "towzera" , "toxicwaste6556" , "toystoystoys" , "tr8r_scum" , "tramvay4ik" , "treasonous_trump" , "treatyoubettter" , "trenzzie" , "tribeca917" , "tricaset" , "tricksmom" , "trumpsatonmyface" , "trungwin315" , "truwarier14" , "tryumpfant" , "tsarsec" , "tsikas666" , "tsivhhh" , "tssn_alfa" , "tssvfttsos" , "ttfu_crockett" , "tukan37" , "turkeyfarm3" , "turkeylizard1" , "twigmytwig" , "twinkees09" , "twistedseed" , "twitchuser2002_" , "twitchuser34526" , "twitchydinky123" , "twitchyjohns" , "twitchyolcusu" , "twopiecenobiscuit" , "twoy519" , "twtwww" , "tylmcn" , "tyranitar8" , "tyrinnus" , "tyrkinator" , "tysmithnet" , "uarekomodo" , "uberecks" , "ubervibe" , "ultra1280" , "unc0nv3ntional" , "uncletuck98" , "unconscious_gho6" , "unga1234" , "unholyurinal" , "unnamedcomet" , "unrim" , "untxi" , "usedunderwearz" , "useruseruser0" , "utzer0" , "v8cong" , "vaizandrew" , "vannfast" , "vanquisher13" , "vanzigx" , "vaskez777" , "vea1337" , "vecksie" , "velomek" , "veraloka96" , "verminho" , "versacesouthpaw" , "vertwitch" , "veteranbailey11b" , "vexizor1212" , "victim0fmymind" , "vikcch" , "vineetmgh" , "viola_mandshurica" , "violentfridge" , "virgil_85" , "vishvafire" , "vitalus" , "vitothehero" , "vity630" , "vladimirenglisher" , "vvolfsing" , "vyenos2507" , "wadudehek666" , "wajeya" , "walliali202" , "walruschi" , "wanwenyan" , "war_of_ideas" , "warmpepsi" , "warp_drive_troglodyte" , "wasabi_bones" , "waterpolochampion" , "wavykat" , "wawasauna" , "wayneking7" , "wcmbrittanyzamora" , "wesecc" , "wh1stlecube" , "whatever_001" , "whatischess" , "wheeis__" , "wheresthereceipt" , "whiskeryant" , "whiskeyfixx" , "whiteb525" , "whitebeltscholar" , "whoispenguingm1" , "whosteeenoh" , "whosthathandsomedevil" , "whyforniteexist" , "wiedehopf" , "wildfire9020" , "wingsofwayn3" , "winneroleg" , "wittyseal" , "wixur10" , "wlynn3" , "wolfrik_tv" , "wolfsbane93" , "wollycc" , "woody19912" , "wordsarefutiledevices" , "wraxandstim" , "wumbifner" , "wustenf" , "xaimshot" , "xdefylerx" , "xdslammed" , "xelabagus" , "xerazaz" , "xexreflex" , "xisak_" , "xisumasassamtea" , "xlinted" , "xmasturhater" , "xolthus" , "xpertzombue375" , "xroslol" , "xsp1ralx" , "xx2warlock3xx" , "xx_casualgamer1" , "xxfrankenstein" , "xxfrankhorriganxx" , "xyz_abc_" , "yaboymrluke" , "yachtourage" , "yahia_maes" , "yahmez" , "yahya_barghash" , "yajirobefromdcpd" , "yakuza_ronin" , "yanivkz" , "yara_2000" , "yasserspwnboi" , "yazan_foudeh" , "yeeitsroman" , "yeesh" , "yesihaveautism" , "ymilikow" , "yodabolt" , "yodelmeisterrr" , "youandmeandyourbestfriend" , "younesbani" , "yousefsam56" , "yoyo9" , "yrnuts" , "yrrigs" , "yugifox" , "yury_z" , "yuvib15" , "z0ndark" , "zaeema" , "zaieyn" , "zak9819" , "zane_park" , "zangetsu_t" , "zareer" , "zaxx67" , "zebraismyboss" , "zecred" , "zedzedd75" , "zee_squared" , "zeldaalasca" , "zenbeat" , "zershterer" , "zeusdeus" , "zeverzak" , "zinberlyy" , "zionpureinheart" , "ziozc" , "zippyrm" , "zjtrickster" , "zlysergic" , "znation_chess" , "zommi" , "zoot_z00t" , "zpoutinez" , "zskillsrs" , "zuvery" , "zyffe" , "zyklon420" , "zzb303" ];

function searchBlacklist( wText ) {

	var lower = wText.toLowerCase();

	if ( hideUsernames ) {
		if ( lower.indexOf( "@" ) > -1 ) {
			console.log( "found @ mention" )
			console.log( wText );
			return true;
		}
		for ( var i = 0; i < LatestUserList.length; ++i ) {
			if ( lower.indexOf( LatestUserList[ i ] ) > -1 ) {
				console.log( "found someone who knows about @ mentions" );
				console.log( wText );
				return true;
			}
		}
		// And of course , now we need nicknames , fucking psychopaths
	}

	if ( blacklistMessagesToKnownToxicUsernames ) {
		for ( var i = 0; i < blacklist_toxic_usernames.length; ++i ) {
			if ( lower.indexOf( blacklist_toxic_usernames[ i ] ) !== -1 ) {
				console.log( "found message to known 'toxic' username" );
				console.log( wText );
				return true;
			}
		}
	}

	if ( blacklistAnywhereWords ) {
		for ( var i = 0; i < blacklist_anywhere_words.length; ++i ) {
			if ( lower.indexOf( blacklist_anywhere_words[ i ] ) !== -1 ) {
				console.log( "found anywhere" );
				console.log( wText );
				return true;
			}
		}
	}

	if ( blacklistExactWords ) {
		var x11 = wText.split( ":" )[ 1 ];
		if ( x11 ) {
			x11 = x11.split( " " );
			for ( var j = 0; j < x11.length; ++j ) {
				for ( var i = 0; i < blacklist_exact_words.length; ++i ) {
					if ( x11[ j ] === blacklist_exact_words[ i ] ) {
						console.log( "found exact" );
						console.log( wText );
						return true;
					}
				}
			}
		}
	}

	return false;
}

function filter_custom_sub_mode( wString ) {
	var channel = window.location.href.split( "twitch.tv/" )[ 1 ];
	if ( !custom_sub_mode_channels[ channel ] ) { return false; }
	if ( wString.indexOf( "VIP badge" ) > -1 ) { return false; }
	if ( wString.indexOf( "Moderator badge" ) > -1 ) { return false; }
	var wEnd = wString.indexOf( "Subscriber" );
	if ( wEnd > -1 ) {
		var wStart = wString.indexOf( "<img alt=" );
		if ( wStart > -1 ) {
			wStart = wStart + 10;
			var wSubString = wString.substring( wStart , wEnd );
			console.log( wSubString );
			var wMonths = wSubString.split( "-Month" );
			if ( wMonths ) { wMonths = parseInt( wMonths[ 0 ] ); }
			else { return true; }

			if ( wMonths > custom_sub_mode_channels[ channel ] ) {
				return false;
			}
		}
	}
	return true;
}



var chat_input = false;
var chat_send_button = false;
function find_text_input_and_send_button() {
	chat_input = document.querySelector( 'textarea[data-test-selector="chat-input"]' );
	chat_send_button = document.querySelector( 'button[data-a-target="chat-send-button"]' );
}

function press_enter_button() {
	chat_input.click();
	var event = new KeyboardEvent('keydown',{'key':13});
	document.dispatchEvent(event);
}

function attach_ignore_everyone_support_to_node( addedNode ) {
	console.log( "trying to ignore username" );
	var chat_line = addedNode.innerText;
	var username = chat_line.split( " " );
	if ( !!!username[ 0 ] ) { return; }
	username = username[ 0 ].split( ":" );
	if ( !!!username[ 0 ] ) { return; }
	console.log( username );
	chat_input.value = "/ignore " + username[ 0 ];
	press_enter_button();
	//setTimeout( function() { console.log( chat_send_button ); chat_send_button.click(); chat_send_button.click(); } , 100 );
}

function attach_blacklist_support_to_node( addedNode ) {
	var msg = addedNode.innerText;

	//var remove = filter_custom_sub_mode( addedNode.innerHTML );
	var remove = false;
	if ( !remove ) { remove = searchBlacklist( msg ); }

	// If Not Already Set to be Removed , Search Emotes
	if ( !remove ) {
		//console.log( addedNode.innerHTML );
		var searchText = addedNode.innerHTML;
		var candidates = [];
		if ( searchText ) {
			var re = new RegExp( 'alt="' , "gi" );
			var starts = new Array();
			while ( re.exec( searchText ) ){
				starts.push( re.lastIndex );
			}
			if ( starts.length > 0 ) {
				for ( var i = 0; i < starts.length; ++i ) {
					var stop = searchText.indexOf( '"' , starts[ i ] );
					if ( stop ) {
						candidates.push( searchText.substring( starts[ i ] , stop ) );
					}
				}
			}

		}
		if ( candidates.length > 1 ) {
			for ( var i = 1; i < candidates.length; ++i ) {
				if ( !remove ) {
					remove = searchBlacklist( candidates[ i ] );
				}
				else { break; }
			}
			//console.log( candidates );
		}

	}

	if ( remove ) {
		if ( addedNode.parentNode ) {
			try {
				console.log( msg );
				addedNode.setAttribute( "style", "visibility: hidden !important" );
				addedNode.setAttribute( "style", "height: 0 !important" );
				addedNode.setAttribute( "style", "padding: 0 !important" );
				addedNode.innerHTML = "";
			}
			catch( e ) { console.log( e ); }
		}
	}

	//addedNode.innerText = addedNode.innerText.replace( ":" , "" );



	/*
	var cleaned = addedNode.innerText.split( ":" );
	if ( cleaned ) {
		if ( cleaned[ 1 ] ) {
			addedNode.innerText = cleaned[ 1 ];
		}
	}
	*/

}
// Blacklist BS
// ===============================================================================
// ===============================================================================

// Hide Username Stuff
// ===============================================================================
// ===============================================================================
function hide_username( addedNode ) {
	addedNode.childNodes[ 0 ].setAttribute( "style", "display: none !important" );
	addedNode.childNodes[ 1 ].setAttribute( "style", "display: none !important" );
	addedNode.addEventListener( "mouseover" , function() {
		this.childNodes[ 1 ].setAttribute( "style" , "display: inline !important" );
	} , true );
	addedNode.addEventListener( "mouseout" , function() {
		this.childNodes[ 1 ].setAttribute( "style" , "display: none !important" );
	} , true );
}
// Hide Username Stuff
// ===============================================================================
// ===============================================================================


// Chat Messasge Observer
// ===============================================================================
// ===============================================================================
var chat_element = null;
var chat_observer = null;
var observerConfig = {
	attributes: true,
	childList: true,
	characterData: true
};

function loadObserver() {
	//add_css();
	find_text_input_and_send_button();
	chat_observer = new MutationObserver( function( mutations ) {
		mutations.forEach( function( mutation , index ) {
			if ( mutation.type === "childList" ) {
				var addedNode = mutation.addedNodes[ 0 ];
				if( !addedNode ) { return; }
				if ( addedNode.className === "chat-line__message" ) {

					if ( ignoreEveryone ) { attach_ignore_everyone_support_to_node( addedNode ); }

					if ( hideUsernames ) { hide_username( addedNode ); }

					if ( TranslationActive ) { attach_translation_support_to_node( addedNode ); }

					if ( enableBlacklist ) { attach_blacklist_support_to_node( addedNode ); }
				}
				/*
				else if ( addedNode.className === "chat-line__status" ) {
					addedNode.setAttribute( "style", "display: none !important" );
				}
				else if ( addedNode.className.indexOf( "notice" ) > -1 ) {
					addedNode.setAttribute( "style", "display: none !important" );
				}
				*/
				else {
					console.log( addedNode );
					console.log( addedNode.className );
					addedNode.setAttribute( "style", "display: none !important" );
				}
			}
		});
	});

	if ( enableTranslation && gapi_key ) {
		TranslationActive = true;
		console.log( "Translation Option Loaded" );
	}
	chat_observer.observe( chat_element , observerConfig );
}
// Chat Messasge Observer
// ===============================================================================
// ===============================================================================


// Init
(function() {
	setTimeout( function() {
		var ready = setInterval(function(){
			var x1 = document.querySelectorAll( '[role="log"]' );
			if ( x1 ) { if ( x1[ 0 ] ) { chat_element = x1[0]; clearInterval( ready ); loadObserver(); } }
		} , 2 );
		setTimeout( function() {
			clearInterval( ready );
		} , 10000 );
	} , 500 );
})();
