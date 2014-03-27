'use strict';

var cmUser = angular.module('cmUser',[
    'cmAuth',
    'cmUserModel',
    'cmCrypt',
    'cmLogger'
])

cmUser.directive('cmLogin', [
    '$location',
    'cmNotify',
    'cmUserModel',
    cmLogin
])

cmUser.directive('cmKeyPair', [
    'cmUserModel',
    'cmCrypt',
    'cmUtil',
    'cmLogger',
    'cmNotify',
    '$location',
    cmKeyPair
])

