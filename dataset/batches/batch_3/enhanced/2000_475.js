setcpm(31)

$: s("bd ~ sd ~").gain(.75)

$: s("hh*4").gain(.15)

$: n("0 ~ 0 ~ 3 ~ 3 ~").scale("C:major").s("square").lpf(1200).gain(.38)

$: n("0 3 5 7 5 3").scale("C:major").s("sawtooth").lpf(2200).gain(.33)
