var $ = require('jquery');
require('./jquery.plugins.js');

var memoize = require('lodash/memoize');
var PREFIXED_TRANSFORM = require('detectcss').prefixed('transform');

var rAF = require('./rAF.js');

function distorter ( distortion, focus, min, max ) {
    
    var cache = {};
    
    cache[ min ] = min;
    cache[ max ] = max;
    
    return x => {
        
        x = Math.min( max, Math.max( x, min ) );
        
        if ( x in cache ) return cache[ x ];
        
        var offset = (x < focus ? focus - min : max - focus) || (max - min);
        
        var ret =  (x < focus ? -1 : +1) * offset * (distortion + 1) / (distortion + (offset / Math.abs(x - focus))) + focus;
        
        cache[ x ] = ret;
        
        return ret;
        
    }
    
};

var styleReset = {
    width: '',
    height: '',
    top: '',
    left: '',
    position: ''
}

styleReset[ PREFIXED_TRANSFORM ] = 'none';

var behaviours = {
    
    position: ( element, fx, fy ) => {
            
        var x = fx( element.x );
        var y = fy( element.y );
        
        if( element.options.centered ) {
            
            x -= element.width / 2;
            y -= element.height / 2;
            
        }
        
        var ret = {};
        
        ret[ PREFIXED_TRANSFORM ] = 'translate(' + x + 'px, ' + y + 'px)';
        
        return ret;
        
    },
    
    size: ( element, fx, fy ) => {
        
        function inWindow( x, y, w, h ) {
            
            var wx = window.pageXOffset;
            var wy = window.pageYOffset;
            var ww = window.innerWidth;
            var wh = window.innerHeight;
            
            return (
                x < wx + ww &&
                x + w > wx &&
                y < wy + wh &&
                y + h > wy
            )
            
        }
        
        var style = {};
        
        var x = fx( element.x );
        var y = fy( element.y );
        var w = Math.ceil( fx( element.x + element.width ) ) - x;
        var h = Math.ceil( fy( element.y + element.height ) ) - y;
        
        if (
            !element.touched ||
            inWindow( element.x, element.y, element.width, element.height ) ||
            inWindow( x, y, w, h )
        ) {
            element.touched = true;
            style.width = w;
            style.height = h;
            style[ PREFIXED_TRANSFORM ] = 'translate(' + x + 'px, ' + y + 'px)';
        }
        
        return style;
        
    }
    
}

var realMouse = {
    x: window.pageXOffset + window.innerWidth / 2,
    y: window.pageYOffset + window.innerHeight / 2
};
var mouse = { x: realMouse.x, y: realMouse.y }

var lastScroll = window.pageYOffset;

var mouseMinX = -Infinity;

$(window).on('mousemove', e => {
    
    realMouse.x = Math.max( e.pageX, mouseMinX );
    realMouse.y = e.pageY;
    
}).on('scroll', function(){
    
    var d = ( window.pageYOffset - lastScroll );
    
    realMouse.y += d;
    mouse.y += d;
    
    lastScroll = window.pageYOffset;
    
})

rAF.start(() => {
    
    mouse.x += ( realMouse.x - mouse.x ) * .06;
    mouse.y += ( realMouse.y - mouse.y ) * .06;
    
})

$.fn.fisheye = function(){
    
    return this.each( function(){
        
        var $this = $(this);
        
        if( $this.hasClass('grid_detail') ) mouseMinX = window.innerWidth * .5;
        
        var distortion = Number( $this.data('distortion') );
        var noScroll = !!$this.data('no-scroll');
        
        var elements = $this.children().toArray().filter( el => {
            
            return el.className.indexOf( 'fisheye' ) > -1;
            
        }).map( el => {
            
            var className = [].find.call( el.classList, cls => cls.indexOf( 'fisheye' ) > -1 );
            
            if ( !className ) return false;
            
            var parts = className.split('-');
            
            var behaviour = parts[1];
            
            var options = {};
            
            for ( var i = 2; i < parts.length; i++ ) {
                
                options[ parts[ i ] ] = true;
                
            }
            
            return {
                $: $(el),
                behaviour,
                options
            }
            
        });
        
        var x = 0;
        var y = 0;
        var width = 0;
        var height = 0;
        
        function onResize () {
            
            var offset = $this.offset();
            
            x = offset.left;
            y = offset.top;
            
            elements.forEach( element => element.$.css( styleReset ) )
            
            elements.forEach( element => {
                
                var position = element.$.position();
                
                element.x = position.left;
                element.y = position.top;
                element.width = element.$.width();
                element.height = element.$.height();
                
            });
            
            elements.forEach( element => element.$.css({
                position: 'absolute',
                top: 0,
                left: 0
            }) );
            
        }
        
        onResize();
        
        $(window).on('resize', onResize);
        
        function update () {
            
            var fishX = distorter( distortion, mouse.x - x, window.pageXOffset, window.pageXOffset + window.innerWidth );
            
            var minY = window.pageYOffset;
            var maxY = minY + window.innerHeight;
            
            if( !noScroll ) {
                
                minY -= elements[0].height;
                maxY += elements[0].height;
                
            }
            
            var fishY = distorter( distortion, mouse.y - y, minY, maxY );
            
            elements.forEach( element => {
                
                element.$.css( behaviours[ element.behaviour ]( element, fishX, fishY ) );
                
            })
            
        }
        
        rAF.start( update );
        
    });
    
};