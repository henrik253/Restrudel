setcpm(120/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.18).pan(.5)

$: n("4 2 ~ 3 ~ 4 ~ 7 3 ~ 5 7 ~ 8 ~ 9").scale("c:major").s("sawtooth").lpf(2600).resonance(6).release(.15).delay(.3).gain(.4)

$: n("0 -3 0 -5 -1 -3").scale("c3:minor:pentatonic").s("square").lpf(650).release(.3).room(.25).gain(.5)
