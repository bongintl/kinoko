var $ = require('jquery');

$.fn.carousel = function () {
    
    return this.each( function(){
        
        var $carousel = $(this);
        var $slides = $carousel.children().$$();
        var curr = 0;
        
        function change ( to ) {
            
            $slides.forEach( function( $slide, i ){
                
                $slide.removeClass('off-left off-right');
                
                if( i < to ) {
                    
                    $slide.addClass('off-left');
                    
                } else if ( i > to ) {
                    
                    $slide.addClass('off-right');
                    
                }
                
            });
            
            curr = to;
            
        }
        
        function handler( event, always, left, right ) {
            
            $carousel.on( event, function(e){
                
                always();
                
                if ( e.offsetX < $carousel.width() / 2 ) {
                    
                    if ( curr > 0 ) left();
                    
                } else {
                    
                    if ( curr < $slides.length - 1 ) right();
                    
                }
                
            })
            
        }
        
        handler( 'mousemove', function(){
            $carousel.removeClass('cursor-left cursor-right');
        }, function(){
            $carousel.addClass('cursor-left');
            $slides[ curr - 1 ].addClass('peep-left');
        }, function(){
            $carousel.addClass('cursor-right');
            $slides[ curr + 1 ].addClass('peep-right');
        });
        
        handler('click', function(){},function(){
            $slides[ curr - 1 ].removeClass('peep-left');
            change( curr - 1 )
            if( curr > 0 ) $slides[ curr - 1 ].addClass('peep-left');
        }, function(){
            $slides[ curr + 1 ].removeClass('peep-right');
            change( curr + 1 )
            if( curr < $slides.length - 1 ) $slides[ curr + 1 ].addClass('peep-right');
        })
        
        $carousel.on('mouseleave', function(){
            if ( curr > 0 ) $slides[ curr - 1 ].removeClass('peep-left');
            if ( curr < $slides.length - 1 ) $slides[ curr + 1 ].removeClass('peep-right');
        })
        
        change( 0 );
        
    })
    
}