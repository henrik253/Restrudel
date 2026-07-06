setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("vocal:1 ~ vocal:2 ~").slow(2).room(.5).gain(.45)

$: n("7 ~ 5 7 ~ 3 ~ 0").scale("f:major").s("sawtooth").lpf(1500).release(.2).gain(.4)

$: note("f1 ~ c2 f1").s("sine").release(.2).gain(.5)

$: s("hh*8").gain(.18)
