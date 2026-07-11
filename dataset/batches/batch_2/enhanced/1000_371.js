setcpm(105/4)
$: s("cp hh ~ hh*2").gain(.5)
$: s("gm_electric_bass_finger").cutoff(295).resonance(10).gain(.4)
$: note("c4 d#4 d#4@2 f4!2 f4 c4 c4!2 d#4@2 f4@2 f4").s("sawtooth").lpf(900).gain(.35)
