setcpm(118/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("oh*4").gain(.18)

$: s("bd*3 ~").bank("RolandTR808").gain(.3)

$: note("a4 c5 e5 c5").add("<0 -3 6 3>").s("gm_electric_bass_finger:2").lpf(2000).release(.3).clip(.9).gain(.4)

$: note("<a1 a1 c2 e2>").s("sawtooth").lpf(700).release(.25).gain(.5)
