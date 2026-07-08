setcpm(35)

$: s("bd ~ bd ~").gain(.75)

$: s("hh*8").gain(.2)

$: n("0 0 3 3 5 5 7 7").scale("C:major").s("triangle").lpf(1800).gain(.42)

$: n("0 3 5 7 5 3").scale("C:major").s("sine").lpf(3000).resonance(3).gain(.3)
