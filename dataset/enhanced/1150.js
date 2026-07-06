setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ hh ~ hh").gain(.2).pan(.6)

$: s("gm_electric_guitar_clean:2 ~ ~ oh").gain(.45).room(.2).delay(.25)

$: note("d4 f4 a4 d5 c#5 d5 c#5 a4").s("sawtooth").lpf(3000).release(.2).room(.4).gain(.4)

$: note("<d2 a1 c2 g1>").s("square").lpf(600).release(.25).gain(.5)
