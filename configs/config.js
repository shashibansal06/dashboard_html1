/*
 * @file: config.js
 * @description: File carrying all the constant values required by the application
 * @author: Mukesh
 * @date: 08-03-2017
 * */

/* Staging API"S */

angular.module('app.constants', [])
 .constant('API_URL', 'http://ignitrack.ignivastaging.com:8015/v1/')
 .constant('IMAGE_URL', 'http://ignitrack.ignivastaging.com:8006/')
 .constant('SOCKET_URL', 'ws://ignitrack.ignivastaging.com:8016')
 .constant('BASE_PATH', 'http://ignitrack.ignivastaging.com:8015/')


/* Live API"S 


  angular.module('app.constants', [])
        .constant('API_URL', 'http://ignitrackapi.ignivasolutions.com:8015/v1/')
        .constant('IMAGE_URL', 'http://ignitrackapi.ignivasolutions.com:8015/')
        .constant('SOCKET_URL', 'ws://ignitrackapi.ignivasolutions.com:8016')
        .constant('BASE_PATH', 'http://ignitrackapi.ignivasolutions.com:8015/')*/