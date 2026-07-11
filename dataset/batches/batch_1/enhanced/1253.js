setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("mt*2 ~ mt ~").gain(.3).room(.27).delay(.4).delayfeedback(.5)

$: s("hh*8").gain(.16)

$: n("0 3 7 5 7 3 0 ~").scale("d:hirajoshi").s("gm_ocarina").lpf(3000).release(.2).room(.3).delay(.3).gain(.35)

$: n("<d2 d2 a1 a1>").scale("d:minor").s("sawtooth").lpf(650).release(.25).gain(.5)
