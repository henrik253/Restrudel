setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("perc*3 ~").gain(.3).pan(.5)

$: n("3 2 1@2 9@3 8 4@3 9@3 8 6*4 5*4").scale("bb4:minor").s("pulse").lpf(2400).resonance(6).release(.15).delay(.3).gain(.4)

$: note("a3 a3!2 ~").s("square").lpf(2000).room(.4).release(.3).gain(.35)

$: n("<bb1 f2 db2 ab1>").scale("bb2:minor").s("gm_electric_bass_pick").lpf(700).release(.3).gain(.5)
