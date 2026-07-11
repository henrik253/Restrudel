setcpm(126/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.16)

$: n("0 ~ 0 3 ~ 5 3 0").scale("e:minor").s("sawtooth").lpf(700).release(.13).gain(.4)

$: s("gm_acoustic_guitar_steel:2 ~").note("<e4 g4 b4>").pan(.55).lpf(1800).room(.4).gain(.4)
