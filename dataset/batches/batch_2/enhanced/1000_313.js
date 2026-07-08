setcpm(128/4)

$: s("bd!2 bd*4 bd!4 ~ sd ~ hh!2 hh*2 sd sd*4").gain(.5).lpf(2932)

$: note("a2*8 a2*4 ~ ~").s("piano").lpf(2911).room(.6).gain(.5).release(.0529).attack(.001)
