setcpm(112/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("woodblock:1 woodblock:2*2 ~ ~").gain(.4).pan(.4)

$: n("0 2 4 ~ 2 0 -3 0").scale("a:minor").s("gm_lead_2_sawtooth").lpf(4000).release(.2).room(.4).gain(.4)

$: note("a3 c4 ~ e4 f3 a3 c4 f4").s("square").lpf(1800).release(.3).delay(.3).gain(.35)

$: note("<a1 e2 f1 c2>").s("sawtooth").lpf(600).release(.25).gain(.5)
