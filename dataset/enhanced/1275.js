setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ oh ~ oh").gain(.18)

$: s("hh*8").gain(.16)

$: note("c#5 c5 a4 d#5 d5 c#5 d5 d#5").s("sawtooth").lpf(2270).resonance(6).release(.2).delay(.3).room(.3).gain(.35)

$: note("c3 ~ f3 ~ g3 ~ a#3 ~").s("square").lpf(700).release(.25).gain(.45)
