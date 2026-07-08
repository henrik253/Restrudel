setcpm(128/4)
$: s("bd*4").gain(.75)
$: s("sd sd*4 lt*4 hh!3").slow(2).gain(.4)
$: note("c2*8 b2 d3 g3 b3").sound("sine").gain(.35).lpf(1500)
