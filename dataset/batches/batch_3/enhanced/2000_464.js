setcpm(28)

$: s("bd ~ bd ~").gain(.75)

$: s("hh*8").gain(.2)

$: n("0 ~ 0 ~ 3 ~ 3 ~").scale("C:major").s("square").lpf(1200).gain(.38)

$: n("0 3 5 7 5 3").scale("C:major").s("sine").lpf(3000).resonance(3).gain(.3)
