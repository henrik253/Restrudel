setcpm(110/4)

$: s("bd ~ bd ~").bank("RolandTR909").gain(.8)

$: n("6 5 4 3 2 1 3 0@3 ~ -7 0 1 2 3").scale("c2:minor").s("sawtooth").lpf(500).gain(.5).release(.15)

$: n("f4 f4@2").scale("c2:minor").s("square").lpf(1800).resonance(4).gain(.4).release(.2)

$: n("0").scale("c2:minor").s("sine").lpf(1200).room(.6).gain(.12).release(.4)
