var storage;
var fail;
var uid;
try {
    uid = new Date;
    (storage = window.localStorage).setItem(uid, uid);
    fail = storage.getItem(uid) != uid;
    storage.removeItem(uid);
    fail && (storage = false);
} catch (exception) {
    window.localStorage.clear();
}

$hub = null;
window.NULL = null;
window.COM_TIMEFORMAT = 'YYYY-MM-DD HH:mm:ss';
window.COM_TIMEFORMAT2 = 'YYYY-MM-DDTHH:mm:ss';
var historyPage = 1;
var newHistoryArray = [];
TargetAsset = {};
let month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

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
    var uid = guid();
    if(window.device) {
        if(!localStorage.PUSH_MOBILE_TOKEN){
        localStorage.PUSH_MOBILE_TOKEN = uid;
        }
        localStorage.PUSH_APP_KEY = BuildInfo.packageName;
        localStorage.PUSH_APPID_ID = BuildInfo.packageName;
        localStorage.DEVICE_TYPE = device.platform;
    }else{
            if(!localStorage.PUSH_MOBILE_TOKEN)
            localStorage.PUSH_MOBILE_TOKEN = uid;
            if(!localStorage.PUSH_APP_KEY)
            localStorage.PUSH_APP_KEY = uid;
            if(!localStorage.PUSH_DEVICE_TOKEN)
            localStorage.PUSH_DEVICE_TOKEN = uid;
            //localStorage.PUSH_DEVICE_TOKEN = "75ba1639-92ae-0c4c-d423-4fad1e48a49d"
        localStorage.PUSH_APPID_ID = 'android.app.quiktrak.eu.installer';
        localStorage.DEVICE_TYPE = "android.app.quiktrak.eu.installer";
    }
}

var inBrowser = 0;
//localStorage.notificationChecked = 0;
var loginTimer = 0;
localStorage.loginDone = 0;

var loginInterval = null;
var pushConfigRetryMax = 40;
var pushConfigRetry = 0;

/*var maxClientIdCycle = 10;
var clientIdCycle = 1;*/

if( navigator.userAgent.match(/Windows/i) ){
    inBrowser = 1;
}

document.addEventListener("deviceready", onDeviceReady, false );

function onDeviceReady(){

    if (window.MobileAccessibility) {
        window.MobileAccessibility.usePreferredTextZoom(false);
    }
    if (StatusBar) {
        StatusBar.styleDefault();
    }

    if(window.isTablet){
        screen.orientation.unlock('any');
    }else{
        screen.orientation.lock('portrait');
    }

    setupPush();


    getPlusInfo();

   /* if　(!localStorage.ACCOUNT){
        plus.push.clear();
    } */

    if (!inBrowser) {
        if(localStorage.ACCOUNT && localStorage.PASSWORD) {
            preLogin();
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
            //alert( JSON.stringify(data) );

            //localStorage.PUSH_DEVICE_TOKEN = data.registrationId;

            var oldRegId = localStorage.PUSH_DEVICE_TOKEN;
            if (localStorage.PUSH_DEVICE_TOKEN !== data.registrationId) {
                // Save new registration ID
                localStorage.PUSH_DEVICE_TOKEN = data.registrationId;
                // Post registrationId to your app server as the value has changed
                refreshToken(data.registrationId);
            }
        });

        push.on('error', function(e) {
            //console.log("push error = " + e.message);
            alert("push error = " + e.message);
        });

        push.on('notification', function(data) {
            //alert( JSON.stringify(data) );

            //if user using app and push notification comes
            if (data && data.additionalData && data.additionalData.foreground) {
               // if application open, show popup
               showMsgNotification([data.additionalData]);
            }
            else if (data && data.additionalData && data.additionalData.payload){
               //if user NOT using app and push notification comes
                App.showIndicator();

                loginTimer = setInterval(function() {
                    //alert(loginDone);
                    if (localStorage.loginDone) {
                        clearInterval(loginTimer);
                        setTimeout(function(){
                            //alert('before processClickOnPushNotification');
                            processClickOnPushNotification([data.additionalData.payload]);
                            App.hideIndicator();
                        },1000);
                    }
                }, 1000);
            }

            if (device && device.platform && device.platform.toLowerCase() == 'ios') {
                push.finish(
                    () => {
                      console.log('processing of push data is finished');
                    },
                    () => {
                      console.log(
                        'something went wrong with push.finish for ID =',
                        data.additionalData.notId
                      );
                    },
                    data.additionalData.notId
                );
            }
        });

        if　(!localStorage.ACCOUNT){
            push.clearAllNotifications(
                () => {
                  console.log('success');
                },
                () => {
                  console.log('error');
                }
            );
        }
}

function onAppPause(){

}
function onAppResume(){

    if (localStorage.ACCOUNT && localStorage.PASSWORD) {
        getNewNotifications();
    }


}



function backFix(event){
    var page=App.getCurrentView().activePage;
    if(page.name=="index"){
        App.confirm(LANGUAGE.PROMPT_MSG015, function () {
            navigator.app.exitApp();
        });
    }else{
        mainView.router.back();
    }
}



// Initialize your app
var MapTrack = null;
window.PosMarker = {};
var virtualNotificationList = null;
var virtualCommandsHistoryList = null;
var virtualAlarmHistoryList = null;
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

var API_DOMIAN1 = "https://api.m2mglobaltech.com/Installer/V1/";
var API_DOMIAN2 = "https://quiktrak.co/webapp/QuikProtect.Api2/";
var API_DOMIAN3 = "https://api.m2mglobaltech.com/QuikTrak/V1/";
var API_DOMIAN4 = "https://api.m2mglobaltech.com/QuikProtect/V1/Client/";
var API_DOMIAN5 = "https://m2mdata.co/api/Service/";
var API_DOMIAN6 = "https://api.m2mglobaltech.com/Common/V1/Activation/";
var API_DOMIAN7 = "https://api.m2mglobaltech.com/";
//https://api.m2mglobaltech.com/quikdata/V1/XXXX
var API_DOMIAN9 = "https://upload.quiktrak.co/";
//https://api.m2mglobaltech.com/QuikProtect/V1/Client/
//  AccountEdit
var API_URL = {};
//API_URL.URL_GET_LOGIN = API_DOMIAN1 + "Client/Login";
API_URL.URL_GET_LOGIN = API_DOMIAN1 + "Client/Login2";
API_URL.URL_GET_LOGOUT = API_DOMIAN1 + "Client/Logout";
API_URL.URL_GET_ASSET_LIST = API_DOMIAN1 + "Client/GetAssetList";
API_URL.URL_GET_CREDIT = API_DOMIAN1 + "Client/GetCredit";
API_URL.URL_GET_DEVICE_DETAIL = API_DOMIAN1 + "Client/GetAssetDetail";
API_URL.URL_CHANGE_NOTIFICATION_STATUS = API_DOMIAN1 + "Client/Notification";
API_URL.URL_GET_CUSTOMER_DETAIL = API_DOMIAN1 + "Client/GetCustomerInfoByIMEI?code={0}&imei={1}";

API_URL.URL_GET_PROTECT_POSITION = API_DOMIAN1 + "Client/ProtectPostion2";
API_URL.URL_GET_STATUS = API_DOMIAN1 + "Client/Status2";
API_URL.URL_SET_IMMOBILISE = API_DOMIAN1 + "Client/Immobilise2";
API_URL.URL_SET_UNIMMOBILISE = API_DOMIAN1 + "Client/Unimobilise2";
API_URL.URL_SET_ACCVOLTAGE_ON = API_DOMIAN1 + "Client/AccVoltageOn";
API_URL.URL_SET_ACCVOLTAGE_OFF = API_DOMIAN1 + "Client/AccVoltageOff";
API_URL.URL_GET_LIVE_POSITION = API_DOMIAN1 + "Client/LivePostion";
API_URL.URL_GET_VERIFY2 = API_DOMIAN1 + "Client/Verfiy2";
API_URL.URL_SENT_NOTIFY = API_DOMIAN1 + "Client/SentNotify";
API_URL.URL_EDIT_DEVICE = API_DOMIAN1 + "Client/EditAsset";
API_URL.URL_GET_DEVICE_SETTINGS = API_DOMIAN1 + "Client/Config";
API_URL.URL_PHOTO_UPLOAD = API_DOMIAN9 + "image/Upload";
API_URL.URL_FORCE_RECONNECT = API_DOMIAN7 + "quikdata/v1/sms/UpdateLocByimei?code={0}&imei={1}";
API_URL.URL_EDIT_CUSTOMER_ACCOUNT = API_DOMIAN7 + "QuikProtect/V1/Client/AccountEdit?MajorToken={0}&MinorToken={1}&FirstName={2}&SurName={3}&Mobile={4}&Email={5}&Address0={6}&Address1={7}&Address2={8}&Address3={9}&Address4={10}&TimeZone={11}&countryCode={12}&accountName={13}";

API_URL.URL_EDIT_ACCOUNT = API_DOMIAN3 + "User/Edit?MajorToken={0}&MinorToken={1}&FirstName={2}&SubName={3}&Mobile={4}&Phone={5}&EMail={6}";
API_URL.URL_RESET_PASSWORD = API_DOMIAN3 + "User/Password?MinorToken={0}&oldpwd={1}&newpwd={2}";
API_URL.URL_GET_NEW_NOTIFICATIONS = API_DOMIAN3 +"Device/Alarms?MinorToken={0}&deviceToken={1}";

API_URL.URL_ACTIVATION = "https://app.quikprotect.co/activation2/?imei={0}&ServiceProfile={1}&DealerToken={2}&DealerName={3}&SolutionType={4}";
API_URL.URL_REPLACE_IMEI = "https://app.quikprotect.co/activation2/upgrade?DealerToken={0}&imeis={1}";
API_URL.URL_SUPPORT = "https://support.quiktrak.eu/?service={0}&name={1}&phone={2}&accountName={3}&email={4}&imei={5}&assetName={6}";
//?service=3&name=Simon&loginName=demoadmin&phone=447914631978
API_URL.URL_REPLACE_IMSI = API_DOMIAN6 + "ReplaceSim";
API_URL.URL_DEACTIVATE = API_DOMIAN6 + "DeActivate";
//API_URL.URL_GET_DETAILS_BY_VIN = "http://ss.sinopacific.com.ua/vin/v1/{0}";
API_URL.URL_GET_DETAILS_BY_VIN = "https://ss.sinopacific.com.ua/vin/v1/";

API_URL.URL_GET_COMMAND_HISTORY = API_DOMIAN1 + "Client/GetCommandHisMessages";
API_URL.URL_GET_SIM_INFO = API_DOMIAN5 + "GetSimInfo";
API_URL.URL_GET_SIM_LIST = API_DOMIAN5 + "GetDeviceList";
API_URL.URL_SIM_SUSPEND = API_DOMIAN5 + "Suspend?MajorToken={0}&imsi={1}";
API_URL.URL_SIM_RESUME = API_DOMIAN5 + "Resume?MajorToken={0}&imsi={1}";
API_URL.URL_SIM_ACTIVATE = API_DOMIAN5 + "Activate?MajorToken={0}&imsi={1}";

API_URL.URL_REFRESH_TOKEN = API_DOMIAN3 + "User/RefreshToken";

API_URL.URL_GET_ALARM_HISTORY = API_DOMIAN1 + "Client/GetAlarms?asId={0}&begin={1}&end={2}";

//https://api.m2mglobaltech.com/Installer/V1/Client/GetAlarms

//https://m2mdata.co/api/Service/Activate
//http://api.m2mglobaltech.com/Common/V1/Activation/ReplaceSim?IMEI=1&SIM==2&APN=3&minortoken=5
//https://api.m2mglobaltech.com/Installer/V1/Client/GetCustomerInfoByIMEI?imei

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
        return 139; //display the image with 50px height
    },
    // Display the each item using Template7 template parameter
    renderItem: function (index, item) {
        /*var notificationStates = getAssetNotificationState();
        var notState = 0;
        if (notificationStates && notificationStates[item.IMEI]) {
            notState = notificationStates[item.IMEI];
        }*/

        var ret = '';
        ret +=  '<li class="item-content" data-imei="'+item.IMEI+'" data-imsi="'+item.IMSI+'" data-name="'+item.Name+'" data-id="'+item.Id+'" data-type="'+item.ProductName+'" data-notifications="'+item.NotificationState+'" data-customer="'+item.Customer+'" >';
        ret +=      '<div class="item-inner">';
        ret +=          '<div class="item-title-row">';
        ret +=              '<div class="item-title color-blue">IMEI: '+item.IMEI+'</div>';
        ret +=              '<div class="item-after"><a href="#" class="item-link f7-icons icon-other-menu-content menuDevice"></a></div>';
        ret +=          '</div>';
        ret +=          '<div class="item-subtitle">IMSI: '+item.IMSI+'</div>';
        ret +=          '<div class="item-subtitle">'+LANGUAGE.HOME_MSG06+': '+item.ProductName+'</div>';
        ret +=          '<div class="item-subtitle">'+LANGUAGE.HOME_MSG10+': '+item.Customer+'</div>';
        ret +=          '<div class="item-subtitle">'+item.Name+'</div>';
        ret +=      '</div>';
        ret +=  '</li>';


        return ret;
    },
});



if (inBrowser) {
    if(localStorage.ACCOUNT && localStorage.PASSWORD) {
        preLogin();
    }
    else {
        logout();
    }
}
$$('body').on('click', '.test', function(){
    App.showPreloader();
    JSON1.request('test.php', {asd:'aa'},function(result){
          console.log(result);
          /*if(result.MajorCode == '000') {
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
          }*/
          App.hidePreloader();
      },
      function(jqXHR, textStatus){ console.log(textStatus); App.hidePreloader(); App.alert(LANGUAGE.COM_MSG02); })
})




$$('.login-form').on('submit', function (e) {
    e.preventDefault();
    preLogin();
    return false;
});
$$('body').on('change keyup input click', '.only_numbers', function(){
    if (this.value.match(/[^0-9-]/g)) {
         this.value = this.value.replace(/[^0-9-]/g, '');
    }
});

$$('body').on('click', '.toggle-password', function(){
    var password = $(this).siblings("input[name='password']");
    if(password.hasClass('show_pwd')){
        password.prop("type", "password").removeClass('show_pwd');
    }else{
        password.prop("type", "text").addClass('show_pwd');
    }
    $(this).toggleClass('color-white');
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
        if (typeof navigator !== "undefined" && navigator.app) {
            navigator.app.loadUrl(href, {openExternal: true});
        } else {
            window.open(href,'_blank');
        }
    }
    return false;
});



$$('body').on('click', '.search_tabbar .tab-link', function () {

    var href = $$(this).attr('href');
    var searchInput = $$('.formSearchDevice input[name="searchInput"]');

    switch(href){
        case '#tab-imei':
            searchInput.data('searchby','IMEI').attr('type', 'number');
            break;
        case '#tab-imsi':
            searchInput.data('searchby','IMSI').attr('type', 'number');
            break;

        default:
        console.log('here');
        searchInput.data('searchby','Name').attr('type', 'search');
        break;
    }

});

/*$$('body').on('click', '.scanBarCode', function(){
    let input = $$(this).siblings('input');
    openBarCodeReader(input);
});*/
$$('body').on('click', '.scanBarCode', function() {
    let input = $$(this).siblings('input');

    let permissions = cordova.plugins.permissions;
    if (!permissions) {
        App.alert('plugin not supported')
    } else {
        permissions.hasPermission(permissions.CAMERA, function(status) {
            if (status.hasPermission) {
                openBarCodeReader(input);
            } else {
                permissions.requestPermission(permissions.CAMERA, function(status1){
                    openBarCodeReader(input);
                    if (!status1.hasPermission) error();
                }, requestPermissionCameraError);
            }
        });
    }
});
function requestPermissionCameraError() {
    App.alert('Camera permission is not turned on');
}


$$(document).on('click', '.connectivity_type_tabbar a.tab-link', function(e){
    e.preventDefault();
    var activePage = mainView.activePage;
    var page = $$(this).data('id');

    //if ( typeof(activePage) == 'undefined' || (activePage && activePage.name != page)) {
        switch (page){

            case 'connectivity.hlr':
                loadConnectivity();
                break;
            case 'connectivity.current':
                loadConnectivityCurrent();
                break;
            case 'connectivity.data':
                loadConnectivityData();
                break;
        }
    //}

    return false;
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

$$('.formSearchDevice input[name="searchInput"]').focus(function(){
    if (this.value.length > 0) {
        $$('.searchDevice').show();
        $$('.searchClear').hide();
    }
});

$$('.formSearchDevice input[name="searchInput"]').blur(function(){
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
    var input = $$(this).siblings('input[name="searchInput"]');
    input.val('');
    input.focus();
    $$('.searchDevice').show();
    $$('.searchClear').hide();
});

/*$$('body').on('click', '.navbar_title, .navbar_title_index', function(){

    var msg = '{"title":"IGNITION ON WARNING","type":32768,"imei":"0863014530724883","name":"AA5638PT Merc2008 Дешевий","lat":50.439684,"lng":30.3883,"speed":0,"direct":0,"time":"2018-09-06 16:09:43","alarm":32768,"Lat":50.439684,"Lng":30.3883,"Imei":"0863014530724883","AssetName":"AA5638PT Merc2008 Дешевий","PositionTime":"2018-09-06 16:09:43"}';
    //var msg = '{"Lat":"-33.970022","Lng":"151.127198","Valid":"A","Speed":"0","Direction":"0","Acc":"OFF","Battery":"13.06","GSM":"23","GPS":"9","Ignition":"77834","Mileage":"447679","alarm":"location","PositionTime":"2018-08-08T13:09:46","Imei":"0352544074331597","Imsi":"234500003188471","AssetName":"Sydney Swift","CreateDateTime":"2018-08-08T13:09:46"}';


    //processClickOnPushNotification(all_msg);
    //console.log('click');
    showMsgNotification([msg]);
});*/




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

$$('body').on('click', '.assetList .item-inner', function () {
    var parrent = $$(this).closest('.item-content');
    //var caption = parrent.data('imei');

    var userPermissions = Protocol.Helper.getPermissions(getUserinfo().Permissions);
    //var userPermissions = Protocol.Helper.getPermissions(1);
    //console.log(userPermissions);

    TargetAsset.IMEI = !parrent.data('imei')? '' : parrent.data('imei');
    TargetAsset.IMSI = !parrent.data('imsi')? '' : parrent.data('imsi');
    TargetAsset.Name = !parrent.data('name')? '' : parrent.data('name');
    TargetAsset.Id = !parrent.data('id')? '' : parrent.data('id');
    TargetAsset.Type = !parrent.data('type')? '' : parrent.data('type');
    TargetAsset.Customer = !parrent.data('customer')? '' : parrent.data('customer');

    var notificationsCheck = '';
    if (parrent.data('notifications') == 1) {
        notificationsCheck = 'checked="checked"';
    }


    /*var settings =  '<div class="action_button_wrapper">'+
      '<div class="action_button_block action_button_media">'+
      '<i class="f7-icons icon-other-service-details color-blue "></i>'+
      '</div>'+
      '<div class="action_button_block action_button_text">'+
      LANGUAGE.HOME_MSG04 +
      '</div>'+
      '</div>';

    var simInfo =  '<div class="action_button_wrapper">'+
      '<div class="action_button_block action_button_media">'+
      '<i class="f7-icons icon-other-info color-blue "></i>'+
      '</div>'+
      '<div class="action_button_block action_button_text">'+
      LANGUAGE.ASSET_SIM_INFO_MSG00 +
      '</div>'+
      '</div>';*/

    var assetDetCustomerDet =  `<div class="row" >
                        <div class="action_button_wrapper col-50 buttonAssetDetails">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-other-service-details color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.HOME_MSG04}
                          </div>
                        </div>
                        <div class="action_button_wrapper col-50 buttonCustomerDetails">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-sim-info-customer color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.ASSET_SETTINGS_MSG07}
                          </div>
                        </div>
                    </div>`;

   /* var simStatForceRec =  `<div class="row" >                        
                        <div class="action_button_wrapper col-50 buttonSimStatus">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-other-info color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.ASSET_SIM_INFO_MSG00}
                          </div>
                        </div>
                        <div class="action_button_wrapper col-50 buttonForceReconnect">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-reconnect color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.ASSET_SETTINGS_MSG59}
                          </div>
                        </div>
                    </div>`;*/
					
					 var simStatForceRec =  `<div class="row" >                        
                        <div class="action_button_wrapper col-50 buttonSimStatus">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-other-info color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.ASSET_SIM_INFO_MSG00}
                          </div>
                        </div>
						<div class="action_button_wrapper col-50 buttonConnectivity">
                          <div class="action_button_block action_button_media">
						  <i class="f7-icons icon-sim-info-date color-blue"></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.ASSET_SETTINGS_MSG67}
                          </div>
                        </div>
                    </div>`;

    var commands =  `<div class="row" >
                        <div class="action_button_wrapper col-50 buttonCommands ${ !userPermissions.SendCommands ? 'disabled' : '' }">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-other-commands color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.HOME_MSG03}
                          </div>
                        </div>
                        <div class="action_button_wrapper col-50 buttonCommandsHistory">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-calendar color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.ASSET_COMMANDS_HISTORY_MSG00}
                          </div>
                        </div>
                    </div>`;

    var replace =  `<div class="row" >
                        <div class="action_button_wrapper col-50 buttonReplaceIMEI ${ !userPermissions.ReplaceIMEI ? 'disabled' : '' }">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-replace-imei  color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.HOME_MSG08}
                          </div>
                        </div>
                        <div class="action_button_wrapper col-50 buttonReplaceSIM ${ !userPermissions.ReplaceSIM ? 'disabled' : '' }">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-sim-card-replace color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.HOME_MSG11}
                          </div>
                        </div>
                    </div>`;

    var activation =  `<div class="row" >
                        <div class="action_button_wrapper col-50 buttonActivate ${ !userPermissions.ActivateDevice ? 'disabled' : '' }">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-other-activation  color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.HOME_MSG09}
                          </div>
                        </div>
                        <div class="action_button_wrapper col-50 buttonDeativate ${ !userPermissions.DeactivateDevice || !userPermissions.SuspendSIM ? 'disabled' : '' }">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-deactivation color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.HOME_MSG12}
                          </div>
                        </div>
                    </div>`;

    /*var notification =  '<div class="action_button_wrapper">'+
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
                        '</div>';*/
    var notificationAndAlarmHistory =  `<div class="row" >            
            <div class="action_button_wrapper col-50 buttonAlarmHistory">
              <div class="action_button_block action_button_media">
                <i class="f7-icons icon-calendar color-blue "></i>
              </div>
              <div class="action_button_block action_button_text">
                  ${LANGUAGE.ASSET_ALARM_HISTORY_MSG00}
              </div>
            </div>
            <div class="action_button_wrapper col-50 buttonNotifications">
              <div class="action_button_block action_button_media">
                <i class="f7-icons icon-header-notification color-blue "></i>
              </div>
              <div class="action_button_block action_button_text">      
                  <span class="label-switch actionButton-label" style="margin-left: 3px">
                    <input type="checkbox" name="checkbox-alarm" ${notificationsCheck}>
                    <div class="checkbox"></div>
                  </span>         
              </div>              
            </div>
          </div>`;

 
    var support =  `<div class="row" >
                        <div class="action_button_wrapper col-50 buttonForceReconnect">
                          <div class="action_button_block action_button_media">
                            <i class="f7-icons icon-reconnect color-blue "></i>
                          </div>
                          <div class="action_button_block action_button_text">
                              ${LANGUAGE.ASSET_SETTINGS_MSG59}
                          </div>
                        </div>
						
						<div class="action_button_wrapper col-50 buttonSupport">
						  <div class="action_button_block action_button_media">
							<i class="f7-icons icon-support color-blue "></i>
						  </div>
						  <div class="action_button_block action_button_text">
							  ${LANGUAGE.HOME_MSG13}
						  </div>
						</div>           
                        </div>
                    </div>`;

    var buttons = [
        {
            text: 'IMEI: '+TargetAsset.IMEI,
            label: true,
            color: 'blue',
        },

        {
            text: assetDetCustomerDet,
            onClick: function (actionSheet, e) {
                let targetEl = $$(e.target).closest('.action_button_wrapper');
                if(targetEl.hasClass('buttonAssetDetails')){
                    loadPageSettings();
                }else if(targetEl.hasClass('buttonCustomerDetails')){
                    loadPageCustomer();
                    //loadSimInfo()
                }
            },
        },
        
        {
            text: simStatForceRec,
            onClick: function (actionSheet, e) {
                let targetEl = $$(e.target).closest('.action_button_wrapper');
                if(targetEl.hasClass('buttonSimStatus')){
                    loadSimInfo();
                }else if(targetEl.hasClass('buttonConnectivity')){
                    loadConnectivity();
					
                    //loadSimInfo()
                }
            },
        },
        /*{
            text: simInfo,
            onClick: function () {
                loadSimInfo();
            },
        },*/
        {
            text: activation,
            onClick: function (actionSheet, e) {
                let targetEl = $$(e.target).closest('.action_button_wrapper');
                if(targetEl.hasClass('buttonActivate')){
                    showActivationModal();
                }else if(targetEl.hasClass('buttonDeativate')){
                    showDeactivationModal();
                }
            },
        },
        {
            text: commands,
            onClick: function (actionSheet, e) {
                let targetEl = $$(e.target).closest('.action_button_wrapper');
                if(targetEl.hasClass('buttonCommands')){
                    loadPageCommands();
                }else if(targetEl.hasClass('buttonCommandsHistory')){
                    loadCommandHistoryPage({
                        IMSI: TargetAsset.IMSI,
                        LastDay: 7,
                    });
                }
            },
        },
        {
            text: replace,
            onClick: function (actionSheet, e) {
                let targetEl = $$(e.target).closest('.action_button_wrapper');
                if(targetEl.hasClass('buttonReplaceIMEI')){
                    loadPageUpgrade();
                }else if(targetEl.hasClass('buttonReplaceSIM')){
                    loadSimReplace();
                }
            },
        },
        /*{
            text: notificationSupport,
            onClick: function (actionSheet, e) {
                let targetEl = $$(e.target).closest('.action_button_wrapper');
                if(targetEl.hasClass('buttonNotifications')){
                    changeAssetNotificationState(parrent);
                    //loadPageUpgrade();
                }else if(targetEl.hasClass('buttonSupport')){
                    goForSupport()
                    //loadSimReplace();
                }
            },
        },*/
        {
            text: notificationAndAlarmHistory,
            onClick: function (actionSheet, e) {
                let targetEl = $$(e.target).closest('.action_button_wrapper');
                if(targetEl.hasClass('buttonNotifications')){
                    changeAssetNotificationState(parrent);
                }else if(targetEl.hasClass('buttonAlarmHistory')){
                    loadAlarmHistoryPage({
                        Id: TargetAsset.Id,
                        LastDay: 7,
                    });
                }
            },
        },{
            text: support,
            onClick: function (actionSheet, e) {
                //
				let targetEl = $$(e.target).closest('.action_button_wrapper');
                if(targetEl.hasClass('buttonForceReconnect')){
                    sendForceReconnect();
                }else{
                    goForSupport()
                }
            },
        },


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

        //App.showPreloader();
        showProgressBar()
        JSON1.request(url, function(result){
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
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
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
                //console.log(url);
                //App.showPreloader();
                showProgressBar()
                JSON1.request(url, function(result){
                        console.log(result);
                        if (result.MajorCode == '000') {
                            App.alert(LANGUAGE.PROMPT_MSG003, function(){
                                logout();
                            });
                        }else{
                            App.alert(LANGUAGE.PROMPT_MSG005);
                        }
                        //App.hidePreloader();
                      hideProgressBar();
                    },
                    function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
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
                    case 'Status': case "Config":
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
                }else if(props && data.alarm == 'Config' ){
                	loadPageDeviceConfig(props);
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


App.onPageInit('asset.alarm.history', function(page){

    if (virtualAlarmHistoryList) {
        virtualAlarmHistoryList.destroy();
    }

    var alarmHystoryList = $$(page.container).find('.alarmHistoryList');

    virtualAlarmHistoryList = App.virtualList(alarmHystoryList, {
        items: [],
        height: function (item) {
            var height = 72;
            return height; //display the image with 50px height
        },
        renderItem: function (index, item) {
            var ret = '';

            var datetime = moment.utc(item.AlarmTime, window.COM_TIMEFORMAT).toDate();
            datetime = moment(datetime).format(window.COM_TIMEFORMAT);

            ret = `<li class="item-content" data-index="${ index }">
                        <div class="item-inner">
                            <div class="item-title-row">
                                <div class="item-title">${ Protocol.PositionAlertsTranslations[item.AlarmType] }</div>
                                <div class="item-after">${ datetime }</div>
                            </div>                        
                            <div class="item-text">${ TargetAsset.Name }</div>
                        </div>
                    </li>`;
            return  ret;
        }
    });

    var selectLastDay = $$('select[name="LastDaySelect"]');
    selectLastDay.val(selectLastDay.data("set"));

    var Id = $$(page.container).find('[name="Id"]').val();
    var LastDay = $$(page.container).find('[name="LastDay"]').val();

    if (Id && LastDay) {
        requestAlarmHistory({
            AssetID: Id,
            beginTime: moment().subtract(LastDay, 'days').format('YYYY-MM-DD'),
            endTime: moment().format('YYYY-MM-DD'),
        });
    }

    selectLastDay.on('change', function(){
        requestAlarmHistory({
            AssetID: Id,
            beginTime: moment().subtract(this.value, 'days').format('YYYY-MM-DD'),
            endTime: moment().format('YYYY-MM-DD'),
        });
    });

    alarmHystoryList.on('click', '.item-content', function (e){
        let data = virtualAlarmHistoryList.items[$$(this).data('index')];
        data.alarm = Protocol.PositionAlertsTranslations[data.AlarmType];
        data.Imei = TargetAsset.IMEI;
        data.AssetName = TargetAsset.Name;
        data.PositionTime = data.AlarmTime;
        loadPagePosition(data);
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
            var height = 68.67;
            /*if (item.Direction == 1) {
                height = 68.67;
            }*/
            return height; //display the image with 50px height
        },
        renderItem: function (index, item) {
			let html = ''; let state = "";
			var datetime = moment.utc(item.CreateTime).toDate();
            datetime = moment(datetime).format(window.COM_TIMEFORMAT);
			
			if (item.Message) {
				item.Message = item.Message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
			}

			switch(item.State){
				case 0:
					state = 'Error'
					stateColor = 'grey'
				break;
				case 1:
					state = 'Sent'
					stateColor = 'red'
				break;
				case 2:
					state = 'Submitted'
					stateColor = 'green'
				break;
				case 3:
					state = 'Delivered'
					stateColor = 'green'
				break;
				case 4:
					state = 'Received'
					stateColor = 'blue'
				break;
			}

				html += '<li class="item-content" >';
			if(item.Direction == 1){
				html += '<div class="item-inner item-inner-commands-history item-inner-commands-history-1">';
			}else{
				html += '<div class="item-inner item-inner-commands-history">';
			}
				html += '<div class="item-title-row">';
				html += '<div class="item-title">';
				if (item.Direction == 2) {
					html += '<i class="material-icons md-36 history-status-' + stateColor + '">send</i>';
				} else {
					html += '<i class="material-icons md-36 history-status-' + stateColor + '">email</i>';
				}
				html += '<div class="history-status color-status-' + stateColor + '">' + state + '</div></div>';
				html += '<div class="item-after">' + datetime + '</div>';
				html += '</div>';
				html += '<div class="item-text">' + item.Message + '</div>';
				html += '</div>';
				html += '</li>';

			return html;
            /*var ret = '';

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
            return  ret;*/
        }
    });

    var selectLastDay = $$('select[name="LastDaySelect"]');
    selectLastDay.val(selectLastDay.data("set"));

    var IMSI = $$(page.container).find('[name="IMSI"]').val();
    var LastDay = $$(page.container).find('[name="LastDay"]').val();

	historyPage = 1;
	newHistoryArray = [];
	if (IMSI) {
		requestNewCommandHistory(IMSI);
	}else{
		App.addNotification({
            hold: 3000,
            message: LANGUAGE.ASSET_COMMANDS_HISTORY_MSG01
        });
	}
	
    /*~~~if (IMSI && LastDay) {
        requestCommandHistory({IMSI: IMSI, LastDay: LastDay});
    }

    $$('.getNewHystory').on('click', function(){

    });

    selectLastDay.on('change', function(){
        requestCommandHistory({IMSI: IMSI, LastDay: this.value});
    });*/
});

function requestNewCommandHistory(IMSI) {                   
    //let userInfo = self.$app.methods.getFromStorage('userInfo');
    let accessNewToken = '00000000-0000-0000-0000-000000000000';//userInfo.accessNewToken;
        
        var settings = {
          "url": "https://test4.m2mdata.co/JT/SMS/History",
          "method": "POST",
          "timeout": 0,
          "headers": {
            "token": accessNewToken,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          "data": {
            "IMSI": IMSI,
            "PAGE": historyPage,
            "pagesize": "20",
          }
        };
		
		//var container = $$('body');
        //if (container.children('.progressbar, .progressbar-infinite').length) return; //don't run all this if there is a current progressbar loading
        
		App.showProgressbar();
        
        $.ajax(settings).done(function (response) {  
			console.log('his', response)
          if (response.MajorCode == '000') {
            if (response.Data.length) {
                let historyArray = response.Data
                    if(historyPage > 1){
                        newHistoryArray = newHistoryArray.concat(historyArray);
                    }else{
                        newHistoryArray = historyArray;													
                    }
                        let incr = historyPage + 1;
                        
                        historyPage = incr
                               
						console.log('pre',newHistoryArray)                 
                        requestNewCommandHistory(IMSI);		
                }else{
                    if(newHistoryArray.length > 0){
                        newHistoryArray.sort(function(a,b){
                            var c = new Date(a.CreateTime);
                            var d = new Date(b.CreateTime);
                            return d-c;
                        });
						
						console.log('new',newHistoryArray)
						virtualCommandsHistoryList.replaceAllItems(newHistoryArray);
                    }else{
						App.addNotification({
                            hold: 3000,
                            message: LANGUAGE.ASSET_COMMANDS_HISTORY_MSG01
                        });
                        if (virtualCommandsHistoryList) {
                            virtualCommandsHistoryList.deleteAllItems();
                        }
                    }
                }
            }else{
                App.addNotification({
                    hold: 3000,
                    message: LANGUAGE.ASSET_COMMANDS_HISTORY_MSG01
                });
                if (virtualCommandsHistoryList) {
                    virtualCommandsHistoryList.deleteAllItems();
                } 
            }				
            App.hideProgressbar();
        }).fail(e => {
			 App.hideProgressbar(); 
			 App.alert(LANGUAGE.COM_MSG02); 
		});
}


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

            case '6':
                requestDeviceSettings();
                break;

          case'7':
              App.modal({
                  title: TargetAsset.Name,
                  text: LANGUAGE.ASSET_COMMANDS_MSG11,
                  verticalButtons: true,
                  buttons: [
                      {
                          text: LANGUAGE.COM_MSG38,
                          bold: true,
                          onClick: function () {
                              requestAccVoltage('on')
                          }
                      },
                      {
                          text: LANGUAGE.COM_MSG39,
                          bold: true,
                          onClick: function () {
                              requestAccVoltage('off')
                          }
                      },
                      {
                          text: LANGUAGE.COM_MSG04,
                      },
                  ]
              });
            break;
          /*case'8':
            requestAccVoltage('off')
            break;*/

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
            LastDay: 7,
        });
    });

});




App.onPageInit('asset.sim.replace', function(page){
    var formSubmit = $$('.formSubmit');
    formSubmit.on('click', function(){

        var data = {
            "minortoken": getUserinfo().userCode,
            "IMEI": $$(page.container).find('input[name="IMEI"]').val(),
            "SIM": $$(page.container).find('input[name="NewIMSI"]').val(),
            "APN": $$(page.container).find('input[name="APN"]').val(),
        };

        if(!data.IMEI){
            App.alert(LANGUAGE.PROMPT_MSG032 + ' ' + LANGUAGE.HOME_MSG00);
            return;
        }
        if(!data.SIM){
            App.alert(LANGUAGE.PROMPT_MSG032 + ' ' + LANGUAGE.ASSET_SIM_INFO_MSG10);
            return;
        }
        if(!data.APN){
            App.alert(LANGUAGE.PROMPT_MSG032 + ' ' + LANGUAGE.ASSET_SIM_INFO_MSG09);
            return;
        }


        console.log(data);

        //App.showPreloader();
        showProgressBar()
        $.ajax({
            type: "GET",
            url: API_URL.URL_REPLACE_IMSI,
            data: data,
            dataType: 'json',
            async: true,
            cache: false,

            success: function(result){
                //App.hidePreloader();
                hideProgressBar();
                if(result && result.MajorCode === '000'){
                    localStorage.SimReplaceAPN = data.APN;
                    mainView.router.back();
                    submitSearchForm();
                }else{
                    App.alert(JSON.stringify(result), LANGUAGE.COM_MSG37);
                }

                console.log(result)
            },

            error: function(XMLHttpRequest, textStatus, errorThrown){
                //App.hidePreloader();
                hideProgressBar();
                console.log(XMLHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
                App.alert(LANGUAGE.PROMPT_MSG034);

            }
        });
    });
});


App.onPageInit('customer.settings', function(page){
    var sendSetting = $$(page.container).find('.sendSetting');

    sendSetting.on('click', function () {
        var url = API_URL.URL_EDIT_CUSTOMER_ACCOUNT.format(
          encodeURIComponent($$(page.container).find('[name="MajorToken"]').val()),
          encodeURIComponent($$(page.container).find('[name="MinorToken"]').val()),
          encodeURIComponent($$(page.container).find('[name="FirstName"]').val()),
          encodeURIComponent($$(page.container).find('[name="LastName"]').val()),
          encodeURIComponent($$(page.container).find('[name="Mobile"]').val()),
          encodeURIComponent($$(page.container).find('[name="Email"]').val()),
          encodeURIComponent($$(page.container).find('[name="Address0"]').val()),
          encodeURIComponent($$(page.container).find('[name="Address1"]').val()),
          encodeURIComponent($$(page.container).find('[name="Address2"]').val()),
          encodeURIComponent($$(page.container).find('[name="Address3"]').val()),
          encodeURIComponent($$(page.container).find('[name="Address4"]').val()),
          encodeURIComponent($$(page.container).find('[name="TimeZone"]').val()),
          encodeURIComponent($$(page.container).find('[name="CountryCode"]').val()),
          encodeURIComponent($$(page.container).find('[name="CustomerName"]').val())
        )
        console.log(url)
        //App.showPreloader();
        showProgressBar()
        JSON1.request(url,
          function(result){
              console.log(result);
              if(result.MajorCode == '000') {
                  mainView.router.back();
              }else if(result.MajorCode === '100' && result.MinorCode === '1002'){
                  App.alert(LANGUAGE.PROMPT_MSG039);
              }else{
                  App.alert(LANGUAGE.PROMPT_MSG034);
              }
              //App.hidePreloader();
              hideProgressBar();
          },
          function(){hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );
    })
    //
});
App.onPageInit('asset.settings', function(page){

    //var showBlockControll = $$(page.container).find('.showBlockControll');
    var sendSetting = $$('body').find('.sendAssetSetting');

    var fitmentOptSelect = $$(page.container).find('[name="FitmentOpt"]');
    var fitmentOptSelectSet = fitmentOptSelect.data("set");
    var fitmentOptCustomWrapper = $$(page.container).find('.fitment_opt_custom_wrapper');
    var fitmentOptSelectedArr = [];

    var VINinputEl = $$(page.container).find('[name="Describe7"');

    var makeEl = $$(page.container).find('input[name="Describe1"]');
    var modelEl = $$(page.container).find('input[name="Describe2"]');
    var colorEl = $$(page.container).find('input[name="Describe3"]');
    var yearEl = $$(page.container).find('input[name="Describe4"]');

    /*var paymentType = $$(page.container).find('[name="PaymentType"]');
    var tabs = $$(page.container).find('.tab');

    var expDate = $$(page.container).find('.exp_date');
    var cardType = $$(page.container).find('.card_type');
    var cardNumber = $$(page.container).find('.card_number');
    var cardHolder = $$(page.container).find('.card_holder');*/

    //
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



    VINinputEl.on('blur change', function(){
        if ( $$(this).data('prev-val') != this.value ) {
            $$(this).data('prev-val', this.value);
            checkVinNumber({
                VIN: this.value,
                inputs: {
                    Describe1: makeEl,
                    Describe2: modelEl,
                    Describe3: colorEl,
                    Describe4: yearEl,
                    Describe7: VINinputEl,
                }
            });
        }
    });

    VINinputEl.on('input ', function(){
        this.value = this.value.toUpperCase();
        if (this.value.length == 17 && $$(this).data('prev-val') != this.value ) {
            $$(this).data('prev-val', this.value);
            checkVinNumber({
                VIN: this.value,
                inputs: {
                    Describe1: makeEl,
                    Describe2: modelEl,
                    Describe3: colorEl,
                    Describe4: yearEl,
                    Describe7: VINinputEl,
                }
            });
        }
    });



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
    $(expDate).mask("99/99");*/



    $$('.add_photo').on('click', function (e) {

        var uploadButtons = [
            {
                text: LANGUAGE.PHOTO_EDIT_MSG01,
                onClick: function () {
                    getImage(1, 'assetPhoto', TargetAsset.IMEI);
                }
            },
            {
                text: LANGUAGE.PHOTO_EDIT_MSG02,
                onClick: function () {
                    getImage(0, 'assetPhoto', TargetAsset.IMEI);
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
        App.actions(uploadButtons);
    });

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
            "InitAccHours": $$(page.container).find('input[name="EngineHours"]').val(),
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
        var imageUploaded = $$('.add_photo img.user-img').data('name');
        if(imageUploaded){
            data.Icon = imageUploaded;
        }
        //data.Icon = 'IMEI_0000001700091735.png';
        console.log(data);
        //return;
        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_EDIT_DEVICE,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') {

                    mainView.router.back();

                }else{
                    App.alert(LANGUAGE.PROMPT_MSG013);
                }
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );
    });
});

App.onPageInit('client.details', function (page) {
    var sendSetting = $$('body').find('.sendClientDetails');
    let uploadPhotoButton = $$(page.container).find('.uploadPhoto');


    var uploadButtons = [
        {
            text: LANGUAGE.PHOTO_EDIT_MSG01,
            onClick: function () {
                getImage(1, 'installPhoto', $$(page.container).find('[name="IMEI"]').val());
            }
        },
        {
            text: LANGUAGE.PHOTO_EDIT_MSG02,
            onClick: function () {
                getImage(0, 'installPhoto', $$(page.container).find('[name="IMEI"]').val());
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

    uploadPhotoButton.on('click', function () {
        let installPhotosEl = $$(page.container).find('.install-photo-item');
        if(installPhotosEl.length < 4){
            App.actions(uploadButtons);
        }else{
            App.alert(LANGUAGE.PROMPT_MSG031);
        }
    });


    $$(page.container).on('click', '.removePhoto', function () {
        $$(this).closest('.install-photo-item').remove();
    });

    $$(page.container).on('click', '.install-photo-block img', function () {
        let images = $$(page.container).find('.install-photo-block img');
        let imgs = [];
        let currentImgSrc = this.src;
        let currentImgIndex = 0;
        for (let i = 0; i < images.length; i++) {
            imgs.push(images[i].src);
            if(currentImgSrc === images[i].src){
                currentImgIndex = i;
            }
        }
        App.photoBrowser({
            photos : imgs,
            theme: 'dark',
            loop: true,
        }).open(currentImgIndex);
    });



    $$(sendSetting).on('click', function(){
        let requiredFields = $$(page.container).find('[required]');
        if(requiredFields.length){
            for (let i = 0; i < requiredFields.length; i++) {
                if(!requiredFields[i].value.trim()){
                    App.alert(LANGUAGE.PROMPT_MSG032 + ' - <b>' + $$(requiredFields[i]).closest('.item-inner').find('.item-title').text() +'</b>', LANGUAGE.PROMPT_MSG033);
                    return;
                }
            }
        }

        var data ={
            IMEI: $$(page.container).find('[name="IMEI"]').val(),
            MinorToken: getUserinfo().userCode,
            TaskID: $$(page.container).find('[name="TaskID"]').val(),
            LoginName: $$(page.container).find('[name="LoginName"]').val(),
            FirstName: $$(page.container).find('[name="FirstName"]').val(),
            LastName: $$(page.container).find('[name="LastName"]').val(),
            PhoneNumber: $$(page.container).find('[name="PhoneNumber"]').val(),
            AddressOfJob: $$(page.container).find('[name="AddressOfJob"]').val(),
            JobDetail: $$(page.container).find('[name="JobDetail"]').val(),
            ContactCode: $$(page.container).find('[name="ContactCode"]').val(),
            Notes: $$(page.container).find('[name="Notes"]').val(),

            InstallerCompany: $$(page.container).find('[name="InstallerCompany"]').val(),
            InstallerName: $$(page.container).find('[name="InstallerName"]').val(),
            InstallerEmail: $$(page.container).find('[name="InstallerEmail"]').val(),
            InstallerLogin: $$(page.container).find('[name="InstallerLogin"]').val(),

            Describe1: $$(page.container).find('[name="Describe1"]').val(),
            Describe2: $$(page.container).find('[name="Describe2"]').val(),
            Describe3: $$(page.container).find('[name="Describe3"]').val(),
            Describe4: $$(page.container).find('[name="Describe4"]').val(),
            InstallPosition: $$(page.container).find('[name="InstallPosition"]').val(),
        };

        let installPhotosEl = $$(page.container).find('.install-photo-item');
        if(installPhotosEl.length){
            //let photos = [];
            for (let i = 0; i < installPhotosEl.length; i++) {
                //photos.push($$(installPhotosEl[i]).find('img').data('name'));
                let imgNum = i+1;
                data['photo'+imgNum] = $$(installPhotosEl[i]).find('img').data('name');
            }
            //data.photos = photos;
        }

        var additionalParams = {
            setIgnByVol: $$(page.container).find('[name="ignitionStatusByVoltage"]').prop('checked')
        }
        if(additionalParams.setIgnByVol){
            additionalParams.setIgnByVolState = 'on';
        }
        /*console.log(additionalParams)
        return*/


        JSON1.requestPost(API_URL.URL_SENT_NOTIFY,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') {

                    loadPageVerification(result.Data, additionalParams);

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
              hideProgressBar();
            },
            function(jqXHR, textStatus){
                App.hidePreloader();
                hideProgressBar();
                App.alert(LANGUAGE.COM_MSG02);
            }
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

App.onPageInit('asset.device.config', function(page){
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
    let data = {
        imgFor: $$(page.container).find('[name="imgFor"]').val(),
        imei:  $$(page.container).find('[name="imei"]').val(),
    }
    initCropper(data.imgFor);
    //alert(cropper);

    //After the selection or shooting is complete, jump out of the crop page and pass the image path to this page
    //image.src = plus.webview.currentWebview().imgSrc;
    //image.src = "img/head-default.jpg";

    $$('.savePhoto').on('click', function(){
        saveImg(data);
    });
    $$('#redo').on('click', function(){
        cropper.rotate(90);
    });
    $$('#undo').on('click', function(){
        cropper.rotate(-90);
    });
});

App.onPageInit('asset.sim.info', function(page){

    var container =  $$(page.container).find('.page-content');

    $$(container).on('click', '.activateSim', function() {

        var url = API_URL.URL_SIM_ACTIVATE.format(
          encodeURIComponent(getUserinfo().code),
          encodeURIComponent(TargetAsset.IMSI),
        )
        //App.showPreloader();
        showProgressBar()
        JSON1.request(url, function(result){
              console.log(result);
              //App.hidePreloader();
              hideProgressBar();
              if(result.MajorCode == '000') {
                  App.addNotification({
                      hold: 3000,
                      message: LANGUAGE.COM_MSG03
                  });
                  loadSimInfo()
              }else if(result.Data){
                  App.alert(typeof(result.Data) === 'string' ? result.Data : JSON.stringify(result.Data) );
              }else{
                  App.alert(LANGUAGE.PROMPT_MSG013);
              }
          },
          function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );
    });

    $$(container).on('click', '.resumeSim', function() {

        var url = API_URL.URL_SIM_RESUME.format(
          encodeURIComponent(getUserinfo().code),
          encodeURIComponent(TargetAsset.IMSI),
        )
       // App.showPreloader();
        showProgressBar()
        JSON1.request(url, function(result){
              console.log(result);
              //App.hidePreloader();
              hideProgressBar();
              if(result.MajorCode == '000') {
                  App.addNotification({
                      hold: 3000,
                      message: LANGUAGE.COM_MSG03
                  });
                  loadSimInfo()
              }else if(result.Data){
                  App.alert(typeof(result.Data) === 'string' ? result.Data : JSON.stringify(result.Data) );
              }else{
                  App.alert(LANGUAGE.PROMPT_MSG013);
              }
          },
          function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );
    });

    $$(container).on('click', '.suspendSim', function() {
        var url = API_URL.URL_SIM_SUSPEND.format(
          encodeURIComponent(getUserinfo().code),
          encodeURIComponent(TargetAsset.IMSI),
        )
        //App.showPreloader();
        showProgressBar()
        JSON1.request(url, function(result){
              console.log(result);
              //App.hidePreloader();
              hideProgressBar();
              if(result.MajorCode == '000') {
                  App.addNotification({
                      hold: 3000,
                      message: LANGUAGE.COM_MSG03
                  });
                  loadSimInfo()
              }else if(result.Data){
                  App.alert(typeof(result.Data) === 'string' ? result.Data : JSON.stringify(result.Data) );
              }else{
                  App.alert(LANGUAGE.PROMPT_MSG013);
              }

          },
          function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );
    });

});

function clearUserInfo(){

    var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '' : localStorage.PUSH_MOBILE_TOKEN;
    //var appId = !localStorage.PUSH_APPID_ID? '' : localStorage.PUSH_APPID_ID;
    var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '' : localStorage.PUSH_DEVICE_TOKEN;
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


    if (pushList) {
        localStorage.setItem("COM.QUIKTRAK.LIVE.NOTIFICATIONLIST.INSTALLER", JSON.stringify(pushList));
    }
    if (deviceToken) {
        localStorage.PUSH_DEVICE_TOKEN = deviceToken;
    }
    if (mobileToken) {
        localStorage.PUSH_MOBILE_TOKEN = mobileToken;
    }
    //localStorage.loginDone = 0;

        //JSON1.request(API_URL.URL_GET_LOGOUT.format(MajorToken, MinorToken, userName, mobileToken), function(result){ console.log(result); });
    var data = {
        "MobileToken": mobileToken,
        "DeviceToken": deviceToken,
    };
    JSON1.requestPost(API_URL.URL_GET_LOGOUT, data,function(result){
          console.log(result);
    });

    $$("input[name='account']").val(userName);

}



function logout(){
    clearUserInfo();
    App.loginScreen();
}

function preLogin(){
    hideKeyboard();
    //getPlusInfo();
    //App.showPreloader();
    showProgressBar()
    if  (localStorage.PUSH_DEVICE_TOKEN){
        login();
    }else{
        loginInterval = setInterval( reGetPushDetails, 500);
    }
}

function reGetPushDetails(){

    getPlusInfo();
    if  (pushConfigRetry <= pushConfigRetryMax){
        pushConfigRetry++;
        if  (localStorage.PUSH_DEVICE_TOKEN){
            clearInterval(loginInterval);
            login();
        }
    }else{
        clearInterval(loginInterval);
        pushConfigRetry = 0;
        login();
        /*setTimeout(function(){
           App.alert(LANGUAGE.PROMPT_MSG052);
        },2000);*/
    }
}

function login(){

    getPlusInfo();
    //hideKeyboard();

        //App.showPreloader();
        var mobileToken = !localStorage.PUSH_MOBILE_TOKEN? '123' : localStorage.PUSH_MOBILE_TOKEN;
        //var mobileToken = '123';
        var appKey = !localStorage.PUSH_APP_KEY? '123' : localStorage.PUSH_APP_KEY;
        //var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '123' : localStorage.PUSH_DEVICE_TOKEN;
        var deviceToken = !localStorage.PUSH_DEVICE_TOKEN ? '123' : localStorage.PUSH_DEVICE_TOKEN;
        var deviceType = !localStorage.DEVICE_TYPE? 'webapp' : localStorage.DEVICE_TYPE;
        var account = $$("input[name='account']");
        var password = $$("input[name='password']");

        var data = {
            "LoginName":!account.val()? localStorage.ACCOUNT: account.val(),
            "Password":!password.val()? localStorage.PASSWORD: password.val(),
            "AppKey": appKey,
            "MobileToken": mobileToken,
            "DeviceToken": deviceToken,
            "DeviceType": deviceType,
        };
       // alert(JSON.stringify(data));
        JSON1.requestPost(API_URL.URL_GET_LOGIN, data,function(result){
                console.log(result);
                if(result.MajorCode == '000') {
                    if(!!account.val()) {
                        localStorage.ACCOUNT = account.val();
                        localStorage.PASSWORD = password.val();
                    }
                    account.val(null);
                    password.val(null);
                    //result.Data.Permissions = 247;
                    setUserinfo(result.Data);
                    updateUserData(result.Data);
                    updateUserCrefits(result.Data.credit);
                    //localStorage.notificationChecked = 1;
                    localStorage.loginDone = 1;



                    App.closeModal();
                }else{
                    App.alert(LANGUAGE.LOGIN_MSG01);
                    App.loginScreen();
                }
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); App.loginScreen();}
        );



}

function refreshToken(newDeviceToken){
    console.log('refreshToken() called');
    var userInfo = getUserinfo();

    if (localStorage.PUSH_MOBILE_TOKEN && userInfo.code && userInfo.userCode && newDeviceToken) {
        var data = {
            MajorToken: userInfo.code,
            MinorToken: userInfo.userCode,
            MobileToken: localStorage.PUSH_MOBILE_TOKEN,
            DeviceToken: newDeviceToken,
        };

        //console.log(urlLogin);
        JSON1.requestPost(API_URL.URL_REFRESH_TOKEN, data, function(result){
                if(result.MajorCode == '000') {

                }else{

                }
            },
            function(){ console.log('error during refresh token');  }
        );
    }else{
        console.log('not loggined');
    }

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
        //App.showPreloader();
        showProgressBar()
    }
    JSON1.requestPost(API_URL.URL_GET_CREDIT,data,function(result){
            console.log(result);
            if(result.MajorCode == '000') {
                updateUserCrefits(result.Data.Credit);
                userInfo.credit = result.Data.Credit;
                setUserinfo(userInfo);
            }
            if (vsMsg) {
                App.alert(LANGUAGE.COM_MSG21+': '+result.Data.Credit);
                //App.hidePreloader();
                hideProgressBar();
            }

        },
        function(){ hideProgressBar();}
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

    /*var buttons = {
        'button100' : 'CZ3NVD89LSBBW',
        'button500' : 'EKWPMLLMKUTV8',
        'button1000' : '9R2RY5C5GDFY8',
        'currency' : 'USD'
    };*/
    var buttons = {
        'button100' : 'UCC4Y44AJE76Y',
        'button500' : 'JSBWFD3AGHER2',
        'button1000' : 'EZZ22Z5F67K98',
        'currency' : 'USD'
    };

    //https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=UCC4Y44AJE76Y
//https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JSBWFD3AGHER2
    //https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=EZZ22Z5F67K98

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
            other: 'GPS-Installer-app',
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
        var deviceType = !localStorage.DEVICE_TYPE? 'webapp':localStorage.DEVICE_TYPE;
        var deviceToken = !localStorage.PUSH_DEVICE_TOKEN? '123' : localStorage.PUSH_DEVICE_TOKEN;

        var data = {
            "CustomerToken": getUserinfo().code,
            "MobileToken": mobileToken,
            "AppKey": appKey,
            "Token": deviceToken,
            "Type": deviceType,
        };
        data[searchby] = input.val().trim();



        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_GET_ASSET_LIST,data,function(result){
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
              hideProgressBar()

            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );

    }else{
        App.addNotification({
            hold: 3000,
            message: LANGUAGE.PROMPT_MSG008
        });
    }
}

function showProgressBar(){
    var container = $$('body');
    if (container.children('.progressbar, .progressbar-infinite').length) return; //don't run all this if there is a current progressbar loading
    App.showProgressbar(container);
}
function hideProgressBar(){
    setTimeout(function (){
        App.hideProgressbar();
    },100)
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

    if (typeof navigator !== "undefined" && navigator.app) {
            //plus.runtime.openURL(href);
            navigator.app.loadUrl(href, {openExternal: true});
        } else {
            window.open(href,'_blank');
        }
}

function showActivationModal(){
    App.modal({
        title: '<div class="custom-modal-logo-wrapper"><img class="custom-modal-logo" src="resources/images/logo-dark.png" alt=""/></div>',
        text: LANGUAGE.PROMPT_MSG025,
        verticalButtons: true,
        buttons: [
            {
                text: LANGUAGE.COM_MSG32, // protect
                onClick: function() {
                    //if (permissions && permissions.ActProtect) {
                        loadPageActivation('5f87b4fc-d25b-4', 'QProtect'); // protect plam
                    /*}else{
                        showNoActPermissionModal(LANGUAGE.COM_MSG32);
                    }*/
                }
            },
            {
                text: LANGUAGE.COM_MSG41,  // loc8
                onClick: function() {
                    //if (permissions && permissions.ActLive) {
                    loadPageActivation('5f87b4fc-d25b-4', 'Loc8'); //annual live track plan
                    /*}else{
                        showNoActPermissionModal(LANGUAGE.COM_MSG33);
                    }*/
                }
            },
            {
                text: LANGUAGE.COM_MSG33,  // live
                onClick: function() {
                    //if (permissions && permissions.ActLive) {
                        loadPageActivation('5f87b4fc-d25b-4', 'Track'); //annual live track plan
                    /*}else{
                        showNoActPermissionModal(LANGUAGE.COM_MSG33);
                    }*/
                }
            },

            {

                text: '<span class="color-red">' + LANGUAGE.COM_MSG04 + '</span>',  // live
                onClick: function() {

                }
            },
        ]
    });
}

function showDeactivationModal() {
    App.modal({
        title: '<div class="custom-modal-logo-wrapper"><img class="custom-modal-logo" src="resources/images/logo-dark.png" alt=""/></div>',
        text: LANGUAGE.PROMPT_MSG035 + ' - <b>' + TargetAsset.IMEI + '</b>. ' + LANGUAGE.PROMPT_MSG036,
        //verticalButtons: true,
        buttons: [
            {
                text: LANGUAGE.COM_MSG04,
            },
            {
                text: LANGUAGE.COM_MSG40,
                onClick: function() {
                    deactivateDevice(TargetAsset.IMEI);
                }
            },

        ]
    });
}

function showNoActPermissionModal(plan){
    App.alert(LANGUAGE.PROMPT_MSG026 + ' ' + plan, '<div class="custom-modal-logo-wrapper"><img class="custom-modal-logo" src="resources/images/logo-dark.png" alt=""/></div>');
}

function deactivateDevice(imei) {
    if (imei) {
        var userInfo = getUserinfo();
        var data = {
          MinorToken: userInfo.userCode,
          MajorToken: userInfo.code,
          IMEI: imei
        };

        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_DEACTIVATE, data, function(result){
              console.log(result);
              if(result.MajorCode === '000') {
                  App.alert(LANGUAGE.PROMPT_MSG037);

              }else if(result.MajorCode === '100' && result.MinorCode === '1003'){
                  App.alert(LANGUAGE.PROMPT_MSG038);

              }else{
                  App.alert(LANGUAGE.PROMPT_MSG013);
              }
              //App.hidePreloader();
              hideProgressBar()
          },
          function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );
    }
}

function loadPageActivation(planCode, solutionType){
    var userInfo = getUserinfo();
    var href = API_URL.URL_ACTIVATION.format( TargetAsset.IMEI, planCode, userInfo.code, encodeURIComponent(userInfo.customerName), solutionType );

    if (typeof navigator !== "undefined" && navigator.app) {
            //plus.runtime.openURL(href);
            navigator.app.loadUrl(href, {openExternal: true});
        } else {
            window.open(href,'_blank');
        }
}

function loadSimReplace() {
    mainView.router.load({
        url:'resources/templates/asset.sim.replace.html',
        context:{
            IMEI: TargetAsset.IMEI,
            IMSI: TargetAsset.IMSI,
            APN: localStorage.SimReplaceAPN ? localStorage.SimReplaceAPN : '',
        }
    });
}

function getCustomerDetails(params) {
    var url = API_URL.URL_GET_CUSTOMER_DETAIL.format(getUserinfo().code, TargetAsset.IMEI )
    //App.showPreloader();
    showProgressBar()
    JSON1.request(url,
      function(result){
          console.log(result);
          if(result.MajorCode == '000') {
              if (params.callback instanceof Function){
                  params.callback(result.Data)
              }
          }else{
              App.alert(LANGUAGE.PROMPT_MSG013);
          }
          //App.hidePreloader();
          hideProgressBar()
      },
      function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
    );
}

function loadPageCustomer() {

    getCustomerDetails({
        data: {
            code: getUserinfo().code,
            imei: TargetAsset.IMEI,
        },
        callback: function(params){
            var TimeZoneList = Protocol.Helper.getTimezoneList();
            var TimeZoneSelectedObj = typeof(params.timeZone) === "number" ? TimeZoneList[TimeZoneList.findIndex( el => parseInt(el.Value) === params.timeZone)] : TimeZoneList[TimeZoneList.findIndex( el => el.Value == params.timeZone)];
            var TimeZoneSelectedText = TimeZoneSelectedObj ? TimeZoneSelectedObj.Name : '';
            var CountryList = Protocol.Helper.getCountrys();
            var CountryListSelectedText = CountryList[CountryList.findIndex( el => el.CountryCode == params.CountryCode)].Country;

            mainView.router.load({
                url: 'resources/templates/customer.settings.html',
                context: {
                    Address0: params.Address0,
                    Address1: params.Address1,
                    Address2: params.Address2,
                    Address3: params.Address3,
                    Address4: params.Address4,
                    CountryCode: params.CountryCode,
                    CustomerName: params.customerName,
                    Email: params.email,
                    FirstName: params.firstName,
                    LastName: params.lastName,
                    Mobile: params.mobile,
                    Phone: params.phone,
                    TimeZone: params.timeZone,
                    code: params.code,
                    userCode: params.userCode,

                    TimeZoneList: TimeZoneList,
                    TimeZoneSelectedText: TimeZoneSelectedText,
                    CountryList: CountryList,
                    CountryListSelectedText: CountryListSelectedText,
                }
            });
        }
    })
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

    var userPermissions = Protocol.Helper.getPermissions(getUserinfo().Permissions);

    //App.showPreloader();
    showProgressBar()
    JSON1.requestPost(API_URL.URL_GET_DEVICE_DETAIL,data,function(result){
            console.log(result);
            if(result.MajorCode == '000') {
                var asset = getAssetParametersName(result.Data);
                console.log(asset);
                let assetImg = getAssetImg(asset, {'assetEdit':true});

                mainView.router.load({
                    url:'resources/templates/asset.settings.html',
                    context:{
                        /*IMEI: '<span>'+LANGUAGE.HOME_MSG00+'</span>: '+TargetAsset.IMEI,
                        IMSI: '<span>'+LANGUAGE.HOME_MSG01+'</span>: '+TargetAsset.IMSI,
                        Type: '<span>'+LANGUAGE.HOME_MSG06+'</span>: '+TargetAsset.Type,
                        Provider: '<span>'+LANGUAGE.ASSET_SETTINGS_MSG06+'</span>: '+getUserinfo().customerName,*/
                        IMEI: TargetAsset.IMEI,
                        IMSI: TargetAsset.IMSI,
                        Type: TargetAsset.Type,
                        Provider: getUserinfo().customerName,
                        Customer: TargetAsset.Customer,
                        AssetName: TargetAsset.Name,
                        Date: todayStr,
                        Describe7: asset.Describe7,
                        LicensePlate: asset.TagName,
                        Describe1: asset.Describe1,
                        Describe2: asset.Describe2,
                        Describe3: asset.Describe3,
                        Describe4: asset.Describe4,
                        Odometer: asset.InitMilage,
                        EngineHours: asset.InitAcconHours,
                        Unit: asset.Unit,
                        InstallPosition: asset.InstallPosition,
                        FitmentOpt: asset.FitmentOpt,
                        FitmentOptCustom: asset.Describe6,
                        AssetImg: assetImg,

                        isAllowedToEditAsset: userPermissions.EditAsset
                    }
                });
            }else{
                App.alert(LANGUAGE.PROMPT_MSG013);
            }
            //App.hidePreloader();
          hideProgressBar()
        },
        function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
    );
}

function getAssetDetails(params){

    //App.showPreloader();
    showProgressBar()
    JSON1.requestPost(API_URL.URL_GET_DEVICE_DETAIL,params.data,function(result){
            console.log(result);
            if(result.MajorCode == '000') {
                var asset = getAssetParametersName(result.Data);
                console.log(asset);
                params.assetData = asset;
                if (params.callback instanceof Function){
                    params.callback(params)
                }
            }else{
                App.alert(LANGUAGE.PROMPT_MSG013);
            }
            //App.hidePreloader();
          hideProgressBar()
        },
        function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
    );
}


function loadPageVerification(data, additionalParams){
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
        if(additionalParams && additionalParams.setIgnByVol){
            requestAccVoltage(additionalParams.setIgnByVolState);
        }

    }



}


function sendForceReconnect() {
    var url = API_URL.URL_FORCE_RECONNECT.format(getUserinfo().code, TargetAsset.IMEI )
    //App.showPreloader();
    showProgressBar()
    JSON1.request(url,
      function(result){
          console.log(result);
          if(result.MajorCode == '000') {
              App.addNotification({
                  hold: 3000,
                  message: LANGUAGE.COM_MSG03
              });
          }else{
              App.alert(LANGUAGE.PROMPT_MSG013+'<br>'+JSON.stringify(result.Data));
          }
          //App.hidePreloader();
          hideProgressBar()
      },
      function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
    );
}

function goForSupport() {
    /*var href = API_URL.URL_SUPPORT;
    if (typeof navigator !== "undefined" && navigator.app) {
        navigator.app.loadUrl(href, { openExternal: true });
    } else {
        window.open(href, '_blank');
    }*/
    getCustomerDetails({
        data: {
            code: getUserinfo().code,
            imei: TargetAsset.IMEI,
        },
        callback: function (params) {
            //?service={0}&name={1}&phone={2}&accountName={3}&email={4}&imei={5}";
            var href = API_URL.URL_SUPPORT.format(
              3,
              params.firstName + ' ' + params.lastName,
              params.mobile ? params.mobile : (params.phone) ? params.phone : '',
              params.customerName,
              params.email,
              TargetAsset.IMEI,
              TargetAsset.Name
            );

            if (typeof navigator !== "undefined" && navigator.app) {
                navigator.app.loadUrl(href, { openExternal: true });
            } else {
                window.open(href, '_blank');
            }
        }
    })
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

function loadPageDeviceConfig(data){
	var timeCheck = data.CreateDateTime.indexOf('T');
    if (timeCheck != -1) {
        data.CreateDateTime = moment.utc(data.CreateDateTime).toDate();
        data.CreateDateTime = moment(data.CreateDateTime).format(window.COM_TIMEFORMAT);
    }
    TargetAsset.IMEI = data.Imei;
    var deviceParams = data.PARAMS ? isJsonString(data.PARAMS) : '';
    if (deviceParams) {
    	data.PARAMS = deviceParams;
    }

    mainView.router.load({
        url:'resources/templates/asset.device.config.html',
        context: data,

    });
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
    console.log(data)
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

                InstallerCompany: data.InstallerCompany,
                InstallerName: data.InstallerName,
                InstallerEmail: data.InstallerEmail,
                InstallerLogin: data.InstallerLogin,
                Describe1: data.Describe1,
                Describe2: data.Describe2,
                Describe3: data.Describe3,
                Describe4: data.Describe4,
                InstallPosition: data.InstallPosition,
            }
        });


    }

}

function loadAlarmHistoryPage(params){
    mainView.router.load({
        url:'resources/templates/asset.alarm.history.html',
        context:{
            LastDay: params && params.LastDay ? params.LastDay : 3,
            Id: params && params.Id ? params.Id : TargetAsset.Id,
        }
    });
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



async function loadConnectivity(){
	
	
	if (TargetAsset.IMSI) {
				let self = this
				
				let hlrName = 'Imsi';
				let hlrValue = TargetAsset.IMSI;
				let hlrName1 = 'Packet Switched Up Time';
				let hlrValue1 = '';
				let hlrName2 = 'Visitor Location Register';
				let hlrValue2 = '';
				let hlrName3 = 'Circuit Switch Up Time';
				let hlrValue3 = '';
				let hlrName4 = 'MSISDN';
				let hlrValue4 = '';
				let hlrName5 = 'EPCMMERealm';
				let hlrValue5 = '';
				
				try {
					const responseHLR = await fetch(`https://m2mdata.co/jt/GetGetHlrInfo?imsi=${TargetAsset.IMSI}`)
					let resHLR = await responseHLR.json()					
					
					let mapList = resHLR.Data.dataMapField
					let hlrList = resHLR.Data.hlrInfoFieldsField

					console.log('arr',hlrList)
					let hlrDate1 = hlrList.find(el=>el.nameField==hlrName1).valueField
					let hlrDate2 = hlrList.find(el=>el.nameField==hlrName3).valueField
					
					hlrValue = hlrList.find(el=>el.nameField==hlrName).valueField									
					
					hlrValue2 = hlrList.find(el=>el.nameField==hlrName2).valueField	
					hlrValue1 = hlrDate1=='00000000000000'?'':hlrDate1.slice(0,4) + '-' + hlrDate1.slice(4,6) + '-' + hlrDate1.slice(6,8) + ' ' + hlrDate1.slice(8,10) + ':' + hlrDate1.slice(10,12) + ':' + hlrDate1.slice(12,14)									
					
					hlrValue3 = hlrDate2=='00000000000000'?'':hlrDate2.slice(0,4) + '-' + hlrDate2.slice(4,6) + '-' + hlrDate2.slice(6,8) + ' ' + hlrDate2.slice(8,10) + ':' + hlrDate2.slice(10,12) + ':' + hlrDate2.slice(12,14)								
					hlrName4 = 'MSISDN'									
				
					hlrValue4 = mapList.find(el=>el.keyField=='MSISDN').valueField										
					hlrName5 = 'EPCMMERealm'									
					
					hlrValue5 = mapList.find(el=>el.keyField=='EPCMMERealm')?.valueField										
					
					mainView.router.load({
						url:'resources/templates/connectivity.hlr.html',
						context:{
							hlrName,
								hlrValue,
								hlrName1,
								hlrValue1,
								hlrName2,
								hlrValue2,
								hlrName3,
								hlrValue3,
								hlrName4,
								hlrValue4,
								hlrName5,
								hlrValue5
						}
					});
				}catch(e){					
					console.log('er',e)
					mainView.router.load({
						url:'resources/templates/connectivity.hlr.html',
						context:{
							hlrName,
								hlrValue,
								hlrName1,
								hlrValue1,
								hlrName2,
								hlrValue2,
								hlrName3,
								hlrValue3,
								hlrName4,
								hlrValue4,
								hlrName5,
								hlrValue5
						}
					});
				}
	}else{
		App.addNotification({
            hold: 3000,
            message: LANGUAGE.PROMPT_MSG007
        });
	}
    
}


async function loadConnectivityCurrent(){
    
	if (TargetAsset.IMSI) {
		let sessionFieldName = 'Start date',
				sessionFieldValue = '',
				sessionFieldName1 ='Update date',
				sessionFieldValue1 = '',
				sessionFieldName2 = 'End date',
				sessionFieldValue2 = '',
				sessionFieldName3 = 'Total bytes',
				sessionFieldValue3 = '',
				sessionFieldName4 = 'Operator',
				sessionFieldValue4 = '',
				sessionFieldName5 = 'Cell info',
				sessionFieldValue5 = '',
				sessionFieldName6 = 'IMEI',
				sessionFieldValue6 = '',
				sessionFieldName7 = 'Close status',
				sessionFieldValue7 = ''
			
			const responseActiveSession = await fetch(`https://m2mdata.co/jt/GetActiveSession?imsi=${TargetAsset.IMSI}`)
				let resActiveSession = await responseActiveSession.json()
				
				if(resActiveSession.Data){
				
					let startDate = moment.utc(resActiveSession.Data.startDateField).toDate()
					let utcStartDate = startDate.getDate() + ' ' + month_names_short[startDate.getMonth()] + ' ' + startDate.getFullYear() + ' ' + ('0' + startDate.getHours()).slice(-2) + ':' + ('0' + startDate.getMinutes()).slice(-2) + ':' + ('0' + startDate.getSeconds()).slice(-2)
					
					let endDate = moment.utc(resActiveSession.Data.lastInterimDateField).toDate()
					let utcEndDate = endDate.getDate() + ' ' + month_names_short[endDate.getMonth()] + ' ' + endDate.getFullYear() + ' ' + ('0' + endDate.getHours()).slice(-2) + ':' + ('0' + endDate.getMinutes()).slice(-2) + ':' + ('0' + endDate.getSeconds()).slice(-2)
										
					if(resActiveSession.Data.startDateField)sessionFieldValue = utcStartDate		
					if(resActiveSession.Data.lastInterimDateField)sessionFieldValue2 = utcEndDate
					sessionFieldValue3 = resActiveSession.Data.totalBytesField
					sessionFieldValue4 = resActiveSession.Data.networkCodeField	
			
					
					
			}else{
				console.log('No current session');
				//self.$app.dialog.alert('No current session');
			
			}
			
			mainView.router.load({
						url:'resources/templates/connectivity.current.html',
						context:{
							sessionFieldName,
							sessionFieldValue,
							sessionFieldName1,
							sessionFieldValue1,
							sessionFieldName2,
							sessionFieldValue2,
							sessionFieldName3,
							sessionFieldValue3,
							sessionFieldName4,
							sessionFieldValue4,
							sessionFieldName5,
							sessionFieldValue5,
							sessionFieldName6,
							sessionFieldValue6,
							sessionFieldName7,
							sessionFieldValue7,	
						}
					});
	}else{
		App.addNotification({
            hold: 3000,
            message: LANGUAGE.PROMPT_MSG007
        });
	}
}


function loadConnectivityData(){
    
	if (TargetAsset.IMSI) {
		let DashboardDataTable = [] 
		let self = this
		var listQuery_1 = {
									imsi: TargetAsset.IMSI
								}
								
								var settings_1 = {
								  "url": "https://test4.m2mdata.co/JT/Sim/GETSESSIONS",
								  "method": "POST",
								  "timeout": 0,
								  "headers": {
									"token": '00000000-0000-0000-0000-000000000000',
									"Content-Type": "application/x-www-form-urlencoded"
								  },
								  "data": listQuery_1
								};
								
					   
								$.ajax(settings_1).done(  function (response) {
								
									
										console.log('datases ',response)
						if(response.Data.length){
						
									const jsonDataArr = []
						
						let dataArr = response.Data.split('\r\n')
						console.log('json',dataArr);
						
									const totalDataUsage = 0
									const totalSMSUsage = 0

									const arrTable = []
									dataArr.pop()
									
									dataArr.forEach((element, index) => {
										let dataJson = element.split(',')
										let startDate = moment.utc(dataJson[4]).toDate()
										let endDate = moment.utc(dataJson[5]).toDate()
										
										
										let jsonDataObj = {
											start: startDate.getDate() + ' ' + month_names_short[startDate.getMonth()] + ' ' + startDate.getFullYear() + ' ' + ('0' + startDate.getHours()).slice(-2) + ':' + ('0' + startDate.getMinutes()).slice(-2) + ':' + ('0' + startDate.getSeconds()).slice(-2),
											end: endDate.getDate() + ' ' + month_names_short[endDate.getMonth()] + ' ' + endDate.getFullYear() + ' ' + ('0' + endDate.getHours()).slice(-2) + ':' + ('0' + endDate.getMinutes()).slice(-2) + ':' + ('0' + endDate.getSeconds()).slice(-2),
											total: dataJson[3],
											operator: dataJson[1]+dataJson[2]
										}
										jsonDataArr.push(jsonDataObj)
									})
									
									
									
									let sortedArr = jsonDataArr.sort(function(a,b){
										var c = new Date(a.start)
										var d = new Date(b.start)
										return d-c
									  })
									//sortedArr.reverse()
									
									sortedArr.forEach((element, index) => {
									  /*const tableDataUsageTotal = (+element.totalDataUsage / 1000000)
									  const tableSMSUsageTotal = element.totalSmsUsage == 'undefined' ? 0 : (+element.totalSmsUsage)
									  const tableFlowUsageTotal = element.totalFlowUsage == 'undefined' ? 0 : (+element.totalFlowUsage)*/
									  arrTable.push({
										start: element.start,
										end: element.end,
										total: element.total,
										operator: element.operator
									  })
									})
									
									
								DashboardDataTable = arrTable
											
											/*DashboardDataTableEl = $('body').find('#table-dashboard-sim').DataTable({                    
												columnDefs: [
													{ // remove orederable arrows from column with pin
														targets: [ 0 ], 
														orderable: true,  
													},
													{ // hide group codes, which will be used for filtering
														targets: [ 1 ],
														visible: true
													},
													{ // hide group codes, which will be used for filtering
														targets: [ 2 ],
														visible: true
													},
													{ // hide group codes, which will be used for filtering
														targets: [ 3 ],
														visible: true
													},
													{ // hide group codes, which will be used for filtering
														targets: [ 4 ],
														visible: true
													},
													{ // hide group codes, which will be used for filtering
														targets: [ 5 ],
														visible: true
													},
													{ // hide group codes, which will be used for filtering
														targets: [ 6 ],
														visible: true
													},
													{ // hide group codes, which will be used for filtering
														targets: [ 7 ],
														visible: true
													}
												],
												"order": [[ 0, "desc" ]],
												lengthMenu: [5, 10, 25],
												pageLength: 5   
											});
										*/
								
								}else{
									
									
									
										console.log('No sessions')
									
								}
								
										
											mainView.router.load({
											url:'resources/templates/connectivity.data.html',
											context:{
												DashboardDataTable
											}
										});
							})
	}else{
		App.addNotification({
            hold: 3000,
            message: LANGUAGE.PROMPT_MSG007
        });
	}
	
	
    
}

function loadSimInfo(){
    var data = {
        MajorToken: getUserinfo().code,
        DeviceId: TargetAsset.IMSI,
    };
    App.showIndicator();
    //showProgressBar()
    JSON1.requestPost(API_URL.URL_GET_SIM_INFO,data,function(result){
            console.log(result);
            if(result.MajorCode == '000') {
                getAdditionalSimInfo(result.Data);
            }else{
                App.alert(LANGUAGE.PROMPT_MSG013);
                App.hideIndicator();
                //hideProgressBar();
            }

        },
        function(){
            App.hideIndicator();
            //hideProgressBar();
            App.alert(LANGUAGE.COM_MSG02);
        }
    );
}

function getAdditionalSimInfo(params){
    var data = {
        MajorToken: getUserinfo().code,
        DeviceId: TargetAsset.IMSI,
        Rows: 10,
    };
    /*App.showPreloader();*/
    JSON1.requestPost(API_URL.URL_GET_SIM_LIST,data,function(result){
            console.log(result);
            if(result.MajorCode == '000') {
                loadSimInfoPage(Object.assign(params, result.Data[0]));
            }else{
                //App.alert(LANGUAGE.PROMPT_MSG013);
                loadSimInfoPage(params);
            }
            //App.hidePreloader();
          //hideProgressBar();
          App.hideIndicator();
        },
        function(){
            App.hideIndicator();
            //hideProgressBar();
            App.alert(LANGUAGE.COM_MSG02);
        }
    );
}

function loadSimInfoPage(params){
    /*params.Imei = TargetAsset.IMEI;*/

    params.Permissions = Protocol.Helper.getPermissions(getUserinfo().Permissions);


    params.isStateSuspended = !!(params.State && params.State.toLowerCase() === 'suspended');
    //console.log(mainView);
    //console.log(mainView.activePage.name);
    let reload = false;
    if(mainView.history && mainView.history.length && mainView.history[mainView.history.length -1 ].includes('asset.sim.info') ){
        reload = true
    }
    mainView.router.load({
        url:'resources/templates/asset.sim.info.html',
        context: params,
        reload: reload,
    });
}

function showVerificationStatus(){
    setTimeout(function() {
        /*NOT VERIFIED*/
        /*var result =  '<div class="result result2">' +
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

        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_GET_STATUS,data,function(result){
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
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
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

        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_GET_PROTECT_POSITION,data,function(result){
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
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );

    }
}

function requestPositionLive(){
    if (TargetAsset.IMEI) {
        var data = {
            'IMEI': TargetAsset.IMEI,
            'MinorToken': getUserinfo().userCode,
        };

        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_GET_LIVE_POSITION,data,function(result){
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
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );
    }
}



function requestVerify(){
    if (TargetAsset.IMEI) {
        var userInfo = getUserinfo();
        var data = {
            'IMEI': TargetAsset.IMEI,
            'MinorToken': userInfo.userCode,
        };

        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_GET_VERIFY2,data,function(result){
                console.log(result);
                if(result.MajorCode == '000') {

                    if(userInfo.customerName){
                        result.Data.InstallerCompany = userInfo.customerName;
                    }
                    if(userInfo.firstName || userInfo.lastName){
                        result.Data.InstallerName = userInfo.firstName + ' ' + userInfo.lastName;
                    }
                    if(userInfo.email){
                        result.Data.InstallerEmail = userInfo.email;
                    }
                    result.Data.InstallerLogin = localStorage.ACCOUNT;

                    getAssetDetails({
                        data:{
                            "Code": userInfo.code,
                            "Id": TargetAsset.Id,
                        },
                        prevData: result.Data,
                        callback: function (params) {
                            params.prevData.Describe1 = params.assetData.Describe1;
                            params.prevData.Describe2 = params.assetData.Describe2;
                            params.prevData.Describe3 = params.assetData.Describe3;
                            params.prevData.Describe4 = params.assetData.Describe4;
                            params.prevData.InstallPosition = params.assetData.InstallPosition;

                            loadPageClientDetails(params.prevData);
                        }
                    });

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
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
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

        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_SET_IMMOBILISE,data,function(result){
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
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
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

        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_SET_UNIMMOBILISE,data,function(result){
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
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );

    }
}

function requestAccVoltage(state = 'on'){
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
        var url = API_URL.URL_SET_ACCVOLTAGE_ON;
        if(state === 'off'){
            url = API_URL.URL_SET_ACCVOLTAGE_OFF;
        }

        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(url,data,function(result){
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
              //App.hidePreloader();
              hideProgressBar();
          },
          function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );

    }
}

function requestDeviceSettings(){
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

        //App.showPreloader();
        showProgressBar()
        JSON1.requestPost(API_URL.URL_GET_DEVICE_SETTINGS,data,function(result){
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
                //App.hidePreloader();
              hideProgressBar();
            },
            function(){ hideProgressBar(); App.alert(LANGUAGE.COM_MSG02); }
        );

    }
}

function requestAlarmHistory(params){
    if (!params && params.AssetID && params.beginTime && params.endTime) {
        return
    }
    let url = API_URL.URL_GET_ALARM_HISTORY.format(params.AssetID, params.beginTime, params.endTime);

    var container = $$('body');
    if (container.children('.progressbar, .progressbar-infinite').length) return; //don't run all this if there is a current progressbar loading
    App.showProgressbar(container);
    JSON1.request(url, function(result){
          console.log(result);
          if(result.MajorCode == '000') {
              if (result.Data && result.Data.length > 0 && virtualAlarmHistoryList) {
                  //if ( virtualAlarmHistoryList.items.length > 0) {
                  virtualAlarmHistoryList.replaceAllItems(result.Data);
                  /*}else{
                      virtualAlarmHistoryList.appendItems(result.Data);
                  }    */
              }else{
                  App.addNotification({
                      hold: 3000,
                      message: LANGUAGE.ASSET_ALARM_HISTORY_MSG01
                  });
                  if (virtualAlarmHistoryList) {
                      virtualAlarmHistoryList.deleteAllItems();
                  }
              }
          }else{
              App.alert(LANGUAGE.PROMPT_MSG013);
          }

          App.hideProgressbar();
      },
      function(jqXHR, textStatus){ console.log(textStatus); App.hideProgressbar(); App.alert(LANGUAGE.COM_MSG02); })
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
		
		
        JSON1.requestPost(API_URL.URL_GET_COMMAND_HISTORY,data,function(result){
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
        //localStorage.notificationChecked = 0;

        JSON1.request(url, function(result){
                App.hideProgressbar();
                //localStorage.notificationChecked = 1;


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
                //localStorage.notificationChecked = 1;
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

   // App.alert(JSON.stringify(data));

    var message = '';
    if (currentState == 1) {
        data.State = 0;
        message = LANGUAGE.PROMPT_MSG018 + ' IMEI: '+TargetAsset.IMEI;
    }else{
        data.State = 1;
        message = LANGUAGE.PROMPT_MSG019 + ' IMEI: '+TargetAsset.IMEI;
    }

    JSON1.requestPost(API_URL.URL_CHANGE_NOTIFICATION_STATUS, data,function(result){
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


                if(typeof(msg.alarm) == 'string' && msg.alarm.toLowerCase() == "status" ){
                    loadPageStatus(msg);
                }else if(typeof(msg.alarm) == 'string' && msg.alarm.toLowerCase() == "config" ){
                	loadPageDeviceConfig(msg);
                }else if (parseFloat(msg.Lat) && parseFloat(msg.Lng)) {
                    loadPagePosition(msg);
                }else{
                    App.alert(LANGUAGE.PROMPT_MSG023);
                }

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


    if (msg && msg.title || msg && msg.AssetName) {
        var message = '';
        if (msg.title) {
        	message += msg.name + '</br>' + msg.title;
        }else{
        	message += msg.AssetName + '</br>' + msg.alarm;
        }
        App.addNotification({
            hold: 5000,
            message: message,
            closeOnClick: true,
            button: {
                text: LANGUAGE.COM_MSG16,
                close: false,
            },
            onClick: function () {
                processClickOnPushNotification([msg]);
            },
        });

    }/*else if (msg && msg.time && msg.name && msg.title) {
        $$('.notification_button').removeClass('new_not');

        mainView.router.loadPage('resources/templates/notification.html');
    }    */
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
    }else if (data.alarm == 'config') {
    	if (msg.CreateDateTime) {
            /*msg.CreateDateTime = moment.utc(msg.CreateDateTime).toDate();
            msg.CreateDateTime = moment(msg.CreateDateTime).format(window.COM_TIMEFORMAT);*/
            msg.CreateDateTime = msg.CreateDateTime.replace("T", " ");
        }
        loadPageDeviceConfig(msg);
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

function getAssetImg(params, imgFor){
    let self = this;
    let assetImg = '';
    let pattern = /^IMEI_/i;
    let pattern2 = 'ic_';
    let regex = /_/gi;
    let regex2 = /\.[^/.]+$/; //remove extension (.png, .jpg etc)
    let splitted = '';

    if (params && imgFor.assetList) {
        if (params.Icon && pattern.test(params.Icon)) {
            assetImg = `<img class="user-img user-img-shadow rounded" src="${API_DOMIAN9}Attachment/images/${params.Icon}?${ new Date().getTime() }" alt="">`;
        }else if(params.Icon && params.Icon.substring(0,3) == pattern2){
            assetImg = '<div class="user-img bg-color-custom display-flex justify-content-center align-items-center"><div class="text-align-center vertical-center size-28 "><i class="icon text-color-white asset-icon-'+params.Icon.replace(regex, '-').replace(regex2, '')+'"></i></div></div>';

        }else if (params.Name) {
            params.Name = $.trim(params.Name);
            splitted = params.Name.split(' ');
            if (splitted.length > 1) {
                let one = '';
                let two = '';
                for (let i = 0; i < splitted.length; i++) {
                    if (splitted[i] && splitted[i][0]) {
                        if (!one || !two) {
                            if (!one) {
                                one = splitted[i][0];
                            }else{
                                two = splitted[i][0];
                                break;
                            }
                        }
                    }
                }
                assetImg = '<div class="user-img bg-color-custom text-color-white display-flex justify-content-center align-items-center"><span class="size-24">'+one+two+'</span></div>';
            }else{
                assetImg = '<div class="user-img bg-color-custom text-color-white display-flex justify-content-center align-items-center"><span class="size-24">'+params.Name[0]+params.Name[1]+'</span></div>';
            }

        }else if(params.IMEI){
            assetImg = '<div class="user-img bg-color-custom text-color-white display-flex justify-content-center align-items-center"><span class="size-24">'+params.IMEI[0]+params.IMEI[1]+'</span></div>';
        }
    }else if (params && imgFor.assetEdit) {
        if (params.Icon && pattern.test(params.Icon)) {
            assetImg = `<img class="user-img user-img-shadow rounded" data-name="${params.Icon}" src="${API_DOMIAN9}Attachment/images/${params.Icon+'?'+ new Date().getTime()}" alt="">`;
        }/*else if(params.Icon && params.Icon.substring(0,3) == pattern2){
            assetImg = '<div class="user-img bg-color-custom display-flex justify-content-center align-items-center"><div class="text-align-center vertical-center size-75 "><i class="icon text-color-white asset-icon-'+params.Icon.replace(regex, '-').replace(regex2, '')+'"></i></div></div>';
        }*/else{
            assetImg = `<img class="user-img" src="resources/images/other_add_photo.svg" alt="">`;
        }

    }else{
        assetImg = false;
    }
    //console.log(assetImg);
    return assetImg;
}

/* EDIT PHOTO */

var cropper = null;
var resImg = null;

function initCropper(imgFor) {
    var image = document.getElementById('image');
    //alert(image);
    cropper = new Cropper(image, {
        aspectRatio: imgFor === 'installPhoto' ? NaN : 1 / 1,
        dragMode: 'move',
        rotatable: true,
        minCropBoxWidth: 200,
        minCropBoxHeight: 200,
        minCanvasWidth: 200,
        minCanvasHeight: 200,
        minContainerWidth: 200,
        minContainerHeight: 200,
        crop: function(data) {}
    });

}

function saveImg(params={}) {
    resImg = cropper.getCroppedCanvas({
        minWidth: 200,
        minHeight: 200
    }).toDataURL("image/jpeg",0.7);
    //resImg = cropper.getCroppedCanvas().toDataURL();



   /* if (TargetAsset.IMEI) {
        $$('.assets_list li[data-imei="' + TargetAsset.IMEI + '"] .item-media img').attr('src', resImg);
    }*/

    var assetImg = {
        data: resImg,
        id: 'IMEI_' + params.imei
    };
    if(params.imgFor === 'installPhoto'){
        assetImg.id += '_install_'+ new Date().getTime();
    }

    //App.showPreloader();
    showProgressBar()
    $.ajax({
        type: 'POST',
        url: API_URL.URL_PHOTO_UPLOAD,
        data: assetImg,
        async: true,
        cache: false,
        crossDomain: true,
        success: function(result) {
            //App.hidePreloader();
            hideProgressBar();
            //var res = JSON.stringify(result);
            //alert(res);
            result = typeof(result) == 'string' ? eval("(" + result + ")") : result;
            if (result.MajorCode == "000") {
                /*App.alert('Result Data:'+ result.Data);*/
               // TargetAsset.IMEI = result.Data;
                if(params.imgFor === 'installPhoto'){
                    $$('.install-photo-block .row').append(`<div class="col-50 tablet-25 install-photo-item"><img src="${resImg}" data-name="${API_DOMIAN9}Attachment/images/${result.Data}" alt=""><i class="f7-icons icon-other-delete-text-input color-red removePhoto"></i></div>`);
                    //App.alert(API_URL.URL_PHOTO_UPLOAD+'/'+result.Data);
                }else{
                    $$('.add_photo img.user-img').attr('src', resImg).addClass('user-img-shadow rounded').data('name', result.Data);
                }

            } else {
                App.alert(LANGUAGE.PROMPT_MSG013);
            }
            mainView.router.back();
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            App.alert(JSON.stringify(XMLHttpRequest))
            //App.hidePreloader();
            hideProgressBar();
            App.alert(LANGUAGE.COM_MSG02);
        }
    });

}

function getImage(source, imgFor, imei) {
    if (!navigator.camera) {
        alert("Camera API not supported", "Error");

    } else {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: source, // 0:Photo Library, 1=Camera, 2=Saved Album
            encodingType: 0 // 0=JPG 1=PNG
        };

        navigator.camera.getPicture(
            function(imgData) {
                //$('.media-object', this.$el).attr('src', "data:image/jpeg;base64,"+imgData);
                mainView.router.load({
                    url: 'resources/templates/edit.photo.html',
                    context: {
                        imgFor: imgFor,
                        imei: imei,
                        imgSrc: "data:image/jpeg;base64," + imgData
                    }
                });

            },
            function() {
                //alert('Error taking picture', 'Error');
            },
            options);
    }
}
/*
function getImage(source) {

    if (!navigator.camera) {
        alert("Camera API not supported", "Error");

    } else {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: source, // 0:Photo Library, 1=Camera, 2=Saved Album
            encodingType: 0 // 0=JPG 1=PNG
        };

        navigator.camera.getPicture(
            function(imgData) {
                //$('.media-object', this.$el).attr('src', "data:image/jpeg;base64,"+imgData);
                mainView.router.load({
                    url: 'resources/templates/edit.photo.html',
                    context: {
                        imgSrc: "data:image/jpeg;base64," + imgData
                    }
                });

            },
            function() {
                //alert('Error taking picture', 'Error');
            },
            options);
    }

}*/



function openBarCodeReader(input){
    //console.log(input);
    if(window.device && cordova.plugins && cordova.plugins.barcodeScanner) {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                  /*alert("We got a barcode\n" +
                        "Result: " + result.text + "\n" +
                        "Format: " + result.format + "\n" +
                        "Cancelled: " + result.cancelled);*/
                if (result && result.text) {
                    input.val(result.text);
                    input.change();  // fix to trigger onchange / oninput event listener
                }

            },
            function (error) {
                alert("Scanning failed: " + error);
            },
            {
                  //preferFrontCamera : true, // iOS and Android
                  showFlipCameraButton : true, // iOS and Android
                  showTorchButton : true, // iOS and Android
                  torchOn: true, // Android, launch with the torch switched on (if available)
                  //saveHistory: true, // Android, save scan history (default false)
                  prompt : "Place a barcode inside the scan area", // Android
                  resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
                  //formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
                  //orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
                  //disableAnimations : true, // iOS
                  //disableSuccessBeep: false // iOS and Android
            }
        );
    }else{
        App.alert('Your device does not support this function');
    }
}



function checkVinNumber(params){
        if (params && params.VIN) {
            var vinLength = params.VIN.length;
            console.log(vinLength);
            if (vinLength == 18){
                params.VIN = params.VIN.slice(1);
                getVehicleDetailsByVin(params);
            } else if(vinLength > 18 || vinLength < 17){
                App.modal({
                    title: '<div class="custom-modal-logo-wrapper"><img class="custom-modal-logo" src="resources/images/logo-dark.png" alt=""/></div>',
                    text: '<div class="custom-modal-text">' + LANGUAGE.PROMPT_MSG030 + ':</div>',
                    afterText: `
                <div class="list-block list-block-modal m-0 no-hairlines ">          
                    <ul>                               
                        <li>
                            <div class="item-content pl-0">                                    
                                <div class="item-inner pr-0">                                      
                                    <div class="item-input item-input-field">
                                        <input type="text" placeholder="${ LANGUAGE.ASSET_SETTINGS_MSG19 }" name="VIN-check" value="${ params.VIN }" >
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                `,
                    buttons: [{
                        text: LANGUAGE.COM_MSG04,
                    },
                        {
                            text: LANGUAGE.COM_MSG34,
                            bold: true,
                            onClick: function(modal, e) {
                                params.VIN = $$(modal).find('input[name="VIN-check"]').val();
                                params.inputs.Describe7.data('prev-val',params.VIN);
                                params.inputs.Describe7.val(params.VIN);
                                getVehicleDetailsByVin(params);
                            }
                        },
                    ]
                });
            }else{
                getVehicleDetailsByVin(params);
            }
        }
    }

function getVehicleDetailsByVin(params) {
    if (params && params.VIN) {
        var container = $$('body');
        if (container.children('.progressbar, .progressbar-infinite').length) return; //don't run all this if there is a current progressbar loading
        App.showProgressbar(container);

        $.ajax({
            type: "GET",
            url: API_URL.URL_GET_DETAILS_BY_VIN+params.VIN,
            dataType: 'json',
            async: true,
            cache: false,

            success: function(result){
                App.hideProgressbar();
                console.log(result);
                if (result) {
                    var vehicleDetailsArr = [];

                    if (result.make) {
                        vehicleDetailsArr.push({
                            name: LANGUAGE.ASSET_SETTINGS_MSG21,
                            value: result.make,
                            inputName: 'Describe1',
                        });
                    }
                    if (result.model) {
                        vehicleDetailsArr.push({
                            name: LANGUAGE.ASSET_SETTINGS_MSG22,
                            value: result.model,
                            inputName: 'Describe2',
                        });
                    }
                    if (result.color) {
                        vehicleDetailsArr.push({
                            name: LANGUAGE.ASSET_SETTINGS_MSG23,
                            value: result.color,
                            inputName: 'Describe3',
                        });
                    }
                    if (result.year) {
                        vehicleDetailsArr.push({
                            name: LANGUAGE.ASSET_SETTINGS_MSG24,
                            value: result.year,
                            inputName: 'Describe4',
                        });
                    }

                    if (vehicleDetailsArr.length) {
                        var message = LANGUAGE.PROMPT_MSG028;
                        for (var i = vehicleDetailsArr.length - 1; i >= 0; i--) {
                            message += '</br><b>' + vehicleDetailsArr[i].name + ': ' + vehicleDetailsArr[i].value + '</b>';
                        }
                        message += '</br>' + LANGUAGE.PROMPT_MSG029;

                        App.confirm(message, function () {
                            for (var i = vehicleDetailsArr.length - 1; i >= 0; i--) {
                                params.inputs[vehicleDetailsArr[i].inputName].val(vehicleDetailsArr[i].value);
                            }
                        });
                    }
                }

            },
            error: function(XMLHttpRequest, textStatus, errorThrown){
                App.hideProgressbar();
                console.log(XMLHttpRequest);
                console.log(textStatus);
                console.log(errorThrown);
                App.alert(LANGUAGE.PROMPT_MSG027);

            }
        });
    }
}

