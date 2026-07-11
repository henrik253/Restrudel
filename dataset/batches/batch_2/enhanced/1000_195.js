setcpm(100/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("~ hh ~ hh").gain(.2)

$: n("9 4 9 4").scale("G0:minor").sound("hh").room(.2).gain(.4)

$: n("0 3 5 3").scale("G2:minor").sound("sawtooth").lpf(1000).room(.3).gain(.3)
