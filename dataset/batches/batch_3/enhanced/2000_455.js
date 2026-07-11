setcpm(26)

$: s("amen:0*2 amen:1").slow(2).gain(.7)

$: s("hh*4").gain(.15)

$: n("0 ~ 3 ~ 5 ~ 3 ~").scale("C:major").s("sawtooth").lpf(1500).gain(.4)

$: n("0 3 5 7 5 3").scale("C:major").s("square").lpf(2500).gain(.35)
