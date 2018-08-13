$hub = null;
window.NULL = null;
window.COM_TIMEFORMAT = 'YYYY-MM-DD HH:mm:ss';
window.COM_TIMEFORMAT2 = 'YYYY-MM-DDTHH:mm:ss';
TargetAsset = {};
function setUserinfo(user){localStorage.setItem("COM.QUIKTRAK.INSTALLER.USERINFO", JSON.stringify(user));}
function getUserinfo(){var ret = {};var str = localStorage.getItem("COM.QUIKTRAK.INSTALLER.USERINFO");if(str) {ret = JSON.parse(str);} return ret;}
function isJsonString(str){try{var ret=JSON.parse(str);}catch(e){return false;}return ret;}
function toTitleCase(str){return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});}

function guid() {
  function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

//userCode = minorToken 
//code = majorToken 

function getPlusInfo(){
    if(window.plus) {
        window.uuid = plus.device.uuid;
        var info = plus.push.getClientInfo();
        localStorage.PUSH_MOBILE_TOKEN = info.token;
        localStorage.PUSH_APPID_ID = info.appid;
        localStorage.PUSH_APP_KEY = info.appkey;
        localStorage.PUSH_DEVICE_TOKEN = info.clientid;
        localStorage.DEVICE_TYPE = plus.os.name? plus.os.name : "web";
    }else{
        var uid = guid();
            if(!localStorage.PUSH_MOBILE_TOKEN)
            localStorage.PUSH_MOBILE_TOKEN = uid;
            if(!localStorage.PUSH_APP_KEY)
            localStorage.PUSH_APP_KEY = uid;
            if(!localStorage.PUSH_DEVICE_TOKEN)
            localStorage.PUSH_DEVICE_TOKEN = uid;
            //localStorage.PUSH_DEVICE_TOKEN = "75ba1639-92ae-0c4c-d423-4fad1e48a49d"
        localStorage.PUSH_APPID_ID = 'webapp';
        localStorage.DEVICE_TYPE = "web";        
    }
}

var inBrowser = 0;
var notificationChecked = 0;
var loginTimer = 0;
var loginDone = 0;

var maxClientIdCycle = 10; 
var clientIdCycle = 1;

if( navigator.userAgent.match(/Windows/i) ){    
    inBrowser = 1;
}

//document.addEventListener( "plusready", onPlusReady, false ); 
document.addEventListener("deviceready", onPlusReady, false ); 

function onPlusReady(){   
    
    getPlusInfo();

   /* if　(!localStorage.ACCOUNT){
        plus.push.clear();
    } */

    if (!inBrowser) {
        if(getUserinfo().MinorToken) {
            login();    
        }
        else {
            logout();
        } 
    }

    /*plus.key.addEventListener("backbutton", backFix, false);      
    document.addEventListener("background", onAppBackground, false);
    document.addEventListener("foreground", onAppForeground, false);    
    
    document.addEventListener("newintent", onAppNewintent, false);  

    plus.push.addEventListener("receive", onPushRecieve, false );
    plus.push.addEventListener("click", onPushClick, false );*/

    document.addEventListener("backbutton", backFix, false); 
    document.addEventListener("resume", onAppReume, false);
    document.addEventListener("pause", onAppPause, false);

    setupPush();
}

function setupPush(){
        var push = PushNotification.init({
            "android": {
                //"senderID": "264121929701"                             
            },
            "browser": {
                pushServiceURL: 'http://push.api.phonegap.com/v1/push'
            },            
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });
        console.log('after init');

        push.on('registration', function(data) {
            console.log('registration event: ' + data.registrationId);           
            
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        push.on('notification', function(data) {
            console.log('notification event');
            navigator.notification.alert(
                data.message,         // message
                null,                 // callback
                data.title,           // title
                'Ok'                  // buttonName
            );
            alert(data.message + ' ' + data.title);
       });

       /* if　(!localStorage.ACCOUNT){
            push.clearAllNotifications();
        }*/
}

function onPushClick (msg){     // will work in iOS and in // ANDROID go ONLY here
    var all_msg = [];
    var message = '';
    //alert(msg.payload);
    if (msg && msg.payload) {
        var parsedPayload = isJsonString(msg.payload);
        
        if (parsedPayload) {
            message = parsedPayload;
        }else{
            message = msg.payload;
        }  
        if(typeof(message)=='string'){
            var testArr = message.split("payload");           
            if (testArr && testArr[1]) {
                message = testArr[1].slice(2).slice(0, -1);
                message = isJsonString(message);
            }            
        } 
        if (message) {
            all_msg.push(message);
        }
    }
    if (all_msg.length > 0) {
        var container = $$('body');
        if (container.children('.progressbar, .progressbar-infinite').length) return; //don't run all this if there is a current progressbar loading
        App.showProgressbar(container); 

        loginTimer = setInterval(function() {                
                if (notificationChecked) {
                    clearInterval(loginTimer);
                    setTimeout(function(){
                        //alert('before processClickOnPushNotification');
                         processClickOnPushNotification(all_msg); 
                         App.hideProgressbar();               
                    },1000); 
                }
            }, 1000);   
    }

}

function onPushRecieve( msg ){      //will work in android    and iOS - if in foreground    
    var osName = plus.os.name.toLowerCase();  
      
    switch ( osName ) {
        case "android":
            var all_msg = plus.push.getAllMessage();
            if (all_msg === null || all_msg.length === 0) {
                var message = {};
                all_msg = [];
                message.payload = msg.payload;                     
                all_msg.push(message);
            }
            if (all_msg) {
                var popped = all_msg.pop();
                all_msg = [];                
                all_msg.push(popped);
                
                //setNotificationList(all_msg); 

                var loginTimer = setInterval(function() {
                        if (notificationChecked) {
                            clearInterval(loginTimer);                                    
                            processClickOnPushNotification(all_msg);
                        }
                    }, 1000); 
            }
        break;

        case "ios":
            //if (appPaused) {
                if (!isJsonString(msg)) {                
                    if (msg.aps) {
                        var payload = JSON.stringify(msg.payload); 
                        if (localPushLastPayload != payload) {
                            localPushLastPayload = payload;
                            plus.push.createMessage(msg.content, payload, {cover:false} );
                        } 
                    }                    
                }
            //}      
        break;
        default:
        // other
        break;
    }       
}

function onAppPause(){ 
    if ($hub) {
        $hub.stop();
    }
} 
function onAppReume(){ 
    getNewNotifications(); 
    if ($hub) {
        $hub.start();
    } 
}  
function onAppBackground() {
    if ($hub) {
        $hub.stop();
    }
}
function onAppForeground() {
    getNewNotifications();  
    if ($hub) {
        $hub.start();
    }      
}
function onAppNewintent() {
    getNewNotifications();
    if ($hub) {
        $hub.start();
    }        
}

function backFix(event){
    var page=App.getCurrentView().activePage;        
    if(page.name=="index"){           
        var ws=plus.webview.currentWebview();
        App.confirm(LANGUAGE.PROMPT_MSG015, function () {        
            ws.close();
        });
    }else{
        mainView.router.back();
    } 
}

function webSockConnect(){    
    var MinorToken = getUserinfo().userCode;
    var deviceToken = !localStorage.PUSH_DEVICE_TOKEN ? '123' : localStorage.PUSH_DEVICE_TOKEN;
    $hub = hubHelper({ url :"http://api.Quikdata.co:8088/",
                           qs: {
                                MinorToken : MinorToken,
                                DeviceToken : encodeURIComponent(deviceToken)
                           },
                           hub: "v1Hub"
    },{
        receiveMessage: function(from, msg){
            
        },
        receiveNotice: function(msg){            
            console.log(msg);
            var objMsg = isJsonString(msg);      
            if ( objMsg ) {
                var message = {};
                var all_msg = [];                
                
                message.payload = msg;
                all_msg.push(message);
                
                var deviceType = localStorage.DEVICE_TYPE; 
                if (deviceType == "web") {
                    setNotificationList(all_msg);
                }                
                getNewNotifications();
                
                var activePage = mainView.activePage;
    
                if ( typeof(activePage) == 'undefined' || (activePage && activePage.name != "notification")) {   
               
                    $$('.notification_button').addClass('new_not');
                    showMsgNotification(all_msg);
                    
                }else if(deviceType == "web"){
                    showNotification(all_msg);
                }
            }
                
        }
    });
            
    $hub.start();
}

// Initialize your app
var MapTrack = null;
window.PosMarker = {};
var virtualNotificationList = null;
var virtualCommandsHistoryList = null;
var App = new Framework7({
    swipePanel: 'left',   
    swipeBackPage: false,
    material: true,
    //pushState: true,       
    allowDuplicateUrls: true,    
    sortable: false,    
    modalTitle: 'GPS Installer',
    precompileTemplates: true,
    template7Pages: true,
    tapHold: false, //enable tap hold events
    onAjaxStart: function(xhr){
        App.showIndicator();
    },
    onAjaxComplete: function(xhr){
        App.hideIndicator();
    }   
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = App.addView('.view-main', {
    //main: true,
    domCache: true,  
    swipeBackPage: false
});

var API_DOMIAN1 = "http://api.m2mglobaltech.com/Installer/V1/";
var API_DOMIAN2 = "http://quiktrak.co/webapp/QuikProtect.Api2/";
var API_DOMIAN3 = "http://api.m2mglobaltech.com/QuikTrak/V1/";
var API_DOMIAN4 = "http://api.m2mglobaltech.com/QuikProtect/V1/Client/";
var API_DOMIAN5 = "https://m2mdata.co/api/Service/";

var API_URL = {};
//API_URL.URL_GET_LOGIN = API_DOMIAN1 + "Client/Login";
API_URL.URL_GET_LOGIN = API_DOMIAN1 + "Client/Login2";
API_URL.URL_GET_LOGOUT = API_DOMIAN1 + "Client/Logout";
API_URL.URL_GET_ASSET_LIST = API_DOMIAN1 + "Client/GetAssetList";
API_URL.URL_GET_CREDIT = API_DOMIAN1 + "Client/GetCredit";
API_URL.URL_GET_DEVICE_DETAIL = API_DOMIAN1 + "Client/GetAssetDetail";
API_URL.URL_CHANGE_NOTIFICATION_STATUS = API_DOMIAN1 + "Client/Notification";

//API_URL.URL_GET_PROTECT_POSITION = API_DOMIAN1 + "Client/ProtectPostion";
API_URL.URL_GET_PROTECT_POSITION = API_DOMIAN1 + "Client/ProtectPostion2";
//API_URL.URL_GET_STATUS = API_DOMIAN1 + "Client/Status";
API_URL.URL_GET_STATUS = API_DOMIAN1 + "Client/Status2";
//API_URL.URL_SET_IMMOBILISE = API_DOMIAN1 + "Client/Immobilise";
API_URL.URL_SET_IMMOBILISE = API_DOMIAN1 + "Client/Immobilise2";
//API_URL.URL_SET_UNIMMOBILISE = API_DOMIAN1 + "Client/Unimobilise";
API_URL.URL_SET_UNIMMOBILISE = API_DOMIAN1 + "Client/Unimobilise2";
API_URL.URL_GET_LIVE_POSITION = API_DOMIAN1 + "Client/LivePostion";
API_URL.URL_GET_VERIFY2 = API_DOMIAN1 + "Client/Verfiy2";
API_URL.URL_SENT_NOTIFY = API_DOMIAN1 + "Client/SentNotify";
API_URL.URL_EDIT_DEVICE = API_DOMIAN1 + "Client/EditAsset";

API_URL.URL_EDIT_ACCOUNT = API_DOMIAN3 + "User/Edit?MajorToken={0}&MinorToken={1}&FirstName={2}&SubName={3}&Mobile={4}&Phone={5}&EMail={6}";
API_URL.URL_RESET_PASSWORD = API_DOMIAN3 + "User/Password?MinorToken={0}&oldpwd={1}&newpwd={2}";
API_URL.URL_GET_NEW_NOTIFICATIONS = API_DOMIAN3 +"Device/Alarms?MinorToken={0}&deviceToken={1}";


API_URL.URL_REPLACE_IMEI = "http://app.quikprotect.co/activation2/upgrade?DealerToken={0}&imeis={1}";

API_URL.URL_GET_COMMAND_HISTORY = API_DOMIAN1 + "Client/GetCommandHisMessages";
API_URL.URL_GET_SIM_INFO = API_DOMIAN5 + "GetSimInfo";
API_URL.URL_GET_SIM_LIST = API_DOMIAN5 + "GetDeviceList";


//http://api.m2mglobaltech.com/Installer/V1/Client/GetAssetList
//http://api.m2mglobaltech.com/Installer/V1/Client/Status
//http://api.m2mglobaltech.com/Installer/V1/Client/ProtectPostion
//http://api.m2mglobaltech.com/Installer/V1/Client/LivePostion
//http://api.m2mglobaltech.com/Installer/V1/Client/Config
//http://api.m2mglobaltech.com/Installer/V1/Client/Logout
//http://api.m2mglobaltech.com/Installer/V1/Client/StartPush
//http://api.m2mglobaltech.com/Installer/V1/Client/EndPush
//http://api.m2mglobaltech.com/Installer/V1/Client/GetAssetCommandList
//http://api.m2mglobaltech.com/Installer/V1/Client/GetCommandHisMessages

//http://api.m2mglobaltech.com/Installer/V1/Client/Immobilise
//http://api.m2mglobaltech.com/Installer/V1/Client/Unimobilise
//http://api.m2mglobaltech.com/Installer/V1/Client/LiveVerify
//http://api.m2mglobaltech.com/Installer/V1/Client/ProtectVerfiy 


//http://quiktrak.co/webapp/QuikProtect.Api2/ProtectPostion.json?IMEI=0354188046331901
//http://quiktrak.co/webapp/QuikProtect.Api2/Status.json?IMEI=0354188046331901



var cameraButtons = [
    {
        text: LANGUAGE.PHOTO_EDIT_MSG01,
        onClick: function () {
            getImage();
        }
    },
    {
        text: LANGUAGE.PHOTO_EDIT_MSG02,
        onClick: function () {
            galleryImgs();
        }
    },
    {
        text: LANGUAGE.COM_MSG04,
        color: 'red',
        onClick: function () {
            //App.alert('Cancel clicked');
        }
    },
];


var html = Template7.templates.template_Login_Screen();
$$(document.body).append(html); 
html = Template7.templates.template_Popover_Menu();
$$(document.body).append(html);
html = Template7.templates.template_AssetList();
$$('.navbar-fixed').append(html);


var virtualAssetList = App.virtualList('.assetList', {
          
    //List of array items
    items: [
    ],
    height: function (item) {        
        return 118; //display the image with 50px height
    },
    // Display the each item using Template7 template parameter
    renderItem: function (index, item) {
        /*var notificationStates = getAssetNotificationState();
        var notState = 0;
        if (notificationStates && notificationStates[item.IMEI]) {
            notState = notificationStates[item.IMEI];
        }*/

        var ret = '';       
        ret +=  '<li class="item-content" data-imei="'+item.IMEI+'" data-imsi="'+item.IMSI+'" data-name="'+item.Name+'" data-id="'+item.Id+'" data-type="'+item.ProductName+'" data-notifications="'+item.NotificationState+'" >';
        ret +=      '<div class="item-inner">';
        ret +=          '<div class="item-title-row">';
        ret +=              '<div class="item-title color-blue">IMEI: '+item.IMEI+'</div>';
        ret +=              '<div class="item-after"><a href="#" class="item-link f7-icons icon-other-menu-content menuDevice"></a></div>';
        ret +=          '</div>';
        ret +=          '<div class="item-subtitle">IMSI: '+item.IMSI+'</div>';
        ret +=          '<div class="item-subtitle">'+LANGUAGE.HOME_MSG06+': '+item.ProductName+'</div>';
        ret +=          '<div class="item-subtitle">'+item.Name+'</div>';
        ret +=      '</div>';
        ret +=  '</li>';
                                    

        return ret;
    },
});



if (inBrowser) {
    if(getUserinfo().code) {
        login();    
    }
    else {
        logout();
    } 
}


$$('.login-form').on('submit', function (e) {    
    e.preventDefault();     
    login();
    return false;
});
$$('body').on('change keyup input click', '.only_numbers', function(){
    if (this.value.match(/[^0-9]/g)) {
         this.value = this.value.replace(/[^0-9]/g, '');
    }
});

$$('body').on('click', '#menu li', function () {
    var page = $$(this).data('page');  
    //console.log(mainView.activePage);
    //console.log(App.getCurrentView().activePage);
    
    var activePage = mainView.activePage;
    
    if ( typeof(activePage) == 'undefined' || (activePage && activePage.name != page)) {
        switch (page){
            case 'index':              
                toIndex();      
                break;
            case 'user.profile':
                loadProfilePage();
                break; 
            case 'user.recharge.credit':
                loadRechargeCreditPage();
                break;                     
            case 'login':
                App.confirm(LANGUAGE.PROMPT_MSG012, LANGUAGE.MENU_MSG04, function () {        
                    logout();
                });
                break;            
        }
    }

});

$$('body').on('click', 'a.external', function(event) {
    event.preventDefault();
    var href = this.getAttribute('href');
    if (href) {
        if (window.plus) {
            plus.runtime.openURL(href);            
        } else {
            window.open(href,'_blank');
        }
    }
    return false;
});


$$('body').on('click', '.search_tabbar .tab-link', function () {
    
    var href = $$(this).attr('href');
    var searchInput = $$('.formSearchDevice input[type="search"]');

    switch(href){
        case '#tab-imei':
            searchInput.data('searchby','IMEI');
            break;
        case '#tab-imsi':
            searchInput.data('searchby','IMSI');
            break;

        default:
        searchInput.data('searchby','Name');
    }
   
});

$$(document).on('click', '.user_settigns_tabbar a.tab-link', function(e){
    e.preventDefault();   
    var activePage = mainView.activePage;
    var page = $$(this).data('id');
    
    if ( typeof(activePage) == 'undefined' || (activePage && activePage.name != page)) {
        switch (page){          

            case 'user.profile':
                loadProfilePage();
                break;
            case 'user.password':
                loadResetPwdPage();
                break;
        }
    }
    
    return false;
});

$$('.formSearchDevice input[type="search"]').focus(function(){     
    if (this.value.length > 0) {
        $$('.searchDevice').show();
        $$('.searchClear').hide();
    }
});

$$('.formSearchDevice input[type="search"]').blur(function(){   
    if (this.value.length > 0) {
        setTimeout(function(){
            $$('.searchDevice').hide();
            $$('.searchClear').show();
        }, 300);
            
    }
});

$$('body').on('submit', '.formSearchDevice', function (e) {
    e.preventDefault();    
    submitSearchForm();
    return false;
});
$$('body').on('click', '.searchDevice', function () {
    submitSearchForm();
});
$$('body').on('click', '.searchClear', function () {    
    var input = $$(this).siblings('input[type="search"]');
    input.val('');
    input.focus();
    $$('.searchDevice').show();
    $$('.searchClear').hide();
});

$$('body').on('click', '.navbar_title, .navbar_title_index', function(){
    var all_msg = [];
    var popped = '{"title":"IGNITION ON WARNING","type":32768,"imei":"0863014530724922","name":"МАН АА0360КН","lat":48.653384,"lng":12.4702,"speed":0,"direct":0,"time":"2018-08-08T13:21:09"}';
    //var popped = '{"Lat":"-33.970022","Lng":"151.127198","Valid":"A","Speed":"0","Direction":"0","Acc":"OFF","Battery":"13.06","GSM":"23","GPS":"9","Ignition":"77834","Mileage":"447679","alarm":"location","PositionTime":"2018-08-08T13:09:46","Imei":"0352544074331597","Imsi":"234500003188471","AssetName":"Sydney Swift","CreateDateTime":"2018-08-08T13:09:46"}';
    all_msg.push(popped);
    //
    processClickOnPushNotification(all_msg); 
});

$$('body').on('click', '#showToken', function () {
   	if(window.plus) {
        window.uuid = plus.device.uuid;
        var info = plus.push.getClientInfo();
        localStorage.PUSH_MOBILE_TOKEN = info.token;
        localStorage.PUSH_APPID_ID = info.appid;
        localStorage.PUSH_APP_KEY = info.appkey;
        localStorage.PUSH_DEVICE_TOKEN = info.clientid;
        localStorage.DEVICE_TYPE = plus.os.name? plus.os.name : "web";
       
    }else{
    	var uid = guid();
            if(!localStorage.PUSH_MOBILE_TOKEN)
            localStorage.PUSH_MOBILE_TOKEN = uid;
            if(!localStorage.PUSH_APP_KEY)
            localStorage.PUSH_APP_KEY = uid;
            if(!localStorage.PUSH_DEVICE_TOKEN)
            localStorage.PUSH_DEVICE_TOKEN = uid;
            //localStorage.PUSH_DEVICE_TOKEN = "75ba1639-92ae-0c4c-d423-4fad1e48a49d"
        localStorage.PUSH_APPID_ID = 'webapp';
        localStorage.DEVICE_TYPE = "web";   
    }
     var msg = 'PUSH_MOBILE_TOKEN: ' + localStorage.PUSH_MOBILE_TOKEN + ', PUSH_APPID_ID: ' + localStorage.PUSH_APPID_ID + ', PUSH_APP_KEY: ' + localStorage.PUSH_APP_KEY + ', PUSH_DEVICE_TOKEN: ' + localStorage.PUSH_DEVICE_TOKEN + ', DEVICE_TYPE: ' + localStorage.DEVICE_TYPE;
        alert(msg);
});

	
$$(document).on('click', '.backToIndex', function(e){    
    mainView.router.back({
        pageName: 'index', 
        force: true
    });
});

$$(document).on('change', '.leaflet-control-layers-selector[type="radio"]', function(){    
    if (TargetAsset.IMEI) {
        
        var span = $$(this).next();        
        var switcherWrapper = span.find('.mapSwitcherWrapper');
        if (switcherWrapper && switcherWrapper.hasClass('satelliteSwitcherWrapper')) {
            window.PosMarker[TargetAsset.IMEI].setIcon(Protocol.MarkerIcon[1]);
        }else{
            window.PosMarker[TargetAsset.IMEI].setIcon(Protocol.MarkerIcon[0]);
        }
    }
});

$$('body').on('click', '.menuDevice', function () {
    var parrent = $$(this).closest('.item-content');    
    //var caption = parrent.data('imei');    
    
    TargetAsset.IMEI = !parrent.data('imei')? '' : parrent.data('imei');   
    TargetAsset.IMSI = !parrent.data('imsi')? '' : parrent.data('imsi'); 
    TargetAsset.Name = !parrent.data('name')? '' : parrent.data('name');
    TargetAsset.Id = !parrent.data('id')? '' : parrent.data('id');
    TargetAsset.Type = !parrent.data('type')? '' : parrent.data('type');   

    var notificationsCheck = '';    
    if (parrent.data('notifications') == 1) {        
        notificationsCheck = 'checked="checked"';
    }    


    var commands =  '<div class="action_button_wrapper">'+
                        '<div class="action_button_block action_button_media">'+
                            '<i class="f7-icons icon-other-commands color-blue "></i>'+
                        '</div>'+
                        '<div class="action_button_block action_button_text">'+
                            LANGUAGE.HOME_MSG03 +
                        '</div>'+
                    '</div>';

    var commandsHistory =  '<div class="action_button_wrapper">'+
                        '<div class="action_button_block action_button_media">'+
                            '<i class="f7-icons icon-header-history-command-screen color-blue "></i>'+
                        '</div>'+
                        '<div class="action_button_block action_button_text">'+
                            LANGUAGE.ASSET_COMMANDS_HISTORY_MSG00 +
                        '</div>'+
                    '</div>';

    var simInfo =  '<div class="action_button_wrapper">'+
                        '<div class="action_button_block action_button_media">'+
                            '<i class="f7-icons icon-other-info color-blue "></i>'+
                        '</div>'+
                        '<div class="action_button_block action_button_text">'+
                            LANGUAGE.ASSET_SIM_INFO_MSG00 +
                        '</div>'+
                    '</div>';

    var settings =  '<div class="action_button_wrapper">'+
                        '<div class="action_button_block action_button_media">'+
                            '<i class="f7-icons icon-other-service-details color-blue "></i>'+
                        '</div>'+
                        '<div class="action_button_block action_button_text">'+
                            LANGUAGE.HOME_MSG04 +
                        '</div>'+
                    '</div>'; 

    var upgrade =  '<div class="action_button_wrapper">'+
                        '<div class="action_button_block action_button_media">'+
                            '<i class="f7-icons icon-replace-imei color-blue "></i>'+
                        '</div>'+
                        '<div class="action_button_block action_button_text">'+
                            LANGUAGE.HOME_MSG08 +
                        '</div>'+
                    '</div>'; 

    
    var notification =  '<div class="action_button_wrapper">'+                            
                            '<div class="action_button_block action_button_media">'+
                                '<i class="f7-icons icon-header-notification color-blue "></i>'+
                            '</div>'+
                            '<div class="action_button_block action_button_text">'+
                                LANGUAGE.HOME_MSG05 +
                            '</div>'+
                            '<span class="label-switch actionButton-label">'+
                                '<input type="checkbox" name="checkbox-alarm" '+notificationsCheck+'>'+
                                '<div class="checkbox"></div>'+
                            '</span>'+
                        '</div>';
                    
    var buttons = [
        {
            text: 'IMEI: '+TargetAsset.IMEI,
            label: true,
            color: 'blue',
        },
        
        {
            text: commands,  
            onClick: function () {
                loadPageCommands();
            },          
        },
        {
            text: commandsHistory,  
            onClick: function () {
                loadCommandHistoryPage({
                    IMSI: TargetAsset.IMSI,
                    LastDay: 2,
                });
            },          
        },
        {
            text: simInfo,  
            onClick: function () {
                loadSimInfo();
            },          
        },
        {
            text: settings,
            onClick: function () {
                loadPageSettings();
            },  
        },  
        {
            text: upgrade,
            onClick: function () {
                loadPageUpgrade();
            },  
        },      
        {
            text: notification,           
            onClick: function () {
                changeAssetNotificationState(parrent);
            },  
        },
        /*{
            text: cancel,
            color: 'red'
        },*/
    ];
    App.actions(buttons);
});

$$('body').on('click', '.showBlockControll', function () {
    var block = $$(this).next('div');
    if ($$(block).hasClass('sliding')) {
        if ($$(block).hasClass('active')) {
            $(block).slideUp( "slow", function() {
                // Animation complete.
                $$(block).removeClass('active');
            });
        }else{
            $(block).slideDown( "slow", function() {
                // Animation complete.
                $$(block).addClass('active');
            });
        }
    }            
});


App.onPageInit('user.profile', function (page) { 

    /*$$('.user_img').on('click', function (e) {        
        App.actions(cameraButtons);        
    }); */

    
    $$('.applyUserProfile').on('click', function(e){
        
        var userInfo = getUserinfo(); 
        var url = API_URL.URL_EDIT_ACCOUNT.format(userInfo.code,
                userInfo.userCode,
                $$(page.container).find('input[name="FirstName"]').val(),
                $$(page.container).find('input[name="LastName"]').val(),
                $$(page.container).find('input[name="Mobile"]').val(),
                $$(page.container).find('input[name="Phone"]').val(),
                $$(page.container).find('input[name="Email"]').val() 
        ); 

        App.showPreloader();
        JSON.request(url, function(result){ 
                console.log(result);                  
                if (result.MajorCode == '000') {                    
                    
                    userInfo.firstName = result.Data.User.FirstName;
                    userInfo.lastName = result.Data.User.SubName;
                    userInfo.mobile = result.Data.User.Mobile;
                    userInfo.phone = result.Data.User.Phone;
                    userInfo.email = result.Data.User.EMail;                    
                   
                    setUserinfo(userInfo);
                    updateUserData(userInfo);
                    
                    mainView.router.back();
                }else{
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        ); 
    });
});


App.onPageInit('user.password', function (page) {     
    $$('.applyUserPassword').on('click', function(e){    
        var password = {
            old: $$(page.container).find('input[name="Password"]').val(),
            new: $$(page.container).find('input[name="NewPassword"]').val(),
            confirm: $$(page.container).find('input[name="RepeatPassword"]').val()
        };
        
        if ($$(page.container).find('input[name="NewPassword"]').val().length >= 6) {
            if (password.new == password.confirm) {
                var userInfo = getUserinfo(); 
                var url = API_URL.URL_RESET_PASSWORD.format(userInfo.userCode,
                        encodeURIComponent(password.old),
                        encodeURIComponent(password.new)                          
                    ); 
                console.log(url);
                App.showPreloader();
                JSON.request(url, function(result){ 
                        console.log(result);                  
                        if (result.MajorCode == '000') { 
                            App.alert(LANGUAGE.PROMPT_MSG003, function(){
                                logout();
                            });
                        }else{
                            App.alert(LANGUAGE.PROMPT_MSG005);
                        }
                        App.hidePreloader();
                    },
                    function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
                ); 
            }else{
                App.alert(LANGUAGE.COM_MSG14);  //Passwords do not match
            }
        }else{
            App.alert(LANGUAGE.COM_MSG15); // Password should contain at least 6 characters
        }
    });
});

App.onPageInit('user.recharge.credit', function (page) {  
    $$('.button_buy_now').on('click', function(event){
        event.preventDefault();
        setTimeout(function(){
            App.modal({
                //title: LANGUAGE.PROMPT_MSG016,
                text: LANGUAGE.PROMPT_MSG024,
                buttons: [
                    {
                        text: LANGUAGE.COM_MSG19,
                        onClick: function() {                            
                            getCreditBalance(true);                            
                        }
                    },
                    {
                        text: LANGUAGE.COM_MSG20,
                        onClick: function() {
                            
                        }
                    },
                ]
            });
        }, 3000);
        
    });

});

App.onPageInit('notification', function(page){
    $$('.notification_button').removeClass('new_not');  
    var deleteAll = $$(page.container).find('.deleteAllNotifications');
    var notificationContainer = $$(page.container).find('.notificationList');
    //var notificationLi = $$(page.container).find('.notificationList li');

    if (virtualNotificationList) {
        virtualNotificationList.destroy();
    }

    virtualNotificationList = App.virtualList(notificationContainer, { 
        items: [],
        height: function (item) {        
            return 94; //display the image with 50px height
        },
        renderItem: function (index, item) {
            var ret = '';            
            if (typeof item == 'object') {
                if (!item.alarm) {
                    item.alarm = 'Alarm';
                }else if (item.alarm && typeof(item.alarm) == "string"){
                    item.alarm = toTitleCase(item.alarm);
                }
                
                switch (item.alarm){
                    case 'Status':
                        var timeCheck = item.CreateDateTime.indexOf('T');
                        if (timeCheck != -1) {
                            item.CreateDateTime = moment.utc(item.CreateDateTime).toDate();
                            item.CreateDateTime = moment(item.CreateDateTime).format(window.COM_TIMEFORMAT);
                        }
                        ret =   '<li class="swipeout" data-id="'+item.listIndex+'" data-alarm="'+item.alarm+'" >'+
                                    '<div class="swipeout-content item-content ">'+                        
                                        '<div class="item-inner">'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+item.alarm+'</div>'+
                                                '<div class="item-after">'+
                                                    '<div class="time show">'+item.CreateDateTime+'</div>'+
                                                    '<div class="checkbox-hidden">'+
                                                        '<label class="label-checkbox item-content">'+
                                                            '<input type="checkbox" name="checkbox" >'+
                                                            '<span class="item-inner">'+
                                                                '<i class="icon icon-form-checkbox"></i>'+
                                                            '</span>'+                                           
                                                        '</label>'+                                        
                                                    '</div>'+
                                                '</div>'+                                
                                            '</div>'+
                                            '<div class="item-subtitle">IMEI: '+item.Imei+'</div>'+
                                            '<div class="item-subtitle">'+item.AssetName+'</div>'+
                                        '</div>'+
                                    '</div>'+ 
                                    '<div class="swipeout-actions-right">'+                            
                                        '<a href="#" class="swipeout-delete " data-confirm="'+LANGUAGE.PROMPT_MSG010+'" data-confirm-title="'+LANGUAGE.PROMPT_MSG014+'" data-close-on-cancel="true"><i class="f7-icons icon-header-delete"></i></a>'+
                                    '</div>'+
                                '</li>';
                        break;  

                    case 'Location':
                        var time = null;
                        if (item.PositionTime) {
                            time = item.PositionTime;
                        }else if (item.positionTime){
                            time = item.positionTime;
                        }                        
                        ret = '<li class="swipeout" data-id="'+item.listIndex+'" data-alarm="'+item.alarm+'" data-lat="'+item.Lat+'" data-lng="'+item.Lng+'" data-speed="'+item.Speed+'" data-direct="'+item.Direction+'" data-time="'+time+'" data-imei="'+item.Imei+'" data-name="'+item.AssetName+'" >' +                        
                                    '<div class="swipeout-content item-content">' +
                                        '<div class="item-inner">'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+item.alarm+'</div>'+
                                                '<div class="item-after">'+
                                                    '<div class="time show">'+time+'</div>'+
                                                    '<div class="checkbox-hidden">'+
                                                        '<label class="label-checkbox item-content">'+
                                                            '<input type="checkbox" name="checkbox" >'+
                                                            '<span class="item-inner">'+
                                                                '<i class="icon icon-form-checkbox"></i>'+
                                                            '</span>'+                                           
                                                        '</label>'+                                        
                                                    '</div>'+
                                                '</div>'+                                
                                            '</div>'+
                                            '<div class="item-subtitle">IMEI: '+item.Imei+'</div>'+
                                            '<div class="item-subtitle">'+item.AssetName+'</div>'+
                                        '</div>'+
                                    '</div>' +                      
                                    '<div class="swipeout-actions-right">'+                            
                                        '<a href="#" class="swipeout-delete " data-confirm="'+LANGUAGE.PROMPT_MSG010+'" data-confirm-title="'+LANGUAGE.PROMPT_MSG014+'" data-close-on-cancel="true"><i class="f7-icons icon-header-delete"></i></a>'+
                                    '</div>'+
                                '</li>';
                        break; 

                    default:
                        if (typeof item.speed === "undefined") {
                            item.speed = 0;
                        }
                        if (typeof item.direct === "undefined") {
                            item.direct = 0;
                        }
                        if (typeof item.mileage === "undefined") {
                            item.mileage = '-';
                        }
                        ret = '<li class="swipeout" data-id="'+item.listIndex+'" data-alarm="'+item.type+'" data-lat="'+item.lat+'" data-lng="'+item.lng+'" data-speed="'+item.speed+'" data-direct="'+item.direct+'" data-time="'+item.time+'" data-imei="'+item.imei+'" data-name="'+item.name+'" >' +                        
                                    '<div class="swipeout-content item-content">' +
                                        '<div class="item-inner">'+
                                            '<div class="item-title-row">'+
                                                '<div class="item-title">'+item.title+'</div>'+
                                                '<div class="item-after">'+
                                                    '<div class="time show">'+item.time+'</div>'+
                                                    '<div class="checkbox-hidden">'+
                                                        '<label class="label-checkbox item-content">'+
                                                            '<input type="checkbox" name="checkbox" >'+
                                                            '<span class="item-inner">'+
                                                                '<i class="icon icon-form-checkbox"></i>'+
                                                            '</span>'+                                           
                                                        '</label>'+                                        
                                                    '</div>'+
                                                '</div>'+                                
                                            '</div>'+
                                            '<div class="item-subtitle">IMEI: '+item.imei+'</div>'+
                                            '<div class="item-subtitle">'+item.name+'</div>'+
                                        '</div>'+
                                    '</div>' +                      
                                    '<div class="swipeout-actions-right">'+                            
                                        '<a href="#" class="swipeout-delete " data-confirm="'+LANGUAGE.PROMPT_MSG010+'" data-confirm-title="'+LANGUAGE.PROMPT_MSG014+'" data-close-on-cancel="true"><i class="f7-icons icon-header-delete"></i></a>'+
                                    '</div>'+
                                '</li>';

                        

                        
                }
            } 

            return  ret;
        }
    });

    var user = localStorage.ACCOUNT;
    var notList = getNotificationList();
    //console.log(notList[user]);
    showNotification(notList[user]); 
    getNewNotifications();

    $$(deleteAll).on('click', function(){
        var checked = $$(page.container).find('input').prop('checked');
        if (checked) 
        {   // there are selected notifications
            App.confirm(LANGUAGE.PROMPT_MSG017, function () {        
                checked.each(function(){

                });
            });            
        }
        else
        {   //delete all notifications
            App.confirm(LANGUAGE.PROMPT_MSG016, function () {        
                removeAllNotifications();
            });
        }
    });

    /*notificationContainer.on('taphold', '.swipeout', function () {
        $$('.item-after div').toggleClass('show');
    });*/

    /*$$(page.container).on('click', function(e){        
        var element = $(notificationContainer).find('li'); 
        var deleteAllClick = false;
        var contA = $(page.container).find('.right a').is(e.target);
        var contI = $(page.container).find('.right i').is(e.target);
        if (contA || contI) {
            deleteAllClick = true;
        }        
        if (!element.is(e.target) && element.has(e.target).length === 0 && !deleteAllClick) 
        {
            if ($$('.item-after .checkbox-hidden').hasClass('show')) {
                $$('.item-after div').toggleClass('show');
                $$(page.container).find('input').prop('checked', false);
            } 
        }
    });
*/
    notificationContainer.on('deleted', '.swipeout', function () {
        var index = $$(this).data('id');       
        removeNotificationListItem(index);
    });  

    notificationContainer.on('click', '.swipeout', function(){
        if ( !$$(this).hasClass('transitioning') && !$$('.item-after .checkbox-hidden').hasClass('show') ) {  //to preven click when swiping           
            var data = {};
            data.lat = $$(this).data('lat');
            data.lng = $$(this).data('lng');
            data.alarm = $$(this).data('alarm');

            var index = $$(this).data('id');
            var list = getNotificationList();
            var user = localStorage.ACCOUNT; 
            var msg = list[user][index];
            var props = null;

            if (msg) {
                if (msg.payload) {
                    props = isJsonString(msg.payload);
                    if (!props) {
                        props = msg.payload; 
                    }
                }else{
                    props = isJsonString(msg);
                    if (!props) {
                        props = msg; 
                    }
                }

                if(props && data.alarm == 'Status' ){
                    loadPageStatus(props);                 
                }else if (props && parseFloat(data.lat) && parseFloat(data.lat)) { 
                    loadPagePosition(props);
                }else{
                    App.alert(LANGUAGE.PROMPT_MSG023);
                }

            }
            console.log(props);

        }            
    });

});

App.onPageInit('asset.commands.history', function(page){

    if (virtualCommandsHistoryList) {
        virtualCommandsHistoryList.destroy();
    }

    var commandsHystoryList = $$(page.container).find('.commandsHistoryList');

    virtualCommandsHistoryList = App.virtualList(commandsHystoryList, { 
        items: [],
        height: function (item) {
            var height = 99;
            if (item.Direct == 1) {
                height = 79;
            }
            return height; //display the image with 50px height
        },
        renderItem: function (index, item) {
            var ret = '';
            
            var datetime = moment.utc(item.Datetime).toDate();
            datetime = moment(datetime).format(window.COM_TIMEFORMAT);

            
            if (item.Text) {
                item.Text = item.Text.replace(/</g,"&lt;").replace(/>/g,"&gt;");
            }        

            if(item.Direct == 1){
            ret +=  '<li class="item-content with-divider-bottom" >';
            }else{
            ret +=  '<li class="item-content" >';
            }
            ret +=      '<div class="item-inner">';
            ret +=          '<div class="item-title-row">';
            ret +=              '<div class="item-title">';
            if(item.Direct == 1){
                ret +=              '<i class="f7-icons icon-other-sent-message"></i>';
            }else{
                ret +=              '<i class="f7-icons icon-other-received-message"></i>';
            }
            ret +=              '</div>';
            ret +=              '<div class="item-after">' + datetime + '</div>';
            ret +=          '</div>';           
            ret +=          '<div class="item-text">' + item.Text + '</div>';            
            ret +=      '</div>';
            ret +=  '</li>';
            return  ret;
        }
    });    

    var selectLastDay = $$('select[name="LastDaySelect"]');   
    selectLastDay.val(selectLastDay.data("set"));

    var IMSI = $$(page.container).find('[name="IMSI"]').val();
    var LastDay = $$(page.container).find('[name="LastDay"]').val();

    if (IMSI && LastDay) {
        requestCommandHistory({IMSI: IMSI, LastDay: LastDay});
    }

    $$('.getNewHystory').on('click', function(){
        
    });

    selectLastDay.on('change', function(){
        requestCommandHistory({IMSI: IMSI, LastDay: this.value});
    });
});



App.onPageInit('asset.commands', function(page){
    

    var commandListLi = $$(page.container).find('.commandList .item-content');

    $$(commandListLi).on('click', function () {
    	var type = $$(this).data('commandtype');

    	var buttonsPos = [			        
			{
			    text: LANGUAGE.ASSET_COMMANDS_MSG06,  
			    onClick: function () {
			        requestPositionProtect();
			    },          
			},
			{
			    text: LANGUAGE.ASSET_COMMANDS_MSG07,
			    onClick: function () {
			        requestPositionLive();
			    },  
			},
			{
		        text: LANGUAGE.COM_MSG04,
		        color: 'red',
		        onClick: function () {
		            //App.alert('Cancel clicked');
		        }
		    },
		];
		
		var msg = '';

    	switch(type){
    		case '1':    			
    			requestStatus();
    			break;

    		case '2':    			
			    App.actions(buttonsPos);
    			break;

    		case '3':    			
			    //App.actions(buttonsVer);
                requestVerify();
    			break;

    		case '4':    
    			msg = LANGUAGE.PROMPT_MSG020 +' '+ LANGUAGE.ASSET_COMMANDS_MSG08 + '?';
    			App.confirm(msg, TargetAsset.Name, function () {        
                    requestImmobilise();
                });	
    			break;

    		case '5':   
    			msg = LANGUAGE.PROMPT_MSG020 +' '+ LANGUAGE.ASSET_COMMANDS_MSG09 + '?';
    			App.confirm(msg, TargetAsset.Name, function () {        
                    requestUnimmobilise();
                });	 
    			break;


    		default:

    	}

        /*App.addNotification({
            hold: 3000,
            message: LANGUAGE.COM_MSG03
        });*/
    });

    $$('.getCommandHistory').on('click', function(){
    	
    	loadCommandHistoryPage({
            IMSI: TargetAsset.IMSI,
            LastDay: 2,
        });
    });

});



App.onPageInit('asset.settings', function(page){
    var sendSetting = $$(page.container).find('.sendSetting');
    //var showBlockControll = $$(page.container).find('.showBlockControll');

    var fitmentOptSelect = $$(page.container).find('[name="FitmentOpt"]');
    var fitmentOptSelectSet = fitmentOptSelect.data("set");
    var fitmentOptCustomWrapper = $$(page.container).find('.fitment_opt_custom_wrapper');
    var fitmentOptSelectedArr = [];

    /*var paymentType = $$(page.container).find('[name="PaymentType"]');
    var tabs = $$(page.container).find('.tab');

    var expDate = $$(page.container).find('.exp_date');
    var cardType = $$(page.container).find('.card_type');
    var cardNumber = $$(page.container).find('.card_number');
    var cardHolder = $$(page.container).find('.card_holder');*/

    
    var selectUnitSpeed = $$('select[name="Unit"]');   
    selectUnitSpeed.val(selectUnitSpeed.data("set"));


    if (fitmentOptSelectSet) {
        if (fitmentOptSelectSet.substr(-1) == ',') {
            fitmentOptSelectSet = fitmentOptSelectSet.slice(0, -1);
        } 
        $.each(fitmentOptSelectSet.split(","), function(i,e){            
            fitmentOptSelect.find('option[value="' + e + '"]').prop("selected", true);
        });
    }
    

    /*paymentType.on('change', function(){        
        var value = this.value;    
        App.showTab('#tab'+value);
    });

    tabs.on('tab:show', function () {        
        var id = this.id;
        id = id.substring(3);        
        paymentType.val(id);
    });   

    

    $(cardNumber).mask("9999 9999 9999 9999"); 
    cardType.on('change', function(){        
        var val = this.value;
        if (val == '3') {
            $(cardNumber).mask("9999 9999 9999 999");
        }else{
            $(cardNumber).mask("9999 9999 9999 9999");
        }
    });
    $(expDate).mask("99/99");
    


    $$('.add_photo').on('click', function (e) {        
        App.actions(cameraButtons);        
    });*/ 

    fitmentOptSelect.on('change', function(){
        fitmentOptSelectedArr = [];        

        $$(this).find('option:checked').each(function(){
            fitmentOptSelectedArr.push(this.value);           
        });
        
        if (fitmentOptSelectedArr.indexOf('D') == -1) {
            fitmentOptCustomWrapper.hide();
        }else{
            fitmentOptCustomWrapper.css('display','flex');
        }        
    });

    if (fitmentOptSelectSet && fitmentOptSelectSet.indexOf('D') != -1) {
        fitmentOptCustomWrapper.css('display','flex');
    }else{
        fitmentOptCustomWrapper.hide();
    }
        
    $$(sendSetting).on('click', function(){       

        var data = {
            "Code": getUserinfo().code,
            "Id": TargetAsset.Id,
            "Name": $$(page.container).find('input[name="AssetName"]').val(),
            "SpeedUnit": $$(page.container).find('select[name="Unit"]').val(),
            "InitMileage": $$(page.container).find('input[name="Odometer"]').val(),
            //"InitAccHours": "",
            "TagName": $$(page.container).find('input[name="LicensePlate"]').val(),
            "Attr1": $$(page.container).find('input[name="Describe1"]').val(),
            "Attr2": $$(page.container).find('input[name="Describe2"]').val(),
            "Attr3": $$(page.container).find('input[name="Describe3"]').val(),
            "Attr4": $$(page.container).find('input[name="Describe4"]').val(),
            "Attr7": $$(page.container).find('input[name="Describe7"]').val(),
            "InstallPosition": $$(page.container).find('input[name="InstallPosition"]').val(),
            "RemoteImmobilise": fitmentOptSelectedArr.toString(),
        };
        if (fitmentOptSelectedArr.indexOf('D') != -1) {
            data.Attr6 = $$(page.container).find('input[name="FitmentOptCustom"]').val();
        }
        console.log(data);
        App.showPreloader();
        JSON.requestPost(API_URL.URL_EDIT_DEVICE,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                                      
                    mainView.router.back(); 
                        
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        );           
    });
});

App.onPageInit('client.details', function (page) { 
    var sendSetting = $$('body').find('.sendClientDetails');

    $$(sendSetting).on('click', function(){ 
        var data ={
            'IMEI': $$(page.container).find('[name="IMEI"]').val(),
            'MinorToken': getUserinfo().userCode,
            'TaskID': $$(page.container).find('[name="TaskID"]').val(),
            'LoginName': $$(page.container).find('[name="LoginName"]').val(),
            'FirstName': $$(page.container).find('[name="FirstName"]').val(),
            'LastName': $$(page.container).find('[name="LastName"]').val(),
            'PhoneNumber': $$(page.container).find('[name="PhoneNumber"]').val(),
            'AddressOfJob': $$(page.container).find('[name="AddressOfJob"]').val(),
            'JobDetail': $$(page.container).find('[name="JobDetail"]').val(),
            'ContactCode': $$(page.container).find('[name="ContactCode"]').val(),
            'Notes': $$(page.container).find('[name="Notes"]').val(),
        };

        
        JSON.requestPost(API_URL.URL_SENT_NOTIFY,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                    
                    loadPageVerification(result.Data);                    
                    
                }else if(result.MajorCode == '100'){
                    var msg = LANGUAGE.ASSET_VIRIFICATION_MSG12;  
                    if (result.Data) {
                        switch (result.Data) {
                            case 'OFFLINE':
                                msg = LANGUAGE.ASSET_VIRIFICATION_MSG13;  
                                break;

                            case 'SMS_NONE':
                                msg = LANGUAGE.ASSET_VIRIFICATION_MSG14; 
                                break;

                            case 'SMS_STATUS':
                                msg = LANGUAGE.ASSET_VIRIFICATION_MSG15; 
                                break;

                            case 'SMS_LOCATION':
                                msg = LANGUAGE.ASSET_VIRIFICATION_MSG16; 
                                break;
                        }

                    }
                    App.alert(msg, LANGUAGE.PROMPT_MSG022);       
                    
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        );       
    });

});
App.onPageInit('asset.position', function(page){
    showMap(); 
    var notificationMenu = [                  
        {
            text: LANGUAGE.COM_MSG31,  
            onClick: function () {
                changeAssetNotificationState(false,{'CurrState':true});
            },          
        },        
        {
            text: LANGUAGE.COM_MSG04,
            color: 'red',
            onClick: function () {
                //App.alert('Cancel clicked');
            }
        },
    ];
    $$('.notificationMenu').on('click',function(){
        App.actions(notificationMenu);
    });
    
});
App.onPageInit('asset.status', function(page){
    var notificationMenu = [                  
        {
            text: LANGUAGE.COM_MSG31,  
            onClick: function () {
                changeAssetNotificationState(false,{'CurrState':true});
            },          
        },        
        {
            text: LANGUAGE.COM_MSG04,
            color: 'red',
            onClick: function () {
                //App.alert('Cancel clicked');
            }
        },
    ];
    $$('.notificationMenu').on('click',function(){
        App.actions(notificationMenu);
    });
});

App.onPageInit('asset.verification', function(page){
	var container =  $$(page.container).find('.page-content');
    $$(container).on('click', '.verifyAgain', function() {

		checkVerificationStatus();
	});
});


App.onPageInit('edit.photo', function (page) { 
    //page.context.imgSrc = 'resources/images/add_photo_general.png';

    initCropper();
    //alert(cropper);
    
    //After the selection or shooting is complete, jump out of the crop page and pass the image path to this page
    //image.src = plus.webview.currentWebview().imgSrc;
    //image.src = "img/head-default.jpg";    

    $$('.savePhoto').on('click', function(){
        saveImg();
    });
    $$('#redo').on('click', function(){
        cropper.rotate(90);
    });
    $$('#undo').on('click', function(){
        cropper.rotate(-90);
    });
});

function clearUserInfo(){
    
    var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
    //var appId = !localStorage.PUSH_APPID_ID? '' : localStorage.PUSH_APPID_ID;
    //var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '' : localStorage.PUSH_DEVICE_TOKEN;
    var userName = !localStorage.ACCOUNT? '' : localStorage.ACCOUNT;
    //var userInfo = getUserinfo();
    //var MinorToken = userInfo.MinorToken;      
    //var MajorToken = userInfo.MajorToken;
    var pushList = getNotificationList();

    //window.PosMarker = {};
    TargetAsset = {};    

    $$('.searchClear').click();

    $$('.remaining_counter').html('---');


    if ($$('.page_index .page-content').hasClass('first_login')) {

    }else{
    	$$('.page_index .page-content').addClass('first_login');
    }

    if (virtualAssetList) {
    	virtualAssetList.deleteAllItems();
    }
    
    localStorage.clear(); 
    if ($hub) {
        $hub.stop();  
    }  
    
    
    if (pushList) {
        localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST.INSTALLER", JSON.stringify(pushList));
    }
    
    if(mobileToken){      
        //JSON.request(API_URL.URL_GET_LOGOUT.format(MajorToken, MinorToken, userName, mobileToken), function(result){ console.log(result); });   
        var data = {
        	"MobileToken": mobileToken,
        };
        JSON.requestPost(API_URL.URL_GET_LOGOUT, data,function(result){
              console.log(result);
        });
    }   
    $$("input[name='account']").val(userName);    

}



function logout(){  
    clearUserInfo();
    App.loginScreen();   
}

function login(){    

    getPlusInfo();
    hideKeyboard();

    /*if (clientIdCycle == 1){
    	App.showPreloader(); 
    }    
    if (!localStorage.PUSH_DEVICE_TOKEN) {
        if (clientIdCycle < maxClientIdCycle) {
            setTimeout(function(){
                clientIdCycle = clientIdCycle + 1;
                login();                
            },500);            
        }else{
            var uid = guid();
            localStorage.PUSH_DEVICE_TOKEN = uid;
            login();
        }                     
    }else{*/
    	App.showPreloader(); 
    	var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '123' : localStorage.PUSH_MOBILE_TOKEN;
	    var appKey = !localStorage.PUSH_APP_KEY? '5741760618261' : localStorage.PUSH_APP_KEY;
	    var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '123' : localStorage.PUSH_DEVICE_TOKEN;
	    var deviceType = !localStorage.DEVICE_TYPE? 'web' : localStorage.DEVICE_TYPE;
	    var account = $$("input[name='account']");
	    var password = $$("input[name='password']"); 
	    
	    var data = {
	        "LoginName":!account.val()? localStorage.ACCOUNT: account.val(),
	        "Password":encodeURIComponent(!password.val()? localStorage.PASSWORD: password.val()),
	        "AppKey": appKey,
	        "MobileToken": mobileToken,
	        "DeviceToken": encodeURIComponent(deviceToken),
	        "DeviceType": deviceType,
	    };
	    
	    JSON.requestPost(API_URL.URL_GET_LOGIN, data,function(result){
	            console.log(result);
	            if(result.MajorCode == '000') {
	                if(!!account.val()) {
	                    localStorage.ACCOUNT = account.val();
	                    localStorage.PASSWORD = password.val();
	                }
	                account.val(null);
	                password.val(null);
	                setUserinfo(result.Data);
	                updateUserData(result.Data);
	                updateUserCrefits(result.Data.credit);
	                notificationChecked = 1;
                    //loginDone = 1;
	               
	                webSockConnect();  
	                     
	                App.closeModal();                
	            }else{                
	                App.alert(LANGUAGE.LOGIN_MSG01);
	            }
	            App.hidePreloader();
	        },
	        function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
	    );     
    //}
	    
   
}


function hideKeyboard() {
    document.activeElement.blur();
    $$("input").blur();
}

function getCreditBalance(vsMsg){ 
    var userInfo = getUserinfo(); 
    console.log(userInfo);
    var data = {
        "MinorToken": userInfo.userCode            
    };
    if (vsMsg) {
        App.showPreloader();
    }
    JSON.requestPost(API_URL.URL_GET_CREDIT,data,function(result){
            console.log(result);
            if(result.MajorCode == '000') { 
                updateUserCrefits(result.Data.Credit);
                userInfo.credit = result.Data.Credit;  
                setUserinfo(userInfo);                
            } 
            if (vsMsg) {
                App.alert(LANGUAGE.COM_MSG21+': '+result.Data.Credit);
                App.hidePreloader(); 
            }
                   
        },
        function(){ App.hidePreloader();}
    );     
}
function updateUserCrefits(credits){
    credits = parseInt(credits);
    $$('body .remaining_counter').html(credits);
      
}

function updateUserData(data) {
    $$('.user_name').html(data.firstName+' '+data.lastName);    
    $$('.user_f_l').html(data.firstName[0]+data.lastName[0]);
    $$('.user_email').html(data.customerName);
}

function showAssetList(assetList) {
    //var assetList = getAssetList();   
    
    var newAssetlist = [];
    var keys = Object.keys(assetList);
    
    $.each(keys, function( index, value ) {        
        newAssetlist.push(assetList[value]);       
    });

    newAssetlist.sort(function(a,b){
        if(a.Name < b.Name) return -1;
        if(a.Name > b.Name) return 1;
        return 0;
    });
  
    virtualAssetList.replaceAllItems(newAssetlist);
    
}

function loadRechargeCreditPage(){
   
    var MinorToken = getUserinfo().userCode;
    //var CountryCode = getUserinfo().UserInfo.CountryCode;

    /*AUS*/
    /*var buttons = {
        'button100' : 'MAA5PL592FVTY',
        'button500' : 'U6NVCJVTPUTV2',
        'button1000' : 'HCVHBFK7R5PN4',
        'currency' : 'AUD' 
    };*/

    var buttons = {
        'button100' : 'CZ3NVD89LSBBW',
        'button500' : 'EKWPMLLMKUTV8',
        'button1000' : '9R2RY5C5GDFY8',
        'currency' : 'USD' 
    };
 

    /*var button100  = 'MAA5PL592FVTY';
    var button500  = 'U6NVCJVTPUTV2';
    var button1000 = 'HCVHBFK7R5PN4';
    var buttonCur = 'AUD';   */

    /*switch (CountryCode){
        case 'USA':
            button10  = 'XTKUPGEYWZ3T4';
            button50  = 'KWC3YWFGZTW28';
            button100 = 'QTULPNEWWN6CN';
            buttonCur = 'USD';
            break;
        case 'CAN':
            button10  = 'FSMSLCFUPE954';
            button50  = 'GFBCR2TX9XEJL';
            button100 = 'MFCNEYY4R5WHG';
            buttonCur = 'CAD';
            break;
    }*/

    mainView.router.load({
        url: 'resources/templates/user.recharge.credit.html',
        context:{
            userCode: MinorToken,
            dealerNumber: 21,    // 2 - means GPS Secure Agent
            other: 'GPS-Secure-Agent-app',
            button100: buttons.button100,
            button500: buttons.button500,
            button1000: buttons.button1000,
            buttonCur: buttons.currency
        },

    });           
}

function loadProfilePage(){
    var userInfo = getUserinfo();  
    var UserImgSrc = getUserImg();
    mainView.router.load({
        url:'resources/templates/user.profile.html',
        context:{
            UserImgSrc: UserImgSrc,
            FirstName: userInfo.firstName,
            LastName: userInfo.lastName,
            Mobile: userInfo.mobile,
            Phone: userInfo.phone,            
            Email: userInfo.email,           
        }
    });
}

function loadResetPwdPage(){
    mainView.router.load({
        url:'resources/templates/user.password.html',
        context:{
                     
        }
    });
}

function toIndex() {
    mainView.router.back({              
        pageName: 'index', 
        force: true
    }); 
}

function submitSearchForm() {
    var input = $$('.formSearchDevice input[name="searchInput"');
   
    if (input.val()) {
       
        input.blur();

        var searchby = input.data('searchby');
        
        var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
        var appKey = !localStorage.PUSH_APP_KEY? '5741760618261' : localStorage.PUSH_APP_KEY;    
        var deviceType = !localStorage.DEVICE_TYPE? 'web':localStorage.DEVICE_TYPE;
        var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '123' : localStorage.PUSH_DEVICE_TOKEN;

        var data = {
            "CustomerToken": getUserinfo().code,
            "MobileToken": mobileToken,
            "AppKey": appKey,
            "Token": deviceToken,        
            "Type": deviceType,        
        };
        data[searchby] = input.val().trim();

    

        App.showPreloader();
        JSON.requestPost(API_URL.URL_GET_ASSET_LIST,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                    $$('.page-content').removeClass('first_login');                   
                    showAssetList(result.Data);
                    if (result.Data.length === 0) {
                        App.addNotification({
                            hold: 3000,
                            message: LANGUAGE.PROMPT_MSG006
                        });
                    }
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        );     

    }else{
        App.addNotification({
            hold: 3000,
            message: LANGUAGE.PROMPT_MSG008
        });
    }
}

function getUserImg(){
    //var userInfo = getUserinfo();
    var src = 'resources/images/other_add_photo.svg';

    return src;
}

function loadPageCommands(){

    //API_URL.URL_GET_COMMAND_LIST
    var data = {
        "IMEI": TargetAsset.IMEI,
    };

   

    mainView.router.load({
        url:'resources/templates/asset.commands.html',
        context:{
            IMEI: TargetAsset.IMEI,
            IMSI: TargetAsset.IMSI,
            Name: TargetAsset.Name,
            Type: TargetAsset.Type,
        }
    });     
}

function loadPageUpgrade(){
    
    var dealerToken = getUserinfo().code;
    var href = API_URL.URL_REPLACE_IMEI.format(dealerToken,TargetAsset.IMEI); 
    
    if (window.plus) {
        plus.runtime.openURL(href);            
    } else {
        window.open(href,'_blank');
    }
}

function loadPageSettings(){
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth()+1;
    month = month < 10 ? '0' + month : month;
    var day = today.getDate();    
    
    var todayStr = year+'-'+month+'-'+day;    

    var data = {
        "Code": getUserinfo().code,
        "Id": TargetAsset.Id,
    };

    App.showPreloader();
    JSON.requestPost(API_URL.URL_GET_DEVICE_DETAIL,data,function(result){
            console.log(result);
            if(result.MajorCode == '000') { 
                var asset = getAssetParametersName(result.Data);
                console.log(asset);
                

                mainView.router.load({
                    url:'resources/templates/asset.settings.html',
                    context:{
                        IMEI: '<span>'+LANGUAGE.HOME_MSG00+'</span>: '+TargetAsset.IMEI,
                        IMSI: '<span>'+LANGUAGE.HOME_MSG01+'</span>: '+TargetAsset.IMSI,
                        Type: '<span>'+LANGUAGE.HOME_MSG06+'</span>: '+TargetAsset.Type,
                        Provider: '<span>'+LANGUAGE.ASSET_SETTINGS_MSG06+'</span>: '+getUserinfo().customerName,
                        AssetName: TargetAsset.Name,
                        Date: todayStr,
                        Describe7: asset.Describe7,
                        LicensePlate: asset.TagName,
                        Describe1: asset.Describe1,
                        Describe2: asset.Describe2,
                        Describe3: asset.Describe3,
                        Describe4: asset.Describe4,
                        Odometer: asset.InitMilage,
                        Unit: asset.Unit,
                        InstallPosition: asset.InstallPosition,
                        FitmentOpt: asset.FitmentOpt,
                        FitmentOptCustom: asset.Describe6
                    }
                });                     
            }else{                
                App.alert(LANGUAGE.PROMPT_MSG013);
            }
            App.hidePreloader();
        },
        function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
    );      
}


function loadPageVerification(data){
    if (data){
        if (data.Date) {            
            var localTime = moment.utc(data.Date).toDate();
            if (localTime == 'Invalid Date') {
                var converted = moment(data.Date,'DD/MM/YYYY HH:mm:ss');
                localTime = moment.utc(converted).toDate();
            }            
            data.Date = moment(localTime).format(window.COM_TIMEFORMAT);
        }
    	mainView.router.load({
            url:'resources/templates/asset.verification.html',
            context:{
                IMEI: data.IMEI,
                IMSI: data.IMSI,            
                TaskID: data.TaskID,
                Product: data.Product,   
                Service: data.Service,
                Name: data.Name,
                Account: data.Account, 
                Date: data.Date,
                LoginName: data.LoginName,
				FirstName: data.FirstName,
				LastName: data.LastName,
				PhoneNumber: data.PhoneNumber,
            }
        }); 
        showVerificationStatus();     
    } 

    
}




function loadPagePosition(data){    
    var deirectionCardinal = '';
    if (data.type) {
        data.alarm = data.type;
    }   
    if (data.lat) {
        data.Lat = data.lat;
    }   
    if (data.lng) {
        data.Lng = data.lng;
    }   
    if (data.speed) {
        data.Speed = data.speed;
    }   
    if (data.Speed) {
        data.Speed = parseInt(data.Speed);
    }
    if (data.direct) {
        data.Direction = data.direct;
    }   
    if (data.Direction) {
        data.Direction = parseInt(data.Direction);
        deirectionCardinal = Protocol.Helper.getDirectionCardinal(data.Direction);
        data.Direction = deirectionCardinal+' ('+data.Direction+'&deg;)';
    }
    if (data.imei) {
        data.Imei = data.imei;
    }   
    if (data.name) {
        data.AssetName = data.name;
    } 
    if (data.time) {
        data.PositionTime = data.time;
    }
    if (data.title) {
        data.PageTitle = data.title;
    }else if(data.alarm && typeof data.alarm == 'string'){
        data.PageTitle = data.alarm;
    }else{
        data.PageTitle = LANGUAGE.ASSET_POSITION_MSG00;
    }
    data.PageTitle = toTitleCase(data.PageTitle);
    

    var lat = data.Lat;
    var lng = data.Lng;  

    
    window.PosMarker[data.Imei] = L.marker([lat, lng], {icon: Protocol.MarkerIcon[0]}); 
    window.PosMarker[data.Imei].setLatLng([lat, lng]);    

    TargetAsset.Lat = lat;
    TargetAsset.Lng = lng;
    TargetAsset.IMEI = data.Imei;
    TargetAsset.Name = data.AssetName;
    TargetAsset.IMSI = data.Imsi;
    
    checkMapExisting();        
    mainView.router.load({
        url:'resources/templates/asset.position.html',
        context: data,
        
    });  

    addressFromLatLng({lat:lat,lng:lng});   
}



function checkMapExisting(){
    if ($$('#map')) {
        $$('#map').remove();
        MapTrack = null;
    }   
}


function loadPageStatus(data){
    console.log(data);
    
    var timeCheck = data.CreateDateTime.indexOf('T');
    if (timeCheck != -1) {
        data.CreateDateTime = moment.utc(data.CreateDateTime).toDate();
        data.CreateDateTime = moment(data.CreateDateTime).format(window.COM_TIMEFORMAT);
    }
    TargetAsset.IMEI = data.Imei;
    mainView.router.load({
        url:'resources/templates/asset.status.html',
        context: data,
        
    });     
}

function loadPageClientDetails(data){
    if (data){
        if (data.Date) {            
            var localTime = moment.utc(data.Date).toDate();
            if (localTime == 'Invalid Date') {
                var converted = moment(data.Date,'DD/MM/YYYY HH:mm:ss');
                localTime = moment.utc(converted).toDate();
            }            
            data.Date = moment(localTime).format(window.COM_TIMEFORMAT);
        }

        mainView.router.load({
            url:'resources/templates/client.details.html',
            context:{
                IMEI: data.IMEI,
                IMSI: data.IMSI,            
                TaskID: data.TaskID,
                Product: data.Product,   
                Service: data.Service,                
                Name: data.Name,
                Account: data.Account,
                LoginName: data.LoginName,
                Date: data.Date, 
                
                FirstName: data.FirstName,   
                LastName: data.LastName,   
                PhoneNumber: data.PhoneNumber, 
                ContactCode: data.ContactCode,       
            }
        });  

        
    }
        
}   

function loadCommandHistoryPage(params){
    mainView.router.load({
        url:'resources/templates/asset.commands.history.html',
        context:{
            LastDay: params && params.LastDay ? params.LastDay : 2,
            IMSI: params && params.IMSI ? params.IMSI : TargetAsset.IMSI,
        }
    }); 
}

function loadSimInfo(){
    var data = {
        MajorToken: getUserinfo().code,
        DeviceId: TargetAsset.IMSI,
    };
    App.showPreloader();
    JSON.requestPost(API_URL.URL_GET_SIM_INFO,data,function(result){
            console.log(result);
            if(result.MajorCode == '000') { 
                getAdditionalSimInfo(result.Data);                              
            }else{                
                App.alert(LANGUAGE.PROMPT_MSG013);
                App.hidePreloader();
            }
           
        },
        function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
    );  
}

function getAdditionalSimInfo(params){
    var data = {
        MajorToken: getUserinfo().code,
        DeviceId: TargetAsset.IMSI,
        Rows: 10,
    };
    /*App.showPreloader();*/
    JSON.requestPost(API_URL.URL_GET_SIM_LIST,data,function(result){
            console.log(result);
            if(result.MajorCode == '000') { 
                loadSimInfoPage(Object.assign(params, result.Data[0]));                              
            }else{                
                //App.alert(LANGUAGE.PROMPT_MSG013);
                loadSimInfoPage(params);
            }
            App.hidePreloader();
        },
        function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
    );
}

function loadSimInfoPage(params){
    /*params.Imei = TargetAsset.IMEI;*/
    mainView.router.load({
        url:'resources/templates/asset.sim.info.html',
        context: params
    });       
}

function showVerificationStatus(){
	setTimeout(function() {		
        /*NOT VERIFIED*/	
		/*var result = 	'<div class="result result2">' +
				            '<div class="content-block content_block_notes">' +
				                '<span class="color-danger">' + LANGUAGE.ASSET_VIRIFICATION_MSG06 +'</span><br>' +
				                LANGUAGE.PROMPT_MSG021 +
				            '</div>' +			            
				            '<div class="content-block">' +
				                '<a href="#" class="button button-big button-fill color-green verifyAgain">' + LANGUAGE.ASSET_VIRIFICATION_MSG11 + '</a>' +
				            '</div>' +
				        '</div>';*/

        /*VERIFIED*/
        var result =    '<div class="result result1">' +
                            '<div class="content-block text-a-c">' +
                                '<img class="verify_img" src="resources/images/verified.svg" alt="">' +
                                '<div class="verify_text verified">' + LANGUAGE.ASSET_VIRIFICATION_MSG05 + '</div>' +
                            '</div>' +
                        '</div>';
		
		if ($$('.result').length !== 0) {
			$$('.result').remove();			
		}	

		App.showPreloader();
		setTimeout(function() {	
			$$(result).insertAfter('.verificationList');
			App.hidePreloader();
		}, 1000);
	}, 500);
}

function showMap(){    
    var latlng = [TargetAsset.Lat, TargetAsset.Lng];
    MapTrack = Protocol.Helper.createMap({ target: 'map', latLng: latlng, zoom: 15 });        
    window.PosMarker[TargetAsset.IMEI].addTo(MapTrack);   
}

function addressFromLatLng(latlng) {    
    /*var latlng = {};
    latlng.lat = asset.posInfo.lat;
    latlng.lng = asset.posInfo.lng; */    
    if (latlng) {
        Protocol.Helper.getAddressByGeocoder(latlng,function(address){
            $$('body').find('.address').html(address);
        });
    }
        
}




function requestStatus(){
	if (TargetAsset.IMEI) {
        var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
        var appKey = !localStorage.PUSH_APP_KEY? '5741760618261' : localStorage.PUSH_APP_KEY;
        var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '123' : localStorage.PUSH_DEVICE_TOKEN;
        var deviceType = !localStorage.DEVICE_TYPE? 'web':localStorage.DEVICE_TYPE;

		var data = {
            'IMEI': TargetAsset.IMEI,   
            'MinorToken': getUserinfo().userCode,
            "MobileToken": mobileToken,
            "AppKey": appKey,
            "Token": deviceToken,        
            "Type": deviceType,  
        };        
        
        App.showPreloader();
        JSON.requestPost(API_URL.URL_GET_STATUS,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                    turnNotificationOn();
                    App.addNotification({
                        hold: 3000,
                        message: LANGUAGE.COM_MSG03
                    });      
                    getCreditBalance();              
                }else if(result.MinorCode == '1006'){
                    App.confirm(LANGUAGE.PROMPT_MSG011, function () {     // "PROMPT_MSG011":"The balance is insufficient, please renew it", 
                        loadRechargeCreditPage();    
                    });          
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        ); 
	}
}

function requestPositionProtect(){
	if (TargetAsset.IMEI) {
		var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
        var appKey = !localStorage.PUSH_APP_KEY? '5741760618261' : localStorage.PUSH_APP_KEY;
        var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '123' : localStorage.PUSH_DEVICE_TOKEN;
        var deviceType = !localStorage.DEVICE_TYPE? 'web':localStorage.DEVICE_TYPE;

        var data = {
            'IMEI': TargetAsset.IMEI,   
            'MinorToken': getUserinfo().userCode,
            "MobileToken": mobileToken,
            "AppKey": appKey,
            "Token": deviceToken,        
            "Type": deviceType,  
        };              
        
        App.showPreloader();
        JSON.requestPost(API_URL.URL_GET_PROTECT_POSITION,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                    turnNotificationOn();
                    App.addNotification({
                        hold: 3000,
                        message: LANGUAGE.COM_MSG03
                    });
                    getCreditBalance();
                }else if(result.MinorCode == '1006'){
                    App.confirm(LANGUAGE.PROMPT_MSG011, function () {     // "PROMPT_MSG011":"The balance is insufficient, please renew", 
                        loadRechargeCreditPage();    
                    });          
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        );    
       
	}
}

function requestPositionLive(){
	if (TargetAsset.IMEI) {
		var data = {
            'IMEI': TargetAsset.IMEI, 
            'MinorToken': getUserinfo().userCode,               
        };        
        
        App.showPreloader();
        JSON.requestPost(API_URL.URL_GET_LIVE_POSITION,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                    var props = result.Data;
                    props.Imei = TargetAsset.IMEI;
                    props.Imsi = TargetAsset.IMSI;
                    props.AssetName = TargetAsset.Name;

                    props.Direction = props.Direct;

                    var localTime  = moment.utc(props.DateTime).toDate();
                    props.PositionTime = moment(localTime).format(window.COM_TIMEFORMAT);
                    props.Live = 1;
                    
                    loadPagePosition(props);
                    //App.alert(LANGUAGE.COM_MSG03);
                    //turnNotificationOn();
                    //App.addNotification({
                    //    hold: 3000,
                    //    message: LANGUAGE.COM_MSG03
                    //});
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        );     
	}
}



function requestVerify(){
    if (TargetAsset.IMEI) {
        var data = {
            'IMEI': TargetAsset.IMEI,
            'MinorToken': getUserinfo().userCode,                  
        };        
        
        App.showPreloader();
        JSON.requestPost(API_URL.URL_GET_VERIFY2,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                    
                    loadPageClientDetails(result.Data);                    
                    
                }else if(result.MajorCode == '100'){
                    var msg = LANGUAGE.ASSET_VIRIFICATION_MSG12;  
                    if (result.Data) {
                        switch (result.Data) {
                            case 'OFFLINE':
                                msg = LANGUAGE.ASSET_VIRIFICATION_MSG13;  
                                break;

                            case 'SMS_NONE':
                                msg = LANGUAGE.ASSET_VIRIFICATION_MSG14; 
                                break;

                            case 'SMS_STATUS':
                                msg = LANGUAGE.ASSET_VIRIFICATION_MSG15; 
                                break;

                            case 'SMS_LOCATION':
                                msg = LANGUAGE.ASSET_VIRIFICATION_MSG16; 
                                break;
                        }

                    }
                    App.alert(msg, LANGUAGE.ASSET_VIRIFICATION_MSG06);       
                    
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        );     
    }
}

function requestImmobilise(){
	if (TargetAsset.IMEI) {
		var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
        var appKey = !localStorage.PUSH_APP_KEY? '5741760618261' : localStorage.PUSH_APP_KEY;
        var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '123' : localStorage.PUSH_DEVICE_TOKEN;
        var deviceType = !localStorage.DEVICE_TYPE? 'web':localStorage.DEVICE_TYPE;

        var data = {
            'IMEI': TargetAsset.IMEI,   
            'MinorToken': getUserinfo().userCode,
            "MobileToken": mobileToken,
            "AppKey": appKey,
            "Token": deviceToken,        
            "Type": deviceType,  
        };             
        
        App.showPreloader();
        JSON.requestPost(API_URL.URL_SET_IMMOBILISE,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                    turnNotificationOn();
                    App.addNotification({
                        hold: 3000,
                        message: LANGUAGE.COM_MSG03
                    });
                    getCreditBalance();
                }else if(result.MinorCode == '1006'){
                    App.confirm(LANGUAGE.PROMPT_MSG011, function () {     // "PROMPT_MSG011":"The balance is insufficient, please renew", 
                        loadRechargeCreditPage();    
                    });          
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        );    
       
	}
}

function requestUnimmobilise(){
	if (TargetAsset.IMEI) {
		var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
        var appKey = !localStorage.PUSH_APP_KEY? '5741760618261' : localStorage.PUSH_APP_KEY;
        var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '123' : localStorage.PUSH_DEVICE_TOKEN;
        var deviceType = !localStorage.DEVICE_TYPE? 'web':localStorage.DEVICE_TYPE;

        var data = {
            'IMEI': TargetAsset.IMEI,   
            'MinorToken': getUserinfo().userCode,
            "MobileToken": mobileToken,
            "AppKey": appKey,
            "Token": deviceToken,        
            "Type": deviceType,  
        };               
        
        App.showPreloader();
        JSON.requestPost(API_URL.URL_SET_UNIMMOBILISE,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                    turnNotificationOn();
                    App.addNotification({
                        hold: 3000,
                        message: LANGUAGE.COM_MSG03
                    });
                    getCreditBalance();
                }else if(result.MinorCode == '1006'){
                    App.confirm(LANGUAGE.PROMPT_MSG011, function () {     // "PROMPT_MSG011":"The balance is insufficient, please renew", 
                        loadRechargeCreditPage();    
                    });          
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hidePreloader();
            },
            function(){ App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); }
        );    
       
	}
}

function requestCommandHistory(params){
    if (params && params.IMSI && params.LastDay) {
        var data = {
            IMSI: params.IMSI,   
            LastDay: params.LastDay,
        };   
        console.log(data);
        
        var container = $$('body');
        if (container.children('.progressbar, .progressbar-infinite').length) return; //don't run all this if there is a current progressbar loading
        App.showProgressbar(container); 
        JSON.requestPost(API_URL.URL_GET_COMMAND_HISTORY,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') { 
                    if (result.Data && result.Data.length > 0 && virtualCommandsHistoryList) {                       
                        //if ( virtualCommandsHistoryList.items.length > 0) {
                            virtualCommandsHistoryList.replaceAllItems(result.Data);
                        /*}else{
                            virtualCommandsHistoryList.appendItems(result.Data);
                        }    */                    
                    }else{
                        App.addNotification({
                            hold: 3000,
                            message: LANGUAGE.ASSET_COMMANDS_HISTORY_MSG01
                        });
                        if (virtualCommandsHistoryList) {
                            virtualCommandsHistoryList.deleteAllItems();
                        }
                    }                    
                }else{                
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                App.hideProgressbar();
            },
            function(){ App.hideProgressbar(); App.alert(LANGUAGE.COM_MSG02); }
        );                
    }
}

function getNewNotifications(){         
    var userInfo = getUserinfo();    
    var MinorToken = !userInfo ? '': userInfo.userCode;
    var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '' : localStorage.PUSH_DEVICE_TOKEN;    
    
    if (MinorToken && deviceToken) {
        var container = $$('body');
        if (container.children('.progressbar, .progressbar-infinite').length) return; //don't run all this if there is a current progressbar loading
        App.showProgressbar(container); 

        var url = API_URL.URL_GET_NEW_NOTIFICATIONS.format(MinorToken,encodeURIComponent(deviceToken)); 
        notificationChecked = 0;

        JSON.request(url, function(result){
                App.hideProgressbar();            
                notificationChecked = 1;
                if(window.plus) {
                    plus.push.clear();
                }
                
                console.log(result);  

                if (result.MajorCode == '000') {
                    var data = result.Data;  
                    if (Array.isArray(data) && data.length > 0) {
                        setNotificationList(result.Data);

                        var page = mainView.activePage;      
                        if ( typeof(page) == 'undefined' || (page && page.name != "notification") ) {
                            $$('.notification_button').addClass('new_not');                    
                        }else{
                            showNotification(result.Data);
                        }
                    }                    
                }else{
                    console.log(result);
                }                
            },
            function(){
                App.hideProgressbar();
                notificationChecked = 1;            
            }
        ); 
    }        
}

function turnNotificationOn(){   
    $$('.assetList [data-imei="'+TargetAsset.IMEI+'"]').data('notifications',1);
    setAssetNotificationState({'IMEI':TargetAsset.IMEI,'State':1});
}

function changeAssetNotificationState(device,obj){
    var currentState = false;
    if (device) {
        currentState = device.data('notifications'); 
    }else{
        currentState = obj.CurrState;
    }
     
    var minorToken = getUserinfo().userCode;

    var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
    var appKey = !localStorage.PUSH_APP_KEY? '5741760618261' : localStorage.PUSH_APP_KEY;    
    var deviceType = !localStorage.DEVICE_TYPE? 'web':localStorage.DEVICE_TYPE;
    var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '123' : localStorage.PUSH_DEVICE_TOKEN;

    var data = {
        "IMEI": TargetAsset.IMEI,
        "MinorToken": minorToken, 
        "State": !currentState,  
        "MobileToken": mobileToken,
        "AppKey": appKey,
        "Token": deviceToken,        
        "Type": deviceType,  
    };     
        
        

    var message = '';
    if (currentState == 1) {         
        data.State = 0;
        message = LANGUAGE.PROMPT_MSG018 + ' IMEI: '+TargetAsset.IMEI;       
    }else{
        data.State = 1;
        message = LANGUAGE.PROMPT_MSG019 + ' IMEI: '+TargetAsset.IMEI;        
    }

    JSON.requestPost(API_URL.URL_CHANGE_NOTIFICATION_STATUS, data,function(result){
            console.log(result);
            if(result.MajorCode == '000') {     
                if (device) {
                    device.data('notifications',data.State);
                }                 
                setAssetNotificationState(data);
                App.addNotification({
                    hold: 3000,
                    message: message,
                });
                var assetListLi = $$('.assetList').find('li[data-imei="'+data.IMEI+'"]');               
                if (assetListLi) {
                    $$(assetListLi).data('notifications', data.State);
                }
            }else{                
                App.alert(LANGUAGE.PROMPT_MSG013);
            }               
        },
        function(){ App.alert(LANGUAGE.COM_MSG02); }
    ); 
}



function getAssetNotificationState(){
    var ret = {};var str = localStorage.getItem("COM.QUIKTRAK.LIVE.NOTIFICATION.STATES");if(str) {ret = JSON.parse(str);}return ret;
}

function setAssetNotificationState(data){
    var satesList = getAssetNotificationState();
    var user = localStorage.ACCOUNT;  

    if (!satesList) { 
        satesList = {};
    }

    satesList[data.IMEI] = data.State;

    localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATION.STATES", JSON.stringify(satesList));   
}

function getNotificationList(){
    var ret = {};var str = localStorage.getItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST.INSTALLER");if(str) {ret = JSON.parse(str);}return ret;
}

function setNotificationList(list){ 
    var pushList = getNotificationList();    
    var user = localStorage.ACCOUNT;   
          
    if (pushList) { 
        if (!pushList[user]) {
            pushList[user] = [];
        }
    }else{
        pushList = {};
        pushList[user] = [];
    }     
    //alert(JSON.stringify(list));
    if (Array.isArray(list)) {
        var msg = null;
        for (var i = 0; i < list.length; i++) {
            msg = null;
            if (list[i].payload) {
                msg = isJsonString(list[i].payload);            
                if (!msg) {                  
                    msg = list[i].payload;    
                }
            }else{
                msg = isJsonString(list[i]);            
                if (!msg) {                  
                    msg = list[i];    
                }
            }

            if (msg && msg.alarm || msg && msg.time) {
                var localTime = '';
                if (msg.alarm == "status") {
                    msg.StatusTime = moment().format(window.COM_TIMEFORMAT);                       
                }else if (msg.PositionTime) {
                    localTime = moment.utc(msg.PositionTime).toDate();
                    msg.PositionTime = moment(localTime).format(window.COM_TIMEFORMAT);                          
                }else if (msg.positionTime) {
                    localTime = moment.utc(msg.positionTime).toDate();
                    msg.positionTime = moment(localTime).format(window.COM_TIMEFORMAT);                        
                }else if(msg.time){
                    localTime = moment.utc(msg.time).toDate();
                    msg.time = moment(localTime).format(window.COM_TIMEFORMAT); 
                }else{
                    msg.time = moment().format(window.COM_TIMEFORMAT);   
                }

                if (msg.type) {
                    msg.alarm = msg.type;
                }   
                if (msg.lat) {
                    msg.Lat = msg.lat;
                }   
                if (msg.lng) {
                    msg.Lng = msg.lng;
                }   
                if (msg.speed) {
                    msg.Speed = msg.speed;
                }   
                if (msg.direct) {
                    msg.Direction = msg.direct;
                }   
                if (msg.imei) {
                    msg.Imei = msg.imei;
                }   
                if (msg.name) {
                    msg.AssetName = msg.name;
                } 
                if (msg.time) {
                    msg.PositionTime = msg.time;
                }   
                if (msg.CreateDateTime) {
                    localTime = moment.utc(msg.CreateDateTime).toDate();
                    msg.CreateDateTime = moment(localTime).format(window.COM_TIMEFORMAT);
                }                   
                list[i] = msg;      

                /*var popped = pushList[user].pop();
                if (popped) {
                    popped = JSON.stringify(popped);
                    msg = JSON.stringify(msg);
                    if (popped != msg) {
                        popped = JSON.parse(popped);
                        pushList[user].push(popped);
                    }
                }*/  
                //alert(JSON.stringify(list[i]));    
                pushList[user].push(list[i]);
            }                             
                                           
        }    
    }
    localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST.INSTALLER", JSON.stringify(pushList));
}

/*function processClickOnPushNotification(msgJ){
    if (Array.isArray(msgJ)) {
        var msg = null;
        if (msgJ[0].payload) {
            msg = isJsonString(msgJ[0].payload);
            if (!msg) {                  
                msg = msgJ[0].payload;     
            }
        }else{
            msg = isJsonString(msgJ[0]);
            if (!msg) {                  
                msg = msgJ[0];     
            }
        }        
        if (msg) {
            var activePage = mainView.activePage;    
            if ( typeof(activePage) == 'undefined' || (activePage && activePage.name != "notification")) { 
                $$('.notification_button').removeClass('new_not');                          
                mainView.router.loadPage('resources/templates/notification.html');       
            }else{
                mainView.router.refreshPage();
            }                
        }  
    }          
}*/
         

function processClickOnPushNotification(msgJ){    
    if (Array.isArray(msgJ)) {      
        var msg = null;
        msg = isJsonString(msgJ[0]);        

        if (!msg) {                  
            msg = msgJ[0];     
        }
        
        if (msg) {
            var localTime = '';
            if (typeof(msg.alarm) == 'string' && msg.alarm.toLowerCase() == "status") {
                msg.StatusTime = moment().format(window.COM_TIMEFORMAT);                       
            }else if (msg.PositionTime) {
                localTime = moment.utc(msg.PositionTime).toDate();
                msg.PositionTime = moment(localTime).format(window.COM_TIMEFORMAT);                          
            }else if (msg.positionTime) {
                localTime = moment.utc(msg.positionTime).toDate();
                msg.positionTime = moment(localTime).format(window.COM_TIMEFORMAT);                        
            }else if(msg.time){
                localTime = moment.utc(msg.time).toDate();
                msg.time = moment(localTime).format(window.COM_TIMEFORMAT); 
            }else{
                msg.time = moment().format(window.COM_TIMEFORMAT);   
            }

            if (msg.type) {
                msg.alarm = msg.type;
            }   
            if (msg.lat) {
                msg.Lat = msg.lat;
            }   
            if (msg.lng) {
                msg.Lng = msg.lng;
            }   
            if (msg.speed) {
                msg.Speed = msg.speed;
            }   
            if (msg.direct) {
                msg.Direction = msg.direct;
            }   
            if (msg.imei) {
                msg.Imei = msg.imei;
            }   
            if (msg.name) {
                msg.AssetName = msg.name;
            } 
            if (msg.time) {
                msg.PositionTime = msg.time;
            }   
            if (msg.CreateDateTime) {
                localTime = moment.utc(msg.CreateDateTime).toDate();
                msg.CreateDateTime = moment(localTime).format(window.COM_TIMEFORMAT);
            } 
            
            //var activePage = mainView.activePage;
            //if ( typeof(activePage) == 'undefined' || (activePage && activePage.name != "notification")) { 
                if(typeof(msg.alarm) == 'string' && msg.alarm.toLowerCase() == "status" ){
                    loadPageStatus(msg);                 
                }else if (parseFloat(msg.Lat) && parseFloat(msg.Lng)) { 
                    loadPagePosition(msg);
                }else{
                    App.alert(LANGUAGE.PROMPT_MSG023);
                }
            //}else{                
            //    mainView.router.refreshPage();
            //}  
        }
    }          
}

function showNotification(list){    
    var data = null;
    var isJson =''; 
    var newList = [];
    var index = parseInt($('.notificationList li').first().data('id'));
    if (list) {       
        for (var i = 0; i < list.length; i++) { 
            data = null;
            isJson =''; 
            if (list[i].payload) {
                isJson = isJsonString(list[i].payload);
                if (isJson) {
                    data = isJson;                
                }else{
                    data = list[i].payload;                
                } 
            }else{
                isJson = isJsonString(list[i]);
                if (isJson) {
                    data = isJson;                
                }else{
                    data = list[i];                
                } 
            } 
            if (data) {
                if (isNaN(index)) {                    
                    index = 0;
                }else{
                    index++;                    
                }                           
                data.listIndex = index; 
                 
                if (data.time) {
                    data.time = data.time.replace("T", " ");
                }                
                
                if (data.title) {
                    data.title = toTitleCase(data.title);
                }                 
                newList.unshift(data);                          
            }
        }
        if (virtualNotificationList && newList.length !== 0) {
            virtualNotificationList.prependItems(newList); 
        }   
    }       
}

function showMsgNotification(arrMsgJ){    
    var msg = null;
    if (arrMsgJ) {
        if (arrMsgJ[0].payload) {
            msg = isJsonString(arrMsgJ[0].payload);
            if (!msg) {       
                msg = arrMsgJ[0].payload;
            }
        }else{
            msg = isJsonString(arrMsgJ[0]);
            if (!msg) {       
                msg = arrMsgJ[0];
            }
        }
    }
    

    if (msg && msg.alarm && msg.AssetName) {
        var message = msg.AssetName+'</br>'+msg.alarm;        
        App.addNotification({
            hold: 5000,
            message: message,
            button: {
                text: LANGUAGE.COM_MSG16,
                close: false,         
            },
            onClick: function () { 
                processMessage(msg);
            },                          
        }); 
        
    }else if (msg && msg.time && msg.name && msg.title) {
        $$('.notification_button').removeClass('new_not');  
                    
        mainView.router.loadPage('resources/templates/notification.html');       
    }    
}

function processMessage(msg){
    App.closeNotification('.notifications');
    $$('.notification_button').removeClass('new_not'); 
    var data = {};
    data.lat = msg.Lat;
    data.lng = msg.Lng;
    data.alarm = msg.alarm;               
    if (data.alarm == 'status') { 
        if (msg.CreateDateTime) {
            /*msg.CreateDateTime = moment.utc(msg.CreateDateTime).toDate();
            msg.CreateDateTime = moment(msg.CreateDateTime).format(window.COM_TIMEFORMAT);*/
            msg.CreateDateTime = msg.CreateDateTime.replace("T", " ");
        }                              
        loadPageStatus(msg);    
    }else if (parseFloat(data.lat) && parseFloat(data.lng)){         
        if (msg.PositionTime) {
           /* msg.PositionTime = moment.utc(msg.PositionTime).toDate();
            msg.PositionTime = moment(msg.PositionTime).format(window.COM_TIMEFORMAT);*/
            msg.PositionTime = msg.PositionTime.replace("T", " ");
        }   

        loadPagePosition(msg);                                 
    }else{                
        mainView.router.loadPage('resources/templates/notification.html');
    }
}

function removeNotificationListItem(index){
    var list = getNotificationList();
    var user = localStorage.ACCOUNT;
    
    list[user].splice(index, 1);
    localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST.INSTALLER", JSON.stringify(list));
    var existLi = $$('.notificationList li');
    index = existLi.length - 2;
    existLi.each(function(){
        var currentLi = $$(this);
        if (!currentLi.hasClass('deleting')) {
            currentLi.attr('data-id', index);
            index--;
        }
    });
    virtualNotificationList.clearCache();
    //virtualNotificationList.update();
}
function removeAllNotifications(){
    var list = getNotificationList();
    var user = localStorage.ACCOUNT;
    list[user] = [];
    localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST.INSTALLER", JSON.stringify(list));
    virtualNotificationList.deleteAllItems();   
}

function getAssetParametersName(data){   
    var index = 0;
    var device = {                      
        Id: data[index++],
        IMEI: data[index++],
        Name: data[index++],
        TagName: data[index++],
        Icon: data[index++],
        Unit: data[index++], 
        InitMilage: data[index++],
        InitAcconHours: data[index++],
        State: data[index++],
        ActivateDate: data[index++],
        PRDTName: data[index++],
        PRDTFeatures: data[index++],
        PRDTAlerts: data[index++],
        Describe1: data[index++],
        Describe2: data[index++],
        Describe3: data[index++],
        Describe4: data[index++],
        InstallPosition: data[index++],
        _FIELD_FLOAT1: data[index++],
        _FIELD_FLOAT2: data[index++],
        _FIELD_FLOAT7: data[index++],
        Describe7: data[index++],
        FitmentOpt: data[index++],
        Describe6: data[index++],
    };        

    return device;
}


/* EDIT PHOTO */

var cropper = null;
var resImg = null;
function initCropper(){     
    var image = document.getElementById('image'); 
    //alert(image);     
    cropper = new Cropper(image, {
        aspectRatio: 1/1,
        dragMode:'move',
        rotatable:true,
        minCropBoxWidth:200,
        minCropBoxHeight:200,
        minCanvasWidth:200,
        minCanvasHeight:200,
        minContainerWidth:200,
        minContainerHeight:200,
        crop: function(data) {
         }
    });

}

//Take pictures
function getImage() {
    if(window.plus){
        var cmr = plus.camera.getCamera();
        cmr.captureImage( function (p) {
            plus.io.resolveLocalFileSystemURL( p, function ( entry ) {    
                var localurl = entry.toLocalURL();//
                GetBase64Code(localurl);
            });
        });
    }else{
        console.log('Plus not found');
    }
        
}

//Select from album
function galleryImgs(){
    if(window.plus){
        plus.gallery.pick( function(e){
            GetBase64Code(e.files[0]);
        }, function ( e ) {
            //outSet( "CANCEL SELECT" );
        },{filter:"image",multiple:true, maximum:1});
    }else{
        console.log('Plus not found');
    }
        
}

function GetBase64Code(path) //image path
{
    var bitmap = new plus.nativeObj.Bitmap("test");
    // load image
    bitmap.load(path,function(){
        var base4=bitmap.toBase64Data();        
        
        mainView.router.load({
            url: 'resources/templates/edit.photo.html',
            context: {
                imgSrc: base4
            }
        });
       
        //console.log('IMAGEЈє'+base4);
    },function(e){
        //alert('ERRORЈє'+JSON.stringify(e));
    });
}



function saveImg(){
    resImg =  cropper.getCroppedCanvas({
          width: 200,
          height: 200
    }).toDataURL();
    
    mainView.router.back();
    //$$('.asset_img img').attr('src',resImg);     

    /*if (TargetAsset.ASSET_IMEI) { 
        $$('.assets_list li[data-imei="'+TargetAsset.ASSET_IMEI+'"] .item-media img').attr('src',resImg);
    }

    var assetImg = {
        data: resImg, 
        id: 'IMEI_'+TargetAsset.ASSET_IMEI
    };                  
 
    App.showPreloader();
    $.ajax({
        type: 'POST',
        url: API_URL.URL_PHOTO_UPLOAD,
        data: assetImg,
        async: true, 
        cache: false,
        crossDomain: true,
        success: function (result) {
            App.hidePreloader(); 
            //var res = JSON.stringify(result);
            //alert(res);
            result = typeof (result) == 'string' ? eval("(" + result + ")") : result;
            if (result.MajorCode == "000") {              
                TargetAsset.ASSET_IMG = result.Data;
            }else{
                App.alert('Something wrong');
            }
            mainView.router.back();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){ 
           App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02);
        }
    });*/

        
    
}   