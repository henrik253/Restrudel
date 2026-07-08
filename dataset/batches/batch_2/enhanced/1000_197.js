setcpm(90/4)

$: s("~ hh hh*2 hh*2").lpf(400).resonance(8).room(.5).gain(.4)

$: s("gm_electric_bass_finger").struct("[~ x]*2").gain(.5)

$: note("~ d#4 f4 g4").sound("hh").lpf(300).resonance(6).room(.5).gain(.25)

$: s("gm_oboe").struct("x ~ ~ x").note("d#4 f4 g4 d#4").room(.4).gain(.3)
