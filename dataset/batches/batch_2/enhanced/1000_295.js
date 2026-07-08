setcpm(120/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)
$: note("c2*8").sound("sine").gain(.4)
$: n("0 4 5 8 -1 0 2 11 9 10 8 13").lpf(1800).scale("C:minor").s("sawtooth").gain(.4)
