setcpm(126/4)

$: s("bd*4").bank("RolandTR909").gain(.85)

$: s("~ cr ~ ~").bank("RolandTR909").gain(.4)

$: s("cowbell:3*2 ~ cowbell:3 ~").gain(.2)

$: n("0 3 7 5 7 3 0 ~").scale("c:minor").s("saw").lpf(2500).resonance(6).release(.2).delay(.3).gain(.35)

$: n("<c2 c2 g1 eb2>").scale("c:minor").s("gm_synth_bass_1").lpf(700).release(.25).gain(.45)
