setcpm(110/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8).room(.3)

$: s("hh*16").gain(.25).hpf(7000).lpf(4000).resonance(5)

$: n("0 3 7 5").scale("G:dorian").s("sawtooth").lpf(3000).delay(.4).release(.291).attack(.05).gain(.4)

$: s("~ drum").lpf(2000).gain(.3).room(.4)
