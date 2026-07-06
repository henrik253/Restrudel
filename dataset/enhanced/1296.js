setcpm(115/4)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.85)

$: s("bd:0 ~ bd:0 ~").gain(.3)

$: s("hh*8").gain(.16)

$: note("c3 eb3 g3 bb3 g#4 ~ f#4 f#4 ~ f4 f4 ~").s("supersaw").lpf(2200).resonance(6).release(.25).room(.4).delay(.3).gain(.3)

$: note("c2 eb2 g2 bb2").s("triangle").lpf(700).release(.25).gain(.45)
