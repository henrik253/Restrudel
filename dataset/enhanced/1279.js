setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("cp ~ ~ ~ rim ~ ~ ~").gain(.35).release(.1)

$: s("hh*8").gain(.16)

$: note("c4 eb4 g4 bb4 c5 g4 e4 c4 g4 d4 b3 g3").s("gm_synth_strings_1").lpf(2500).release(.3).room(.4).gain(.3)

$: note("c2 eb2 g2 bb2").s("sawtooth").lpf(700).release(.25).gain(.5)
