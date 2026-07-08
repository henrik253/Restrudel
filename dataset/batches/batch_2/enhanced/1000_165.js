setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("~ hh ~ hh").gain(.2)

$: n("0 -7 -3 -3 -1 -4 -2 0").scale("D:dorian").s("sawtooth").struct("x*8").gain(.4)

$: s("Sitar").note("d4 f4 a4 c5").slow(2).room(.3).gain(.3)
