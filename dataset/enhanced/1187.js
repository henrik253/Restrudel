setcpm(110/4)

$: s("bd ~ sd ~").bank("AkaiLinn").gain(.85)

$: s("hh*8").gain(.18).pan(.4)

$: note("g4 c5 ~ g4 e4 c5 ~ g4").s("triangle").release(.3).room(.3).gain(.4)

$: note("e1 ~ ~ e2").s("gm_electric_bass_finger").clip(.85).decay(.1).sustain(0).delay(.2).gain(.5)

$: note("<e4 g4 b4 c5>").s("sawtooth").lpf(2000).resonance(6).release(.3).delay(.3).gain(.35)
