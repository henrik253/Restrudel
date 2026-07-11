setcpm(34)

$: s("bd ~ sd ~").bank("RolandTR909").gain(0.8)

$: s("hh*8").gain(0.2)

$: n("0 ~ 7 5").scale("c:minor").s("sawtooth").lpf(2500).gain(0.5)
