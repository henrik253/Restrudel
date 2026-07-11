setcpm(100/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.8)

$: n("0 ~ 3 ~").scale("c2:minor").s("sawtooth").lpf(400).gain(.5).release(.1)

$: n("4 5 7 5 4 2 0 ~").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)
