setcpm(128/4)

$: s("bd*2 ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18)

$: n("3 2 2 2 4 ~ 3 ~").scale("c:minor").s("sawtooth").lpf(2000).resonance(20).release(.2).gain(.4)

$: note("g#4 ~ f#4 f#4").s("square").lpf(2200).release(.25).delay(.4).gain(.35)

$: n("<c2 c2 g1 eb2>").scale("c:minor").s("gm_electric_bass_pick:7").release(.5).room(.1).lpf(700).gain(.5)
