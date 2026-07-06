setcpm(120/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("rd*4").lpf("<10 100>").gain(.4).release(1.2).attack(.001)

$: s("hh*8").gain(.16)

$: n("2 4 1 2 7 9").scale("bb:lydian").s("sawtooth").lpf(2500).resonance(6).release(.2).delay(.4).gain(.35)

$: n("<bb1 bb1 f1 eb2>").scale("bb:lydian").s("square").lpf(650).release(.25).gain(.5)
