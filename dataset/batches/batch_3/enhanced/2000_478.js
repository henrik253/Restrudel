setcpm(32)

$: s("bd ~ bd ~").gain(.75)

$: s("hh*8").gain(.2)

$: n("0 ~ 0 ~ 3 ~ 3 ~").scale("C:major").s("square").lpf(1200).gain(.38)

$: n("0 2 4 5 4 2").scale("C:major").s("triangle").lpf(2800).gain(.32)
