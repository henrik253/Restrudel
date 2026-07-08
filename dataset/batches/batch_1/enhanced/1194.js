setcpm(108/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("hh*8").gain(.18).pan(.4)

$: note("a2 e2 a2 c3 a2 e2 g2 a2").s("gm_acoustic_bass").lpf(700).release(.25).gain(.5)

$: n("0 3 5 7 5 3").scale("a:minor").s("gm_flute:1").lpf(3000).release(.3).room(.3).delay(.3).gain(.4)

$: s("pad ~ ~ ~").lpf(2000).room(.4).release(.5).gain(.35)
