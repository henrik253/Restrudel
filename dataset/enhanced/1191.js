setcpm(124/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("hh*8").gain(.18).pan(.5)

$: note("g5 d5 g5 b5 g5 c5 e5 a5 e5 c5 f5 a5").s("sawtooth").clip("[.5 1]*2").lpf(2600).release(.15).room(.25).gain(.4)

$: note("g#4@2 a#4@2 b4@2 d#5").s("square").transpose(-12).release(.4).attack(.3).lpf(1800).gain(.35)

$: note("<g2 d2 c2 e2>").s("gm_electric_bass_pick").lpf(700).release(.3).gain(.5)
