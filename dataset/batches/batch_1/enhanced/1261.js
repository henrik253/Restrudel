setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("oh*4").gain(.18)

$: s("bd*3 ~").bank("RolandTR808").gain(.3)

$: note("a3 d4 d#4 d4").s("sawtooth").lpf(2200).resonance(6).release(.25).delay(.4).gain(.35)

$: note("<a1 a1 d2 d2>").s("square").lpf(650).release(.25).gain(.5)
