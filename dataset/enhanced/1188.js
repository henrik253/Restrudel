setcpm(120/4)

$: s("bd!2 bd*2 ~ sd").bank("RolandTR909").gain(.8)

$: s("cowbell ~ ~ cowbell").clip(1).release(.5).attack(.001).gain(.4)

$: note("e2 b1 e2 g2 e2 b1 d2 e2").s("gm_electric_bass_pick").lpf(700).release(.2).gain(.5)

$: n("0 3 7 5 3 0").scale("e:minor").s("sawtooth").lpf(2200).resonance(6).release(.2).room(.3).delay(.3).gain(.4)
