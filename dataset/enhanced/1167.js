setcpm(104/4)

$: s("bd ~ sd ~").bank("RolandTR808").gain(.85)

$: s("~ hh ~ hh").gain(.18).pan(.4)

$: note("a1 g1*2 a1*2 g1").s("sawtooth").fm(2).lpf(700).release(.25).gain(.5)

$: n("0 3 5 7 5 3").scale("a:minor").s("square").lpf(2200).resonance(6).release(.2).room(.3).delay(.3).gain(.4)
