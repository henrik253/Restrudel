setcpm(114/4)

$: s("cr bd sd bd").bank("RolandTR808").release(.12).gain(.8)

$: s("hh*8").gain(.18).pan(.5)

$: n("7 8 7 6 5 4 3 2 1 3 0 ~").scale("c:major").s("sawtooth").lpf(2600).resonance(6).release(.2).room(.3).gain(.4)

$: n("<c2 g1 a1 f1>").scale("c:major").s("square").lpf(600).release(.3).gain(.5)
