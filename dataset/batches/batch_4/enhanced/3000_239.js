setcpm(100)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: note("c a").lpf(1500).gain(.4)

$: note("c5 c4 e4 g4 g4 b4 d5 ~").s("gm_harmonica gm_oboe:2").gain(.5).room(.8221).delay(.3).lpf(1500).gain(.4)

$: note("d5 e5").s("hh*16 hh*16 hh*16 hh*16").gain(1)
