var $ = require('jquery');

$.fn.$$ = function(){
    return this.toArray().map( element => $(element) );
}