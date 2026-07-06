setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("rd*4").gain(.25).pan(.6)

$: n("0 2 3 5 3 2").scale("g:minor").s("sawtooth").lpf(2000).release(.2).room(.3).gain(.4)

$: n("<g1 d2 bb1 f1>").scale("g:minor").s("square").lpf(600).release(.3).gain(.5)
