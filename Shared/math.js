
// module to define a coord [X,Y] struct
(function(exports){

   exports.Coord = function(X, Y){
       return {
	   x : (typeof X === "undefined") ? 0 : X,
           y : (typeof Y === "undefined") ? 0 : Y
       };
   };

})((typeof exports === 'undefined') ? (this['Math']={}) : exports);
