setcpm(120/4)

$: note("a1 ~ a1 ~ c2 ~ [g1 a1] ~").s("gm_electric_bass_finger").release(.2).gain(.5)

$: n("6 9 11*2 11 11 10 ~ [4 11]").scale("a:minor").s("sawtooth").lpf(2200).release(.15).delay(.25).gain(.35)

$: s("bd ~ sd ~ bd ~ sd [~ bd]").bank("RolandTR909").gain(.8)

$: s("hh*8").gain(.16)
