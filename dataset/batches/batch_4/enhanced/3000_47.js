setcpm(110)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)
$: s("hh*8").gain(.2)
$: n("0 3 5 3").scale("g:major").s("sawtooth").lpf(1200).gain(.45).release(.8).room(.3)
$: n("4 ~ 7 ~ 5 3 0 ~").scale("e:minor").s("square").lpf(1500).gain(.35).release(.6).room(.4).delay(.2)
$: s("pad").gain(.12).room(.85).delay(.5).release(2)
