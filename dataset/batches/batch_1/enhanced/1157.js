setcpm(128/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("clave ~ clave ~").gain(.3).pan(.6)

$: note("g2 d#2 g2 c3 g2 d#2 f2 g2").s("square").lpf(2849).resonance(7).release(.15).gain(.5)

$: note("<g4 d#4 g5 c5>").s("sawtooth").lpf(2200).release(.3).room(.3).delay(.3).gain(.35)
