String.prototype.format = function (e) { var t = this; if (arguments.length > 0) if (arguments.length == 1 && typeof e == "object") { for (var n in e) if (e[n] != undefined) { var r = new RegExp("({" + n + "})", "g"); t = t.replace(r, e[n]) } } else for (var i = 0; i < arguments.length; i++) if (arguments[i] != undefined) { var r = new RegExp("({)" + i + "(})", "g"); t = t.replace(r, arguments[i]) } return t };
String.prototype.subStrEx = function (e) { return this.length + 3 > e ? this.substr(0, e) + "..." : this };
function isUndefined(e) { return "undefined" == typeof e };
var JSON1 = {};
JSON1.request=function(url,success,error){
    $.ajax( {
        async: true, url: url, type: "GET", dataType: "json", timeout: 15000
    } )
        .done(function(result) {
            if (typeof (success) == 'function') {
                success(typeof (result) == 'string' ? eval(result) : result)
            }
        })
        .fail(function(jqXHR, textStatus) {
            if (typeof (error) == 'function') {
                error(jqXHR, textStatus)
            }
        })
        .always(function() {
            //alert( "complete" );
        });
    /*if(url.indexOf("&callback=?")<0){if(url.indexOf("?")>0){url+="&callback=?"}else{url+="?callback=?"}}$.ajax({async:true,url:url,type:"get",dataType:"jsonp",jsonp:"callback",success:function(result){if(typeof(success)=='function'){success(typeof(result)=='string'?eval(result):result)}},error:function(){if(typeof(error)=='function'){error()}}})*/
};
JSON.jsonp=function(url,funcCallback){window.parseLocation=function(results){var response=$.parseJSON(results);document.body.removeChild(document.getElementById('getJsonP'));delete window.parseLocation;if(funcCallback){funcCallback(response)}};function getJsonP(url){url=url+'&callback=parseLocation';var script=document.createElement('script');script.id='getJsonP';script.src=url;script.async=true;document.body.appendChild(script)}if(XMLHttpRequest){var xhr=new XMLHttpRequest();if('withCredentials'in xhr){var xhr=new XMLHttpRequest();xhr.onreadystatechange=function(){if(xhr.readyState==4){if(xhr.status==200){var response=$.parseJSON(xhr.responseText);if(funcCallback){funcCallback(response)}}else if(xhr.status==0||xhr.status==400){getJsonP(url)}else{}}};xhr.open('GET',url,true);xhr.send()}else if(XDomainRequest){var xdr=new XDomainRequest();xdr.onerror=function(err){};xdr.onload=function(){var response=JSON.parse(xdr.responseText);if(funcCallback){funcCallback(response)}};xdr.open('GET',url);xdr.send()}else{getJsonP(url)}}};
JSON1.requestPost=function(url,data,success,error) {
    $.ajax( {
            async: true, url: url, data: data, type: "POST", dataType: "json", timeout: 15000
        } )
        .done(function(result) {
            console.log(result)
            if (typeof (success) == 'function') {
                success(typeof (result) == 'string' ? eval(result) : result)
            }
        })
        .fail(function(jqXHR, textStatus) {
            console.log(jqXHR)
            if (typeof (error) == 'function') {
                error(jqXHR, textStatus)
            }
        })
        .always(function() {
            //alert( "complete" );
        });
}
  /*  $.ajax({async:true,url:url,data:data,type:"POST",dataType:"json",timeout: 3000,success:function(result){if(typeof(success)=='function'){success(typeof(result)=='string'?eval(result):result)}},error:function(){if(typeof(error)=='function'){error()}}})};*/

CustomerInfo = {};
CustomerInfo.TimeZone = moment().utcOffset() / 60;

Protocol = {
    MarkerIcon: [
        L.icon({
            iconUrl: 'resources/images/marker.svg',
            iconSize:     [60, 60], // size of the icon
            iconAnchor:   [17, 55], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -60] // point from which the popup should open relative to the iconAnchor
        }),
        L.icon({
            iconUrl: 'resources/images/marker2.svg',
            iconSize:     [60, 60], // size of the icon
            iconAnchor:   [17, 55], // point of the icon which will correspond to marker's location
            popupAnchor:  [0, -60] // point from which the popup should open relative to the iconAnchor
        })
    ],
    PermissionsEnum: {
       /* "ActLive" : 1,
        "ActProtect": 8,*/
       SendCommands: 1,
       ReplaceSIM: 2,
       ReplaceIMEI: 4,
       EditAsset: 8,
       InstallationNotice: 16,
       ActivateDevice: 32,
       DeactivateDevice: 64,
       SuspendSIM: 128,
    },

    PositionTypes: {
        "NONE": 0,
        "GPS": 1,
        "LBS": 2,
        "GPSLBS": 3,
        "IRIDIUM": 4,
        "COMPASS": 8,
        "GLONASS": 16
    },
    DeviceStatus: {
        "Disable": 0,
        "Normal": 1,
        "Overdue": -1
    },
    PositionAlerts: {
        "None": 0,
        "Custom": 1,
        "SOS": 2,
        "ElectricCutoff": 4,
        "InGeoFance": 8,
        "OutGeoFance": 16,
        "HighSpeed": 32,
        "LowSpeed": 64,
        "Theft": 128,
        "Vibrate": 256,
        "LowPower": 512,
        "Moving": 1024,
        "Fire": 2048,
        "MedicalHelp": 4096,
        "Defence": 8192,
        "Destroy": 16384,
        "ACCON": 32768,
        "ACCOFF": 65536,
        "INPUT1": 131072,
        "INPUT2": 262144,
        "INPUT1_LOW": 524288,
        "INPUT2_LOW": 1048576,
        "HardBrake": 2097152,
        "LowTemp": 4194304,
        "HighTemp": 8388608
    },
    PositionStatus: {
        "NONE": 0,
        "ACC": 1,
        "Static": 2,
        "Power": 4,
        "Charging": 8,
        "BeProtected": 16,
        "ACC2": 32,
        "ForceSave": 2097152
    },
    EventClasses: {
        "PROTOCOL_DEFINED": 0,
        "ALERT": 1,
        "ACC": 2,
        "STATIC": 4,
        "COMMAND": 8,
        "POI": 16,
        "ACC2": 32,
        "GEOLOCK": 64,
        "ACC3": 128,
        "SERVICEINTERVAL": 256
    },
    EventCommandTypes: {
        "NONE": 0,
        "REQUEST": 1,
        "RESPONSE": 2
    },
    ProductFeatures : {
        "Static":256,
        "Holder":32768,
        "FuelSensor":2048,
        "Acc":128,
        "Direct":4,
        "Acc2":131072,
        "LatLng":1,
        "GpsSignal":64,
        "OBD":8192,
        "Battery":1024,
        "DrivingTime":65536,
        "RFIDCard":16384,
        "GsmSignal":32,
        "Mileage":16,
        "None":0,
        "TempSensor":4096,
        "Alt":2,
        "Speed":8,
        "Voltage":512
    },
    Helper: {
        getSpeedValue: function (speedUnit, speed) {
            var ret = 0;
            switch (speedUnit) {
                case "KT":
                    ret = parseInt(speed  * 0.53995680345572);
                    break;
                case "KPH":
                    ret = parseInt(speed);
                    break;
                case "MPS":
                    ret = parseInt(speed * 0.277777778);
                    break;
                case "MPH":
                    ret = parseInt(speed * 0.621371192);
                    break;
                default:
                    break;
            }
            return ret;
        },
        getSpeedUnit: function (speedUnit) {
            var ret = "";
            switch (speedUnit) {
                case "KT":
                    ret = "kt";
                    break;
                case "KPH":
                    ret = "km/h";
                    break;
                case "MPS":
                    ret = "m/s";
                    break;
                case "MPH":
                    ret = "mile/h";
                    break;
                default:
                    break;
            }
            return ret;
        },
        getMileageValue: function (speedUnit, mileage) {
            var ret = 0;
            switch (speedUnit) {
                case "KT":
                    ret = parseInt(mileage * 0.53995680345572);
                    break;
                case "KPH":
                    ret = parseInt(mileage);
                    break;
                case "MPS":
                    ret = parseInt(mileage * 1000);
                    break;
                case "MPH":
                    ret = parseInt(mileage * 0.62137119223733);
                    break;
                default:
                    break;
            }
            return ret;
        },
        getMileageUnit: function (speedUnit) {
            var ret = "";
            switch (speedUnit) {
                case "KT":
                    ret = "mile";
                    break;
                case "KPH":
                    ret = "km";
                    break;
                case "MPS":
                    ret = "m";
                    break;
                case "MPH":
                    ret = "mile";
                    break;
                default:
                    break;
            }
            return ret;
        },
        getDirectionCardinal: function(direction){
            var ret = "";
            direction = parseFloat(direction);
            switch (true){
                case (direction >= 338 || direction <= 22 ):
                    ret = LANGUAGE.COM_MSG22;
                    break;
                case (direction >= 23 && direction <= 75 ):
                    ret = LANGUAGE.COM_MSG23;
                    break;
                case (direction >= 76 && direction <= 112 ):
                    ret = LANGUAGE.COM_MSG24;
                    break;
                case (direction >= 113 && direction <= 157 ):
                    ret = LANGUAGE.COM_MSG25;
                    break;
                case (direction >= 158 && direction <= 202 ):
                    ret = LANGUAGE.COM_MSG26;
                    break;
                case (direction >= 203 && direction <= 247 ):
                    ret = LANGUAGE.COM_MSG27;
                    break;
                case (direction >= 248 && direction <= 292 ):
                    ret = LANGUAGE.COM_MSG28;
                    break;
                case (direction >= 293 && direction <= 337 ):
                    ret = LANGUAGE.COM_MSG29;
                    break;
                default: ret = LANGUAGE.COM_MSG30;
            }
            return ret;
        },
        getPermissions: function(permissionCode){
            var ret = {};

            if (permissionCode) {
                permissionCode = parseInt(permissionCode);
            }
            $.each(Protocol.PermissionsEnum, function(index, value) {
                if ((permissionCode & value) > 0) {
                    ret[index] = true;
                }else{
                    ret[index] = false;
                }
            });


            return ret;
        },
        getTimezoneList: function(selected){
            let ret = [
                { Value: '-12_Dateline Standard Time', Name: '(UTC-12:00) International Date Line West' },
                { Value: '-10_Hawaiian Standard Time', Name: '(UTC-10:00) Hawaii' },
                { Value: '-9_Alaskan Standard Time', Name: '(UTC-09:00) Alaska' },
                { Value: '-8_Pacific Standard Time (Mexico)', Name: '(UTC-08:00) Baja California' },
                { Value: '-8_Pacific Standard Time', Name: '(UTC-08:00) Pacific Time (US & Canada)' },
                { Value: '-7_US Mountain Standard Time', Name: '(UTC-07:00) Arizona' },
                { Value: '-7_Mountain Standard Time (Mexico)', Name: '(UTC-07:00) Chihuahua, La Paz, Mazatlan' },
                { Value: '-7_Mountain Standard Time', Name: '(UTC-07:00) Mountain Time (US & Canada)' },
                { Value: '-6_Central America Standard Time', Name: '(UTC-06:00) Central America' },
                { Value: '-6_Central Standard Time', Name: '(UTC-06:00) Central Time (US & Canada)' },
                { Value: '-6_Central Standard Time (Mexico)', Name: '(UTC-06:00) Guadalajara, Mexico City, Monterrey' },
                { Value: '-6_Canada Central Standard Time', Name: '(UTC-06:00) Saskatchewan' },
                { Value: '-5_SA Pacific Standard Time', Name: '(UTC-05:00) Bogota, Lima, Quito, Rio Branco' },
                { Value: '-5_Eastern Standard Time', Name: '(UTC-05:00) Eastern Time (US & Canada)' },
                { Value: '-5_US Eastern Standard Time', Name: '(UTC-05:00) Indiana (East)' },
                { Value: '-4.5_Venezuela Standard Time', Name: '(UTC-04:30) Caracas' },
                { Value: '-4_Paraguay Standard Time', Name: '(UTC-04:00) Asuncion' },
                { Value: '-4_Atlantic Standard Time', Name: '(UTC-04:00) Atlantic Time (Canada)' },
                { Value: '-4_Central Brazilian Standard Time', Name: '(UTC-04:00) Cuiaba' },
                { Value: '-4_SA Western Standard Time', Name: '(UTC-04:00) Georgetown, La Paz, Manaus, San Juan' },
                { Value: '-4_Pacific SA Standard Time', Name: '(UTC-04:00) Santiago' },
                { Value: '-3.5_Newfoundland Standard Time', Name: '(UTC-03:30) Newfoundland' },
                { Value: '-3_E. South America Standard Time', Name: '(UTC-03:00) Brasilia' },
                { Value: '-3_Argentina Standard Time', Name: '(UTC-03:00) Buenos Aires' },
                { Value: '-3_SA Eastern Standard Time', Name: '(UTC-03:00) Cayenne, Fortaleza' },
                { Value: '-3_Greenland Standard Time', Name: '(UTC-03:00) Greenland' },
                { Value: '-3_Montevideo Standard Time', Name: '(UTC-03:00) Montevideo' },
                { Value: '-3_Bahia Standard Time', Name: '(UTC-03:00) Salvador' },
                { Value: '-2_Mid-Atlantic Standard Time', Name: '(UTC-02:00) Mid-Atlantic - Old' },
                { Value: '-1_Azores Standard Time', Name: '(UTC-01:00) Azores' },
                { Value: '-1_Cape Verde Standard Time', Name: '(UTC-01:00) Cape Verde Is.' },
                { Value: '0_Morocco Standard Time', Name: '(UTC) Casablanca' },
                { Value: '0_UTC', Name: '(UTC) Coordinated Universal Time' },
                { Value: '0_GMT Standard Time', Name: '(UTC) Dublin, Edinburgh, Lisbon, London' },
                { Value: '0_Greenwich Standard Time', Name: '(UTC) Monrovia, Reykjavik' },
                { Value: '1_W. Europe Standard Time', Name: '(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna' },
                { Value: '1_Central Europe Standard Time', Name: '(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague' },
                { Value: '1_Romance Standard Time', Name: '(UTC+01:00) Brussels, Copenhagen, Madrid, Paris' },
                { Value: '1_Central European Standard Time', Name: '(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb' },
                { Value: '1_W. Central Africa Standard Time', Name: '(UTC+01:00) West Central Africa' },
                { Value: '1_Namibia Standard Time', Name: '(UTC+01:00) Windhoek' },
                { Value: '2_Jordan Standard Time', Name: '(UTC+02:00) Amman' },
                { Value: '2_GTB Standard Time', Name: '(UTC+02:00) Athens, Bucharest' },
                { Value: '2_Middle East Standard Time', Name: '(UTC+02:00) Beirut' },
                { Value: '2_Egypt Standard Time', Name: '(UTC+02:00) Cairo' },
                { Value: '2_Syria Standard Time', Name: '(UTC+02:00) Damascus' },
                { Value: '2_E. Europe Standard Time', Name: '(UTC+02:00) E. Europe' },
                { Value: '2_South Africa Standard Time', Name: '(UTC+02:00) Harare, Pretoria' },
                { Value: '2_FLE Standard Time', Name: '(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius' },
                { Value: '2_Turkey Standard Time', Name: '(UTC+02:00) Istanbul' },
                { Value: '2_Israel Standard Time', Name: '(UTC+02:00) Jerusalem' },
                { Value: '2_Libya Standard Time', Name: '(UTC+02:00) Tripoli' },
                { Value: '3_Arabic Standard Time', Name: '(UTC+03:00) Baghdad' },
                { Value: '3_Kaliningrad Standard Time', Name: '(UTC+03:00) Kaliningrad, Minsk' },
                { Value: '3_Arab Standard Time', Name: '(UTC+03:00) Kuwait, Riyadh' },
                { Value: '3_E. Africa Standard Time', Name: '(UTC+03:00) Nairobi' },
                { Value: '3.5_Iran Standard Time', Name: '(UTC+03:30) Tehran' },
                { Value: '4_Arabian Standard Time', Name: '(UTC+04:00) Abu Dhabi, Muscat' },
                { Value: '4_Azerbaijan Standard Time', Name: '(UTC+04:00) Baku' },
                { Value: '4_Russian Standard Time', Name: '(UTC+04:00) Moscow, St. Petersburg, Volgograd' },
                { Value: '4_Mauritius Standard Time', Name: '(UTC+04:00) Port Louis' },
                { Value: '4_Georgian Standard Time', Name: '(UTC+04:00) Tbilisi' },
                { Value: '4_Caucasus Standard Time', Name: '(UTC+04:00) Yerevan' },
                { Value: '4.5_Afghanistan Standard Time', Name: '(UTC+04:30) Kabul' },
                { Value: '5_West Asia Standard Time', Name: '(UTC+05:00) Ashgabat, Tashkent' },
                { Value: '5_Pakistan Standard Time', Name: '(UTC+05:00) Islamabad, Karachi' },
                { Value: '5.5_India Standard Time', Name: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
                { Value: '5.5_Sri Lanka Standard Time', Name: '(UTC+05:30) Sri Jayawardenepura' },
                { Value: '5.75_Nepal Standard Time', Name: '(UTC+05:45) Kathmandu' },
                { Value: '6_Central Asia Standard Time', Name: '(UTC+06:00) Astana' },
                { Value: '6_Bangladesh Standard Time', Name: '(UTC+06:00) Dhaka' },
                { Value: '6_Ekaterinburg Standard Time', Name: '(UTC+06:00) Ekaterinburg' },
                { Value: '6.5_Myanmar Standard Time', Name: '(UTC+06:30) Yangon (Rangoon)' },
                { Value: '7_SE Asia Standard Time', Name: '(UTC+07:00) Bangkok, Hanoi, Jakarta' },
                { Value: '7_N. Central Asia Standard Time', Name: '(UTC+07:00) Novosibirsk' },
                { Value: '8_China Standard Time', Name: '(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi' },
                { Value: '8_North Asia Standard Time', Name: '(UTC+08:00) Krasnoyarsk' },
                { Value: '8_Singapore Standard Time', Name: '(UTC+08:00) Kuala Lumpur, Singapore' },
                { Value: '8_W. Australia Standard Time', Name: '(UTC+08:00) Perth' },
                { Value: '8_Taipei Standard Time', Name: '(UTC+08:00) Taipei' },
                { Value: '8_Ulaanbaatar Standard Time', Name: '(UTC+08:00) Ulaanbaatar' },
                { Value: '9_North Asia East Standard Time', Name: '(UTC+09:00) Irkutsk' },
                { Value: '9_Tokyo Standard Time', Name: '(UTC+09:00) Osaka, Sapporo, Tokyo' },
                { Value: '9_Korea Standard Time', Name: '(UTC+09:00) Seoul' },
                { Value: '9.5_Cen. Australia Standard Time', Name: '(UTC+09:30) Adelaide' },
                { Value: '9.5_AUS Central Standard Time', Name: '(UTC+09:30) Darwin' },
                { Value: '10_E. Australia Standard Time', Name: '(UTC+10:00) Brisbane' },
                { Value: '10_AUS Eastern Standard Time', Name: '(UTC+10:00) Canberra, Melbourne, Sydney' },
                { Value: '10_West Pacific Standard Time', Name: '(UTC+10:00) Guam, Port Moresby' },
                { Value: '10_Tasmania Standard Time', Name: '(UTC+10:00) Hobart' },
                { Value: '10_Yakutsk Standard Time', Name: '(UTC+10:00) Yakutsk' },
                { Value: '11_Central Pacific Standard Time', Name: '(UTC+11:00) Solomon Is., New Caledonia' },
                { Value: '11_Vladivostok Standard Time', Name: '(UTC+11:00) Vladivostok' },
                { Value: '12_New Zealand Standard Time', Name: '(UTC+12:00) Auckland, Wellington' },
                { Value: '12_Fiji Standard Time', Name: '(UTC+12:00) Fiji' },
                { Value: '12_Magadan Standard Time', Name: '(UTC+12:00) Magadan' },
                { Value: '12_Kamchatka Standard Time', Name: '(UTC+12:00) Petropavlovsk-Kamchatsky - Old' },
                { Value: '13_Tonga Standard Time', Name: '(UTC+13:00) Nuku\'alofa' },
                { Value: '13_Samoa Standard Time', Name: '(UTC+13:00) Samoa' },
            ];
            if (selected) {
                let index = ret.findIndex( el => el.Value == selected);
                if(index !== -1){
                    ret[index].State = true;
                }else{
                    index = ret.findIndex( el => parseFloat(el.Value) == selected);
                    if(index !== -1) {
                        ret[index].State = true;
                    }
                }
            }

            return ret;
        },
        getCountrys: function () {
            return [
                {	CountryCode: 'ABW',	CountryPhoneCode: '+297',	Country: 'Aruba',	},
                {	CountryCode: 'AFG',	CountryPhoneCode: '+93',	Country: 'Afghanistan',	},
                {	CountryCode: 'AGO',	CountryPhoneCode: '+244',	Country: 'Angola',	},
                {	CountryCode: 'AIA',	CountryPhoneCode: '+1',	Country: 'Anguilla',	},
                {	CountryCode: 'ALB',	CountryPhoneCode: '+355',	Country: 'Albania',	},
                {	CountryCode: 'AND',	CountryPhoneCode: '+376',	Country: 'Andorra',	},
                {	CountryCode: 'ANT',	CountryPhoneCode: '+376',	Country: 'Netherlands Antilles',	},
                {	CountryCode: 'ARE',	CountryPhoneCode: '+971',	Country: 'United Arab Emirates',	},
                {	CountryCode: 'ARG',	CountryPhoneCode: '+54',	Country: 'Argentina',	},
                {	CountryCode: 'ARM',	CountryPhoneCode: '+374',	Country: 'Armenia',	},
                {	CountryCode: 'ASM',	CountryPhoneCode: '+1',	Country: 'American Samoa',	},
                {	CountryCode: 'ATA',	CountryPhoneCode: '+1',	Country: 'Antarctica',	},
                {	CountryCode: 'ATF',	CountryPhoneCode: '+1',	Country: 'French Southern territories',	},
                {	CountryCode: 'ATG',	CountryPhoneCode: '+1',	Country: 'Antigua and Barbuda',	},
                {	CountryCode: 'AUS',	CountryPhoneCode: '+61',	Country: 'Australia',	},
                {	CountryCode: 'AUT',	CountryPhoneCode: '+43',	Country: 'Austria',	},
                {	CountryCode: 'AZE',	CountryPhoneCode: '+994',	Country: 'Azerbaijan',	},
                {	CountryCode: 'BDI',	CountryPhoneCode: '+257',	Country: 'Burundi',	},
                {	CountryCode: 'BEL',	CountryPhoneCode: '+32',	Country: 'Belgium',	},
                {	CountryCode: 'BEN',	CountryPhoneCode: '+229',	Country: 'Benin',	},
                {	CountryCode: 'BFA',	CountryPhoneCode: '+226',	Country: 'Burkina Faso',	},
                {	CountryCode: 'BGD',	CountryPhoneCode: '+880',	Country: 'Bangladesh',	},
                {	CountryCode: 'BGR',	CountryPhoneCode: '+359',	Country: 'Bulgaria',	},
                {	CountryCode: 'BHR',	CountryPhoneCode: '+973',	Country: 'Bahrain',	},
                {	CountryCode: 'BHS',	CountryPhoneCode: '+1',	Country: 'Bahamas',	},
                {	CountryCode: 'BIH',	CountryPhoneCode: '+387',	Country: 'Bosnia and Herzegovina',	},
                {	CountryCode: 'BLR',	CountryPhoneCode: '+375',	Country: 'Belarus',	},
                {	CountryCode: 'BLZ',	CountryPhoneCode: '+501',	Country: 'Belize',	},
                {	CountryCode: 'BMU',	CountryPhoneCode: '+1',	Country: 'Bermuda',	},
                {	CountryCode: 'BOL',	CountryPhoneCode: '+591',	Country: 'Bolivia',	},
                {	CountryCode: 'BRA',	CountryPhoneCode: '+55',	Country: 'Brazil',	},
                {	CountryCode: 'BRB',	CountryPhoneCode: '+1',	Country: 'Barbados',	},
                {	CountryCode: 'BRN',	CountryPhoneCode: '+673',	Country: 'Brunei',	},
                {	CountryCode: 'BTN',	CountryPhoneCode: '+975',	Country: 'Bhutan',	},
                {	CountryCode: 'BVT',	CountryPhoneCode: '+975',	Country: 'Bouvet Island',	},
                {	CountryCode: 'BWA',	CountryPhoneCode: '+267',	Country: 'Botswana',	},
                {	CountryCode: 'CAF',	CountryPhoneCode: '+236',	Country: 'Central African Republic',	},
                {	CountryCode: 'CAN',	CountryPhoneCode: '+1',	Country: 'Canada',	},
                {	CountryCode: 'CCK',	CountryPhoneCode: '+1',	Country: 'Cocos (Keeling) Islands',	},
                {	CountryCode: 'CHE',	CountryPhoneCode: '+41',	Country: 'Switzerland',	},
                {	CountryCode: 'CHL',	CountryPhoneCode: '+56',	Country: 'Chile',	},
                {	CountryCode: 'CHN',	CountryPhoneCode: '+86',	Country: 'China',	},
                {	CountryCode: 'CIV',	CountryPhoneCode: '+225',	Country: 'Cote d\'Ivoire',	},
                {	CountryCode: 'CMR',	CountryPhoneCode: '+237',	Country: 'Cameroon',	},
                {	CountryCode: 'COD',	CountryPhoneCode: '+242',	Country: 'Congo(COD)',	},
                {	CountryCode: 'COG',	CountryPhoneCode: '+243',	Country: 'Congo(COG)',	},
                {	CountryCode: 'COK',	CountryPhoneCode: '+682',	Country: 'Cook Islands',	},
                {	CountryCode: 'COL',	CountryPhoneCode: '+57',	Country: 'Colombia',	},
                {	CountryCode: 'COM',	CountryPhoneCode: '+269',	Country: 'Comoros',	},
                {	CountryCode: 'CPV',	CountryPhoneCode: '+238',	Country: 'Cape Verde',	},
                {	CountryCode: 'CRI',	CountryPhoneCode: '+506',	Country: 'Costa Rica',	},
                {	CountryCode: 'CUB',	CountryPhoneCode: '+53',	Country: 'Cuba',	},
                {	CountryCode: 'CXR',	CountryPhoneCode: '+1',	Country: 'Christmas Island',	},
                {	CountryCode: 'CYM',	CountryPhoneCode: '+1',	Country: 'Cayman Islands',	},
                {	CountryCode: 'CYP',	CountryPhoneCode: '+357',	Country: 'Cyprus',	},
                {	CountryCode: 'CZE',	CountryPhoneCode: '+420',	Country: 'Czech Republic',	},
                {	CountryCode: 'DEU',	CountryPhoneCode: '+49',	Country: 'Germany',	},
                {	CountryCode: 'DJI',	CountryPhoneCode: '+253',	Country: 'Djibouti',	},
                {	CountryCode: 'DMA',	CountryPhoneCode: '+1',	Country: 'Dominica',	},
                {	CountryCode: 'DNK',	CountryPhoneCode: '+45',	Country: 'Denmark',	},
                {	CountryCode: 'DOM',	CountryPhoneCode: '+1',	Country: 'Dominican Republic',	},
                {	CountryCode: 'DZA',	CountryPhoneCode: '+213',	Country: 'Algeria',	},
                {	CountryCode: 'ECU',	CountryPhoneCode: '+593',	Country: 'Ecuador',	},
                {	CountryCode: 'EGY',	CountryPhoneCode: '+20',	Country: 'Egypt',	},
                {	CountryCode: 'ERI',	CountryPhoneCode: '+291',	Country: 'Eritrea',	},
                {	CountryCode: 'ESH',	CountryPhoneCode: '+212',	Country: 'Western Sahara',	},
                {	CountryCode: 'ESP',	CountryPhoneCode: '+34',	Country: 'Spain',	},
                {	CountryCode: 'EST',	CountryPhoneCode: '+372',	Country: 'Estonia',	},
                {	CountryCode: 'ETH',	CountryPhoneCode: '+251',	Country: 'Ethiopia',	},
                {	CountryCode: 'FIN',	CountryPhoneCode: '+358',	Country: 'Finland',	},
                {	CountryCode: 'FJI',	CountryPhoneCode: '+679',	Country: 'Fiji Islands',	},
                {	CountryCode: 'FLK',	CountryPhoneCode: '+500',	Country: 'Falkland Islands',	},
                {	CountryCode: 'FRA',	CountryPhoneCode: '+33',	Country: 'France',	},
                {	CountryCode: 'FRO',	CountryPhoneCode: '+298',	Country: 'Faroe Islands',	},
                {	CountryCode: 'FSM',	CountryPhoneCode: '+691',	Country: 'Federated States of Micronesia',	},
                {	CountryCode: 'GAB',	CountryPhoneCode: '+241',	Country: 'Gabon',	},
                {	CountryCode: 'GBR',	CountryPhoneCode: '+44',	Country: 'United Kingdom',	},
                {	CountryCode: 'GEO',	CountryPhoneCode: '+995',	Country: 'Georgia',	},
                {	CountryCode: 'GHA',	CountryPhoneCode: '+233',	Country: 'Ghana',	},
                {	CountryCode: 'GIB',	CountryPhoneCode: '+350',	Country: 'Gibraltar',	},
                {	CountryCode: 'GIN',	CountryPhoneCode: '+224',	Country: 'Guinea',	},
                {	CountryCode: 'GLP',	CountryPhoneCode: '+590',	Country: 'Guadeloupe',	},
                {	CountryCode: 'GMB',	CountryPhoneCode: '+220',	Country: 'Gambia',	},
                {	CountryCode: 'GNB',	CountryPhoneCode: '+245',	Country: 'Guinea-Bissau',	},
                {	CountryCode: 'GNQ',	CountryPhoneCode: '+240',	Country: 'Equatorial Guinea',	},
                {	CountryCode: 'GRC',	CountryPhoneCode: '+30',	Country: 'Greece',	},
                {	CountryCode: 'GRD',	CountryPhoneCode: '+1',	Country: 'Grenada',	},
                {	CountryCode: 'GRL',	CountryPhoneCode: '+299',	Country: 'Greenland',	},
                {	CountryCode: 'GTM',	CountryPhoneCode: '+502',	Country: 'Guatemala',	},
                {	CountryCode: 'GUF',	CountryPhoneCode: '+594',	Country: 'French Guiana',	},
                {	CountryCode: 'GUM',	CountryPhoneCode: '+1',	Country: 'Guam',	},
                {	CountryCode: 'GUY',	CountryPhoneCode: '+592',	Country: 'Guyana',	},
                {	CountryCode: 'HKG',	CountryPhoneCode: '+852',	Country: 'Hong Kong',	},
                {	CountryCode: 'HMD',	CountryPhoneCode: '+592',	Country: 'Heard Island and McDonald Islands',	},
                {	CountryCode: 'HND',	CountryPhoneCode: '+504',	Country: 'Honduras',	},
                {	CountryCode: 'HRV',	CountryPhoneCode: '+385',	Country: 'Croatia',	},
                {	CountryCode: 'HTI',	CountryPhoneCode: '+509',	Country: 'Haiti',	},
                {	CountryCode: 'HUN',	CountryPhoneCode: '+36',	Country: 'Hungary',	},
                {	CountryCode: 'IDN',	CountryPhoneCode: '+62',	Country: 'Indonesia',	},
                {	CountryCode: 'IND',	CountryPhoneCode: '+91',	Country: 'India',	},
                {	CountryCode: 'IOT',	CountryPhoneCode: '+246',	Country: 'British Indian Ocean Territory',	},
                {	CountryCode: 'IRL',	CountryPhoneCode: '+353',	Country: 'Ireland',	},
                {	CountryCode: 'IRN',	CountryPhoneCode: '+98',	Country: 'Iran',	},
                {	CountryCode: 'IRQ',	CountryPhoneCode: '+964',	Country: 'Iraq',	},
                {	CountryCode: 'ISL',	CountryPhoneCode: '+354',	Country: 'Iceland',	},
                {	CountryCode: 'ISR',	CountryPhoneCode: '+972',	Country: 'Israel',	},
                {	CountryCode: 'ITA',	CountryPhoneCode: '+39',	Country: 'Italy',	},
                {	CountryCode: 'JAM',	CountryPhoneCode: '+1',	Country: 'Jamaica',	},
                {	CountryCode: 'JOR',	CountryPhoneCode: '+962',	Country: 'Jordan',	},
                {	CountryCode: 'JPN',	CountryPhoneCode: '+81',	Country: 'Japan',	},
                {	CountryCode: 'KAZ',	CountryPhoneCode: '+7',	Country: 'Kazakstan',	},
                {	CountryCode: 'KEN',	CountryPhoneCode: '+254',	Country: 'Kenya',	},
                {	CountryCode: 'KGZ',	CountryPhoneCode: '+996',	Country: 'Kyrgyzstan',	},
                {	CountryCode: 'KHM',	CountryPhoneCode: '+855',	Country: 'Cambodia',	},
                {	CountryCode: 'KIR',	CountryPhoneCode: '+686',	Country: 'Kiribati',	},
                {	CountryCode: 'KNA',	CountryPhoneCode: '+1',	Country: 'Saint Kitts and Nevis',	},
                {	CountryCode: 'KOR',	CountryPhoneCode: '+850',	Country: 'South Korea',	},
                {	CountryCode: 'KWT',	CountryPhoneCode: '+965',	Country: 'Kuwait',	},
                {	CountryCode: 'LAO',	CountryPhoneCode: '+965',	Country: 'Laos',	},
                {	CountryCode: 'LBN',	CountryPhoneCode: '+961',	Country: 'Lebanon',	},
                {	CountryCode: 'LBR',	CountryPhoneCode: '+231',	Country: 'Liberia',	},
                {	CountryCode: 'LBY',	CountryPhoneCode: '+218',	Country: 'Libyan Arab Jamahiriya',	},
                {	CountryCode: 'LCA',	CountryPhoneCode: '+1',	Country: 'Saint Lucia',	},
                {	CountryCode: 'LIE',	CountryPhoneCode: '+423',	Country: 'Liechtenstein',	},
                {	CountryCode: 'LKA',	CountryPhoneCode: '+94',	Country: 'Sri Lanka',	},
                {	CountryCode: 'LSO',	CountryPhoneCode: '+266',	Country: 'Lesotho',	},
                {	CountryCode: 'LTU',	CountryPhoneCode: '+370',	Country: 'Lithuania',	},
                {	CountryCode: 'LUX',	CountryPhoneCode: '+352',	Country: 'Luxembourg',	},
                {	CountryCode: 'LVA',	CountryPhoneCode: '+371',	Country: 'Latvia',	},
                {	CountryCode: 'MAC',	CountryPhoneCode: '+853',	Country: 'Macao',	},
                {	CountryCode: 'MAR',	CountryPhoneCode: '+212',	Country: 'Morocco',	},
                {	CountryCode: 'MCO',	CountryPhoneCode: '+377',	Country: 'Monaco',	},
                {	CountryCode: 'MDA',	CountryPhoneCode: '+373',	Country: 'Moldova',	},
                {	CountryCode: 'MDG',	CountryPhoneCode: '+261',	Country: 'Madagascar',	},
                {	CountryCode: 'MDV',	CountryPhoneCode: '+960',	Country: 'Maldives',	},
                {	CountryCode: 'MEX',	CountryPhoneCode: '+52',	Country: 'Mexico',	},
                {	CountryCode: 'MHL',	CountryPhoneCode: '+692',	Country: 'Marshall Islands',	},
                {	CountryCode: 'MKD',	CountryPhoneCode: '+389',	Country: 'Macedonia',	},
                {	CountryCode: 'MLI',	CountryPhoneCode: '+223',	Country: 'Mali',	},
                {	CountryCode: 'MLT',	CountryPhoneCode: '+356',	Country: 'Malta',	},
                {	CountryCode: 'MMR',	CountryPhoneCode: '+95',	Country: 'Myanmar',	},
                {	CountryCode: 'MNG',	CountryPhoneCode: '+976',	Country: 'Mongolia',	},
                {	CountryCode: 'MNP',	CountryPhoneCode: '+1',	Country: 'Northern Mariana Islands',	},
                {	CountryCode: 'MOZ',	CountryPhoneCode: '+258',	Country: 'Mozambique',	},
                {	CountryCode: 'MRT',	CountryPhoneCode: '+222',	Country: 'Mauritania',	},
                {	CountryCode: 'MSR',	CountryPhoneCode: '+1',	Country: 'Montserrat',	},
                {	CountryCode: 'MTQ',	CountryPhoneCode: '+596',	Country: 'Martinique',	},
                {	CountryCode: 'MUS',	CountryPhoneCode: '+230',	Country: 'Mauritius',	},
                {	CountryCode: 'MWI',	CountryPhoneCode: '+265',	Country: 'Malawi',	},
                {	CountryCode: 'MYS',	CountryPhoneCode: '+60',	Country: 'Malaysia',	},
                {	CountryCode: 'MYT',	CountryPhoneCode: '+262',	Country: 'Mayotte',	},
                {	CountryCode: 'NAM',	CountryPhoneCode: '+264',	Country: 'Namibia',	},
                {	CountryCode: 'NCL',	CountryPhoneCode: '+687',	Country: 'New Caledonia',	},
                {	CountryCode: 'NER',	CountryPhoneCode: '+227',	Country: 'Niger',	},
                {	CountryCode: 'NFK',	CountryPhoneCode: '+672',	Country: 'Norfolk Island',	},
                {	CountryCode: 'NGA',	CountryPhoneCode: '+234',	Country: 'Nigeria',	},
                {	CountryCode: 'NIC',	CountryPhoneCode: '+505',	Country: 'Nicaragua',	},
                {	CountryCode: 'NIU',	CountryPhoneCode: '+683',	Country: 'Niue',	},
                {	CountryCode: 'NLD',	CountryPhoneCode: '+31',	Country: 'Netherlands',	},
                {	CountryCode: 'NOR',	CountryPhoneCode: '+47',	Country: 'Norway',	},
                {	CountryCode: 'NPL',	CountryPhoneCode: '+977',	Country: 'Nepal',	},
                {	CountryCode: 'NRU',	CountryPhoneCode: '+674',	Country: 'Nauru',	},
                {	CountryCode: 'NZL',	CountryPhoneCode: '+64',	Country: 'New Zealand',	},
                {	CountryCode: 'OMN',	CountryPhoneCode: '+968',	Country: 'Oman',	},
                {	CountryCode: 'PAK',	CountryPhoneCode: '+92',	Country: 'Pakistan',	},
                {	CountryCode: 'PAN',	CountryPhoneCode: '+507',	Country: 'Panama',	},
                {	CountryCode: 'PCN',	CountryPhoneCode: '+507',	Country: 'Pitcairn',	},
                {	CountryCode: 'PER',	CountryPhoneCode: '+51',	Country: 'Peru',	},
                {	CountryCode: 'PHL',	CountryPhoneCode: '+63',	Country: 'Philippines',	},
                {	CountryCode: 'PLW',	CountryPhoneCode: '+680',	Country: 'Palau',	},
                {	CountryCode: 'PNG',	CountryPhoneCode: '+675',	Country: 'Papua New Guinea',	},
                {	CountryCode: 'POL',	CountryPhoneCode: '+48',	Country: 'Poland',	},
                {	CountryCode: 'PRI',	CountryPhoneCode: '+1',	Country: 'Puerto Rico',	},
                {	CountryCode: 'PRK',	CountryPhoneCode: '+82',	Country: 'North Korea',	},
                {	CountryCode: 'PRT',	CountryPhoneCode: '+351',	Country: 'Portugal',	},
                {	CountryCode: 'PRY',	CountryPhoneCode: '+595',	Country: 'Paraguay',	},
                {	CountryCode: 'PSE',	CountryPhoneCode: '+970',	Country: 'Palestine',	},
                {	CountryCode: 'PYF',	CountryPhoneCode: '+689',	Country: 'French Polynesia',	},
                {	CountryCode: 'QAT',	CountryPhoneCode: '+974',	Country: 'Qatar',	},
                {	CountryCode: 'REU',	CountryPhoneCode: '+262',	Country: 'Reunion',	},
                {	CountryCode: 'ROM',	CountryPhoneCode: '+40',	Country: 'Romania',	},
                {	CountryCode: 'RUS',	CountryPhoneCode: '+7',	Country: 'Russian',	},
                {	CountryCode: 'RWA',	CountryPhoneCode: '+250',	Country: 'Rwanda',	},
                {	CountryCode: 'SAU',	CountryPhoneCode: '+966',	Country: 'Saudi Arabia',	},
                {	CountryCode: 'SDN',	CountryPhoneCode: '+249',	Country: 'Sudan',	},
                {	CountryCode: 'SEN',	CountryPhoneCode: '+221',	Country: 'Senegal',	},
                {	CountryCode: 'SGP',	CountryPhoneCode: '+65',	Country: 'Singapore',	},
                {	CountryCode: 'SGS',	CountryPhoneCode: '+65',	Country: 'South Georgia and the South Sandwich Islands',	},
                {	CountryCode: 'SHN',	CountryPhoneCode: '+290',	Country: 'Saint Helena',	},
                {	CountryCode: 'SJM',	CountryPhoneCode: '+290',	Country: 'Svalbard and Jan Mayen',	},
                {	CountryCode: 'SLB',	CountryPhoneCode: '+677',	Country: 'Solomon Islands',	},
                {	CountryCode: 'SLE',	CountryPhoneCode: '+232',	Country: 'Sierra Leone',	},
                {	CountryCode: 'SLV',	CountryPhoneCode: '+503',	Country: 'El Salvador',	},
                {	CountryCode: 'SMR',	CountryPhoneCode: '+378',	Country: 'San Marino',	},
                {	CountryCode: 'SOM',	CountryPhoneCode: '+252',	Country: 'Somalia',	},
                {	CountryCode: 'SPM',	CountryPhoneCode: '+508',	Country: 'Saint Pierre and Miquelon',	},
                {	CountryCode: 'STP',	CountryPhoneCode: '+239',	Country: 'Sao Tome and Principe',	},
                {	CountryCode: 'SUR',	CountryPhoneCode: '+597',	Country: 'Suriname',	},
                {	CountryCode: 'SVK',	CountryPhoneCode: '+421',	Country: 'Slovakia',	},
                {	CountryCode: 'SVN',	CountryPhoneCode: '+386',	Country: 'Slovenia',	},
                {	CountryCode: 'SWE',	CountryPhoneCode: '+46',	Country: 'Sweden',	},
                {	CountryCode: 'SWZ',	CountryPhoneCode: '+268',	Country: 'Swaziland',	},
                {	CountryCode: 'SYC',	CountryPhoneCode: '+248',	Country: 'Seychelles',	},
                {	CountryCode: 'SYR',	CountryPhoneCode: '+963',	Country: 'Syria',	},
                {	CountryCode: 'TCA',	CountryPhoneCode: '+1',	Country: 'Turks and Caicos Islands',	},
                {	CountryCode: 'TCD',	CountryPhoneCode: '+235',	Country: 'Chad',	},
                {	CountryCode: 'TGO',	CountryPhoneCode: '+228',	Country: 'Togo',	},
                {	CountryCode: 'THA',	CountryPhoneCode: '+66',	Country: 'Thailand',	},
                {	CountryCode: 'TJK',	CountryPhoneCode: '+992',	Country: 'Tajikistan',	},
                {	CountryCode: 'TKL',	CountryPhoneCode: '+690',	Country: 'Tokelau',	},
                {	CountryCode: 'TKM',	CountryPhoneCode: '+993',	Country: 'Turkmenistan',	},
                {	CountryCode: 'TMP',	CountryPhoneCode: '+670',	Country: 'East Timor',	},
                {	CountryCode: 'TON',	CountryPhoneCode: '+676',	Country: 'Tonga',	},
                {	CountryCode: 'TTO',	CountryPhoneCode: '+1',	Country: 'Trinidad and Tobago',	},
                {	CountryCode: 'TUN',	CountryPhoneCode: '+216',	Country: 'Tunisia',	},
                {	CountryCode: 'TUR',	CountryPhoneCode: '+90',	Country: 'Turkey',	},
                {	CountryCode: 'TUV',	CountryPhoneCode: '+688',	Country: 'Tuvalu',	},
                {	CountryCode: 'TWN',	CountryPhoneCode: '+886',	Country: 'Taiwan',	},
                {	CountryCode: 'TZA',	CountryPhoneCode: '+255',	Country: 'Tanzania',	},
                {	CountryCode: 'UGA',	CountryPhoneCode: '+256',	Country: 'Uganda',	},
                {	CountryCode: 'UKR',	CountryPhoneCode: '+380',	Country: 'Ukraine',	},
                {	CountryCode: 'UMI',	CountryPhoneCode: '+380',	Country: 'United States Minor Outlying Islands',	},
                {	CountryCode: 'UNK',	CountryPhoneCode: '+1',	Country: 'Unknown',	},
                {	CountryCode: 'URY',	CountryPhoneCode: '+598',	Country: 'Uruguay',	},
                {	CountryCode: 'USA',	CountryPhoneCode: '+1',	Country: 'United States',	},
                {	CountryCode: 'UZB',	CountryPhoneCode: '+998',	Country: 'Uzbekistan',	},
                {	CountryCode: 'VAT',	CountryPhoneCode: '+39',	Country: 'Holy See (Vatican City State)',	},
                {	CountryCode: 'VCT',	CountryPhoneCode: '+1',	Country: 'Saint Vincent and the Grenadines',	},
                {	CountryCode: 'VEN',	CountryPhoneCode: '+58',	Country: 'Venezuela',	},
                {	CountryCode: 'VGB',	CountryPhoneCode: '+1',	Country: 'Virgin Islands, British',	},
                {	CountryCode: 'VIR',	CountryPhoneCode: '+1',	Country: 'Virgin Islands, U.S.',	},
                {	CountryCode: 'VNM',	CountryPhoneCode: '+84',	Country: 'Vietnam',	},
                {	CountryCode: 'VUT',	CountryPhoneCode: '+678',	Country: 'Vanuatu',	},
                {	CountryCode: 'WLF',	CountryPhoneCode: '+681',	Country: 'Wallis and Futuna',	},
                {	CountryCode: 'WSM',	CountryPhoneCode: '+685',	Country: 'Samoa',	},
                {	CountryCode: 'YEM',	CountryPhoneCode: '+967',	Country: 'Yemen',	},
                {	CountryCode: 'YUG',	CountryPhoneCode: '+967',	Country: 'Yugoslavia',	},
                {	CountryCode: 'ZAF',	CountryPhoneCode: '+27',	Country: 'South Africa',	},
                {	CountryCode: 'ZMB',	CountryPhoneCode: '+260',	Country: 'Zambia',	},
                {	CountryCode: 'ZWE',	CountryPhoneCode: '+263',	Country: 'Zimbabwe',	},
            ]
        },
        getAddressByGeocoder: function(latlng,replyFunc){
            /*var url = "http://map.quiktrak.co/reverse.php?format=json&lat={0}&lon={1}&zoom=18&addressdetails=1".format(latlng.lat, latlng.lng);
            JSON.request(url, function(result){ replyFunc(result.display_name);});*/
            var coords = LANGUAGE.COM_MSG09 + ': ' + latlng.lat + ', ' + LANGUAGE.COM_MSG10 + ': ' + latlng.lng;
            $.ajax({
                   type: "GET",
                    url: "https://nominatim.sinopacific.com.ua/reverse.php?format=json&lat={0}&lon={1}&zoom=18&addressdetails=1".format(latlng.lat, latlng.lng),
               dataType: "json",
                  async: true,
                  cache: false,
                success: function (result) {
                    if (result.display_name) {
                        replyFunc(result.display_name);
                    }else{
                        replyFunc(coords);
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    $.ajax({
                           type: "GET",
                            url: "https://nominatim.openstreetmap.org/reverse?format=json&lat={0}&lon={1}&zoom=18&addressdetails=1".format(latlng.lat, latlng.lng),
                       dataType: "json",
                          async: true,
                          cache: false,
                        success: function (result) {
                            if (result.display_name) {
                                replyFunc(result.display_name);
                            }else{
                                replyFunc(coords);
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown){
                            replyFunc(coords);
                        }
                    });
                }
            });
        },
        getLatLngByGeocoder: function(address,replyFunc){
            var url = "https://nominatim.openstreetmap.org/search?q={0}&format=json&polygon=1&addressdetails=1".format(address);
                /*JSON.request(url, function(result){
                    var res = new L.LatLng(result[0].lat, result[0].lon);
                    replyFunc(res);
                });*/
            var res = null;
            $.ajax({
                   type: "GET",
                    url: url,
               dataType: "json",
                  async: true,
                  cache: false,
                success: function (result) {
                    if (result.length > 0) {
                        if (result[0].lat && result[0].lon) {
                            res = new L.LatLng(result[0].lat, result[0].lon);
                            replyFunc(res);
                        }else{
                            replyFunc(res);
                        }
                    }else{
                        replyFunc(res);
                    }
                },
                error: function(XMLHttpRequest, textStatus, errorThrown){
                    url = "https://nominatim.sinopacific.com.ua/?q={0}&format=json&polygon=1&addressdetails=1".format(address);
                            $.ajax({
                           type: "GET",
                            url: url,
                       dataType: "json",
                          async: true,
                          cache: false,
                        success: function (result) {
                            if (result.length > 0) {
                                if (result[0].lat && result[0].lon) {
                                    res = new L.LatLng(result[0].lat, result[0].lon);
                                    replyFunc(res);
                                }else{
                                    replyFunc(res);
                                }
                            }else{
                                replyFunc(res);
                            }
                        },
                        error: function(XMLHttpRequest, textStatus, errorThrown){
                            replyFunc(res);
                        }
                    });
                }
            });
        },
        createMap: function(option){
            /*var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { name: 'osm', attribution: '' });
            var map = L.map(option.target, { zoomControl: false, center: option.latLng, zoom: option.zoom });
            map.addLayer(osm);
            L.control.scale().addTo(map);
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            return map;*/
            var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { name: 'osm', attribution: '' });
            var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'+'&hl='+lang,{
                maxZoom: 22,
                subdomains:['mt0','mt1','mt2','mt3']
            });
            var googleSatelitte = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}'+'&hl='+lang,{
                maxZoom: 20,
                subdomains:['mt0','mt1','mt2','mt3']
            });

            var map = L.map(option.target, { zoomControl: false, center: option.latLng, zoom: option.zoom, layers: [googleStreets] });

            var layers = {
                "<span class='mapSwitcherWrapper googleSwitcherWrapper'><img class='layer-icon' src='resources/images/googleRoad.png' alt='' /> <p>Map</p></span>": googleStreets,
                "<span class='mapSwitcherWrapper satelliteSwitcherWrapper'><img class='layer-icon' src='resources/images/googleSatellite.png' alt='' />  <p>Satellite</p></span>": googleSatelitte,
                "<span class='mapSwitcherWrapper openstreetSwitcherWrapper'><img class='layer-icon' src='resources/images/openStreet.png' alt='' /> <p>OpenStreet</p></span>": osm,
            };

            L.control.layers(layers).addTo(map);

            return map;
        },
        getAssetStateInfo: function(asset){
            /*
                state-0  -- gray
                state-1  -- green
                state-2  -- yellow
                state-3  -- red
            */
            if (asset) {
                var ret = {};
                var dateTimeSecond = 24* 600 * 60 * 1000;

                if(asset.posInfo.positionTime !== null)
                    dateTimeSecond = Math.abs(moment(moment(asset.posInfo.positionTime.toDate()).add(CustomerInfo.TimeZone, 'hours').toDate()).diff(moment(moment(moment().toDate()).add((moment().utcOffset()/60),'hours').toDate()), 'milliseconds'));

                /*if(asset.posInfo.positionTime !== null&&Math.abs(moment(moment(asset.posInfo.positionTime.toDate()).add(CustomerInfo.TimeZone, 'hours').toDate()).diff(moment(moment(moment().toDate()).add((moment().utcOffset()/60)).toDate()), 'milliseconds'),'hours') > 20 * 60 * 1000)
                {
                    asset.posInfo.speed=0;
                }*/
                if(asset.posInfo.lat===0||asset.posInfo.lng===0||(asset.posInfo.positionTime !== null&&Math.abs(moment(moment(asset.posInfo.positionTime.toDate()).add(CustomerInfo.TimeZone).toDate(),'hours').diff(moment(moment(moment().toDate()).add((moment().utcOffset()/60)).toDate()), 'milliseconds'),'hours') > 40 * 60 * 1000))
                {
                    asset.posInfo.isRealTime="False";
                    asset.posInfo.isLocated="False";
                    asset.posInfo.speed=0;
                    asset.posInfo.status=0;
                }

                ret.stats = true;
                if(asset.posInfo.positionTime === null) {
                    ret.stats = false;

                }else{
                    if (asset.haveFeature("Speed")){
                        if(asset.haveFeature("Acc") && (Protocol.PositionStatus.ACC & asset.posInfo.status) === 0){
                            asset.posInfo.speed = 0;
                        }
                        ret.speed = {};
                        ret.speed.value = Protocol.Helper.getSpeedValue(asset.Unit, asset.posInfo.speed) + ' ' + Protocol.Helper.getSpeedUnit(asset.Unit);
                    }
                    if(asset.haveFeature("TempSensor")){
                        ret.temperature = {};
                        if(typeof asset.posInfo.alt == "undefined"){
                            ret.temperature.value = LANGUAGE.COM_MSG11;
                        }else{
                            ret.temperature.value = asset.posInfo.alt + '&nbsp;°C';
                        }
                    }
                    if(asset.haveFeature("FuelSensor")){
                        ret.fuel = {};
                        if(typeof asset.posInfo.fuel == "undefined"){
                            ret.fuel.value = LANGUAGE.COM_MSG11;
                        }else{
                            ret.fuel.value = parseInt(((parseFloat(asset.posInfo.fuel) - asset._FIELD_FLOAT2) / (asset._FIELD_FLOAT1 - asset._FIELD_FLOAT2)) * 100) + '&nbsp;%';
                        }
                    }
                    if(asset.haveFeature("Voltage")){
                        ret.voltage = {};
                        if(typeof asset.posInfo.alt == "undefined"){
                            ret.voltage.value = LANGUAGE.COM_MSG11;
                        }else{
                            ret.voltage.value = Math.round(asset.posInfo.alt*10)/10 + '&nbsp;V';
                        }
                    }
                    if(asset.haveFeature("Mileage")) {
                        ret.milage = {};
                        ret.milage.value = (Protocol.Helper.getMileageValue(asset.Unit, asset.posInfo.mileage) + parseInt(asset.InitMilage) + parseInt(asset._FIELD_FLOAT7)) + '&nbsp;' + Protocol.Helper.getMileageUnit(asset.Unit);
                    }
                    if(asset.haveFeature("Acc")){
                        ret.acc = {};
                        //if((Protocol.PositionStatus.ACC & asset.posInfo.status) > 0 && asset.posInfo.isLocated=="True"){
                        //if((Protocol.PositionStatus.ACC & this.posInfo.status) > 0)
                        if((Protocol.PositionStatus.ACC & asset.posInfo.status) > 0){
                            ret.acc.value = 'ON';
                        }else{
                            ret.acc.value = 'OFF';
                        }
                    }
                    if(asset.haveFeature("Acc2")){
                        ret.acc2 = {};
                        if((Protocol.PositionStatus.ACC2 & asset.posInfo.status) > 0){
                            ret.acc2.value = 'ON';
                        }else{
                            ret.acc2.value = 'OFF';
                        }
                    }
                    if(asset.haveFeature("Battery")){
                        ret.battery = {};
                        if (asset.posInfo.Battery) {
                            ret.battery.value = parseInt(asset.posInfo.Battery) + '&nbsp;%';
                        }else{
                            ret.battery.value = LANGUAGE.COM_MSG11; // no data
                        }
                    }
                    if(asset.haveFeature("Alt")){
                        ret.altitude = {};
                        ret.altitude.value = asset.posInfo.alt + '&nbsp;ft';
                    }
                    /*if(asset.haveFeature("RFIDCard")){
                        ret.driver = {};
                        if(asset.posInfo.rfid !== null && asset.posInfo.rfid !== ""){
                            var hasFound = false;
                            for(var i= 0; i< ContactList.length; i++){
                                if(asset.posInfo.rfid == ContactList[i].Number){
                                    hasFound = true;
                                    ret.driver.value = ContactList[i].FirstName + " " + ContactList[i].SurName;
                                    break;
                                }
                            }
                            if(!hasFound){
                                ret.driver.value = asset.posInfo.rfid;
                            }
                        }else{
                            ret.driver.value = LANGUAGE.COM_MSG11;
                        }
                    }else if(asset.haveFeature("Driver")){
                        ret.driver = {};
                        var name = '';
                        if(asset.contactCode !== null && asset.contactCode !== ""){
                            for(var j = 0; j< ContactList.length; j++){
                                if(asset.contactCode == ContactList[j].Code){
                                    name += ContactList[j].FirstName + " " + ContactList[j].SurName;
                                    break;
                                }
                            }
                        }
                        ret.driver.value = name;
                    }              */

                    ret.GPS = {};
                    ret.GPS.state = 'state-1';
                    ret.GSM = {};
                    ret.GSM.state = 'state-1';
                    if(asset.posInfo.lat===0||asset.posInfo.lng===0||dateTimeSecond > 40 * 60 * 1000){
                        ret.GPS.state = 'state-0';
                    }
                    if(dateTimeSecond > 5 * 60 * 60 * 1000){
                        ret.GSM.state = 'state-0';
                    }
                    ret.status = {};
                    if(parseInt(asset.posInfo.speed) > 0){
                        ret.status.value = LANGUAGE.ASSET_STATUS_MSG05;
                        ret.status.state = 'state-1';
                        ret.GSM.state = 'state-1';
                    }
                    else if(parseInt(asset.posInfo.speed) === 0){
                        ret.status.value = LANGUAGE.ASSET_STATUS_MSG04;
                        ret.status.state = 'state-0';
                        ret.GSM.state = 'state-1';
                    }

                    if(dateTimeSecond > 72 * 60 * 60 * 1000){
                        ret.GSM.state = 'state-3';
                    }
                    else if(dateTimeSecond > 24 * 60 * 60 * 1000){
                        ret.GSM.state = 'state-2';
                    }
                    else if(dateTimeSecond > 12 * 60 * 60 * 1000){
                        ret.GSM.state = 'state-0';
                    }else{
                        ret.GSM.state = 'state-1';
                    }

                    if(dateTimeSecond > 48 * 60 * 60 * 1000){
                        ret.GPS.state = 'state-0';
                    }
                    else if(asset.haveFeature("Acc") && (Protocol.PositionStatus.ACC & asset.posInfo.status) === 0 && asset.posInfo.speed === 0) {
                        ret.GPS.state = 'state-1';
                    }
                    else if(asset.posInfo.speed > 0){
                        ret.GPS.state = 'state-1';
                    }else if(asset.posInfo.speed === 0){
                        ret.GPS.state = 'state-1';
                    }

                }
            }


            return ret;
        }
    }
};

Protocol.Common = JClass({
    STATIC: {

    },
    constructor: function(arg) {
        this.initDeviceInfo(arg);
        this.posInfo = {};
    },
    initDeviceInfo: function (arg) {
        /*this.id = arg.ID;
        this.imei = arg.IMEI;
        this.protocolClass = arg.ProtocolClass;
        this.name = arg.Name;
        this.productCode = arg.ProductCode;
        this.customerCode = arg.CustomerCode;
        this.groupCode = arg.GroupCode;
        this.contactCode = arg.ContactCode;
        this.speedUnit = arg.SpeedUnit;
        this.beMonitored = arg.BeMonitored;
        this.initMileage = arg.InitMileage;
        this.initAccOnHours = arg.InitAccOnHours;
        this.state = arg.State;
        this.billCode=arg.BillCode;

        this._FIELD_FLOAT1 = arg._FIELD_FLOAT1;
        this._FIELD_FLOAT2 = arg._FIELD_FLOAT2;
        this._FIELD_FLOAT3 = arg._FIELD_FLOAT3;
        this.initDeviceInfoEx(arg);*/

        this.Id = arg.Id;
        this.IMEI = arg.IMEI;
        this.Name = arg.Name;
        this.TagName = arg.TagName;
        this.Icon = arg.Icon;
        this.Unit = arg.Unit;
        this.InitMilage = arg.InitMilage;
        this.InitAcconHours = arg.InitAcconHours;
        this.State = arg.State;
        this.ActivateDate = arg.ActivateDate;
        this.PRDTName = arg.PRDTName;
        this.PRDTFeatures = arg.PRDTFeatures;
        this.PRDTAlerts = arg.PRDTAlerts;
        this.Describe1 = arg.Describe1;
        this.Describe2 = arg.Describe2;
        this.Describe3 = arg.Describe3;
        this.Describe4 = arg.Describe4;
        this.Describe5 = arg.Describe5;
        this.Describe7 = arg.Describe7;
        this._FIELD_FLOAT1 = arg._FIELD_FLOAT1;
        this._FIELD_FLOAT2 = arg._FIELD_FLOAT2;
        this._FIELD_FLOAT7 = arg._FIELD_FLOAT7;
        this.AlarmOptions = arg.AlarmOptions;


    },
    initDeviceInfoEx:function(){},
    initPosInfo: function (ary) {
        var posInfo = {};

        posInfo.assetID = ary[0];
        posInfo.imei = ary[1];
        posInfo.protocolClass = ary[2];
        posInfo.positionType = ary[3];
        posInfo.dataType = ary[4];
        if(ary[5] !== null) {

            posInfo.positionTime = moment(ary[5].split('.')[0]).add(CustomerInfo.TimeZone, 'hours');
        }
        else {
            posInfo.positionTime = null;
        }
        if(ary[6] !== null) {
            posInfo.sysTime = moment(ary[6].split('.')[0]).add(CustomerInfo.TimeZone, 'hours');
        }
        else {
            posInfo.sysTime = null;
        }
        if(ary[7] !== null) {
            posInfo.staticTime = moment(ary[7]).add(CustomerInfo.TimeZone, 'hours');
        }
        else {
            posInfo.staticTime = null;
        }
        posInfo.isRealTime = ary[8];
        posInfo.isLocated = ary[9];
        posInfo.satelliteSignal = ary[10];
        posInfo.gsmSignal = ary[11];
        posInfo.lat = ary[12];
        posInfo.lng = ary[13];
        posInfo.alt = ary[14];
        posInfo.direct = ary[15];
        posInfo.speed = ary[16];
        posInfo.mileage = ary[17];
        posInfo.launchHours = ary[18];
        posInfo.alerts = ary[19];
        posInfo.status = ary[20];
        posInfo.originalAlerts = ary[21];
        posInfo.originalStatus = ary[22];
        this.initPosInfoEx(ary, posInfo);
        this.posInfo = posInfo;

        return posInfo;
    },
    initPosInfoEx:function(){},
    initHisPosInfo: function (ary) {
        var posInfo = {};
        posInfo.assetID = ary[0];
        posInfo.positionType = ary[1];
        posInfo.dataType = ary[2];
        if(ary[3] !== null) {
            posInfo.positionTime = moment(ary[3].split('.')[0]).add(CustomerInfo.TimeZone, 'hours');
        }
        else {
            posInfo.positionTime = null;
        }
        if(ary[4] !== null) {
            posInfo.sysTime = moment(ary[4]).add(CustomerInfo.TimeZone, 'hours');
        }
        else {
            posInfo.sysTime = null;
        }
        if(ary[5] !== null) {
            posInfo.staticTime = moment(ary[5]).add(CustomerInfo.TimeZone, 'hours');
        }
        else {
            posInfo.staticTime = null;
        }
        posInfo.isRealTime = ary[6];
        posInfo.isLocated = ary[7];
        posInfo.satelliteSignal = ary[8];
        posInfo.gsmSignal = ary[9];
        posInfo.lat = ary[10];
        posInfo.lng = ary[11];
        posInfo.alt = ary[12];
        posInfo.direct = ary[13];
        posInfo.speed = ary[14];
        posInfo.mileage = ary[15];
        posInfo.launchHours = ary[16];
        posInfo.alerts = ary[17];
        posInfo.status = ary[18];
        posInfo.originalAlerts = ary[19];
        posInfo.originalStatus = ary[20];
        this.initHisPosInfoEx(ary, posInfo);
        return posInfo;
    },
    initHisPosInfoEx: function(){},
    initEventInfo: function(ary){
        var event = {};
        event.assetID = ary[0];
        event.eventClass = ary[1];
        event.eventType = ary[2];
        event.state = ary[3];
        event.otherCode = ary[4];
        event.otherCode2 = ary[5];
        event.contactCode = ary[6];
        event.beginTime = moment(ary[7]).add(CustomerInfo.TimeZone, 'hours');
        event.endTime = moment(ary[8]).add(CustomerInfo.TimeZone, 'hours');
        event.positionType = ary[9];
        event.lat = ary[10];
        event.lng = ary[11];
        event.alt = ary[12];
        event.alerts = ary[13];
        event.status = ary[14];
        this.initEventInfoEx(ary, event);
        return event;
    },
    initEventInfoEx: function(){},
    haveFeature: function(feature){
        return (Protocol.ProductFeatures[feature] & this.PRDTFeatures) > 0;
    }
});
Protocol.ClassManager = {
    array: {},
    add: function (name, clas) {
        Protocol.ClassManager.array[name] = clas;
    },
    get: function (name, arg) {
        var clasType = Protocol.ClassManager.array[name];
        var ret = null;
        if (isUndefined(clasType)) {
            ret = new Protocol.Common(arg);
        }
        else {
            ret = new clasType(arg);
        }
        return ret;
    }
};



/*
// EXAMPLE
var deviceInfo = {
    // GPS DEVICE INFO, you can change initDeviceInfo method base on api response
};

var posData = ["3C3E3B3A3F","0354188046604596","EELINK_OBD","0","2","2016-03-12T10:15:17","2016-03-12T10:17:23.767","2013-11-04T06:25:03","true","true","0","0","43.905781111111168","125.27960111111116","0.0","332","0.0","0.0","10","0","1","0","0","0.0","0.0",null,"0.0"];
var protocolClass = posData[2];

var posInfo = Protocol.ClassManager.get(protocolClass, deviceInfo);

posInfo.initPosInfo(posData); //  for init or update position data

if(posInfo.haveFeature("Speed")){
    // display speed in asset list

}
*/