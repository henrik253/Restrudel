setcpm(125/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("~ cp*4").gain(.5)

$: note("c4 cs4 ds4 f4 cs4@2").s("square").lpf(1500).release(.15).gain(.4)

$: note("c2 ~ g1 ~").s("sawtooth").lpf(500).gain(.5)
