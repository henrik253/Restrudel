setcpm(130/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("hh*16").gain(.15).pan(.5)

$: n("0 3 7 5 3 7 5 3").scale("f:minor").s("gm_lead_1_square").lpf(2400).resonance(6).release(.15).delay(.3).gain(.4)

$: n("<f1 c2 ab1 eb2>").scale("f:minor").s("sawtooth").lpf(600).release(.25).gain(.5)
