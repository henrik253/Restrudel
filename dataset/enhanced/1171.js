setcpm(122/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ cymbal ~ ~").gain(.25).release(.2).attack(.08)

$: n("0 3 5 7 5 3 0 -3").scale("g:minor").s("gm_lead_1_square").lpf(2400).resonance(6).release(.2).delay(.3).gain(.4)

$: n("<g1 d2 bb1 f1>").scale("g:minor").s("gm_distortion_guitar").lpf(700).release(.3).gain(.45)
