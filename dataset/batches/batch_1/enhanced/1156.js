setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: note("d5 e5 g5 e5").s("sawtooth").lpf(1500).room(.5).release(.2).gain(.35)

$: n("0 5 3 2 1").scale("d:minor").s("gm_electric_piano_1").release(.5).room(.3).gain(.35)

$: n("<d2 a1 f1 c2>").scale("d:minor").s("square").lpf(600).release(.25).gain(.5)
