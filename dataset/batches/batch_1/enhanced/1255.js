setcpm(122/4)

$: s("bd ~ bd ~").bank("RolandTR909").lpf(200).gain(.85)

$: s("~ cp:12 ~ cp:12").gain(.4).room(.3)

$: s("bongo*2 ~ bongo ~").s("triangle").delay(.5).gain(.25)

$: note("a3 c4 e4 c4 g4 e4 c4 a3").s("gm_distortion_guitar").lpf(1500).release(.2).gain(.35)

$: note("<a1 e2 a1 c2>").s("sawtooth").lpf(650).release(.25).gain(.5)
