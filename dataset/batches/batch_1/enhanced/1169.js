setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8 triangle").gain(.18).pan(.5)

$: note("c4*2 d#4 f4").s("gm_lead_2_sawtooth").lpf(4123).release(.2).room(.4).delay(.4).degradeBy(.2).gain(.35)

$: note("<c2 g1 f1 g1>").s("gm_distortion_guitar").lpf(700).release(.3).gain(.45)
