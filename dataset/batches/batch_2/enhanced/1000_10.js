setcpm(120/4)
$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)
$: s("hh*16").gain(.2)
$: n("5 6 4 5").scale("c:minor").s("sawtooth").lpf(1500).gain(.4).room(.5)
