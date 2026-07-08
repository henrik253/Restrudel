setcpm(96/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("~ hh ~ hh").gain(.2)

$: note("e3 c3 g3 f3").sound("sawtooth").lpf(1200).gain(.4)

$: note("c2 eb2 g1 bb1").scale("A1:minor").sound("sawtooth").room(.5).gain(.3)
