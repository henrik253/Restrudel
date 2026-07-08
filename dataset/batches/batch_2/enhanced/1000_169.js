setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: s("cowbell ~").speed(1.1).attack(.01).gain(.4)

$: s("~ cp:12 hh hh*2").gain(.3)

$: note("c2 g2").s("sawtooth").lpf(700).gain(.4)
