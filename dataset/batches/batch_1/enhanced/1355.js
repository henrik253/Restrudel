setcpm(126/4)

$: s("bd*2 sd").gain(.9)

$: s("hh*8").gain(.18)

$: s("~ bd:5 ~ sd:1").bank("RolandTR909").gain(.5)

$: n("0 ~ 3 ~ 5 ~ 3 ~").scale("a:minor").s("sawtooth").lpf(700).release(.2).gain(.4)

$: n("<0 5> 7 4 3").scale("a:minor").s("square").lpf(1600).release(.25).room(.3).gain(.35)
