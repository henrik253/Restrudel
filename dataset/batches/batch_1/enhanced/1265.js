setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("clave ~ rim ~").gain(.35)

$: s("hh*8").gain(.16)

$: n("0 3 5 1 6 2").scale("g:minor").s("gm_electric_guitar_clean:2").gain(.35).delay(.4).delaytime(".33 .166").delayfeedback(.4).lpf(2500).room(.3)

$: note("<g1 g1 d2 c2>").s("sawtooth").lpf(650).release(.25).gain(.5)
